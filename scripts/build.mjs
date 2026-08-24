import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const modulesDir = path.join(rootDir, 'modules');

/* The full stylesheet, plus the focused entries. Each focused entry is a real
   bundle boundary -- a project can take presence or scroll without the rest of
   the library -- so each one carries the shared token layer it depends on.
   Importing two of them therefore repeats that ~1KB block; importing
   "tailmotion/css" never does, because inlineCSS() only emits a file once per
   output. */
const targets = [
  { entry: path.join(srcDir, 'index.css'), out: path.join(rootDir, 'tailmotion.css') },
  { entry: path.join(srcDir, 'entries', 'profiles.css'), out: path.join(modulesDir, 'profiles.css') },
  { entry: path.join(srcDir, 'entries', 'presence.css'), out: path.join(modulesDir, 'presence.css') },
  { entry: path.join(srcDir, 'entries', 'native.css'), out: path.join(modulesDir, 'native.css') },
  { entry: path.join(srcDir, 'entries', 'recipes.css'), out: path.join(modulesDir, 'recipes.css') },
  { entry: path.join(srcDir, 'entries', 'scroll.css'), out: path.join(modulesDir, 'scroll.css') },
  { entry: path.join(srcDir, 'entries', 'choreography.css'), out: path.join(modulesDir, 'choreography.css') },
];

const readPackageVersion = async () => {
  try {
    const pkgRaw = await readFile(path.join(rootDir, 'package.json'), 'utf8');
    return JSON.parse(pkgRaw).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
};

/**
 * Inline @import statements depth-first.
 *
 * `stack` catches circular imports. `seen` is per output file: a shared
 * dependency such as shared/tokens.css is reached from several modules, and
 * emitting it more than once would ship duplicate :root blocks.
 */
const inlineCSS = async (filePath, stack = new Set(), seen = new Set()) => {
  const absolute = path.resolve(filePath);

  if (stack.has(absolute)) {
    throw new Error(`Circular @import detected at ${absolute}`);
  }

  stack.add(absolute);
  seen.add(absolute);
  const css = await readFile(absolute, 'utf8');
  const importRegex = /@import\s+["'](.+?)["'];?/g;
  let cursor = 0;
  let bundled = '';

  for (const match of css.matchAll(importRegex)) {
    const [statement, relativePath] = match;
    const start = match.index;
    bundled += css.slice(cursor, start);
    cursor = start + statement.length;

    const resolvedPath = path.resolve(path.dirname(absolute), relativePath);
    const relativeToRoot = path.relative(rootDir, resolvedPath);

    if (seen.has(resolvedPath)) {
      bundled += `\n/* --- ${relativeToRoot} (already inlined) --- */\n`;
      continue;
    }

    const nested = await inlineCSS(resolvedPath, stack, seen);
    bundled += `\n/* --- ${relativeToRoot} --- */\n${nested}\n`;
  }

  bundled += css.slice(cursor);
  stack.delete(absolute);
  return bundled.trimEnd();
};

/* Generate repetitive CSS rules.
   MAX_STAGGER_CHILDREN is a documented public limit: a stagger container
   sequences its first 20 children, and every child past that reuses the last
   delay so a long list lands together at the end rather than jumping to the
   front. Keep the README's stagger section in step with this number. */
const MAX_STAGGER_CHILDREN = 20;

const generators = {
  'stagger-indices': (count) => {
    const forward = Array.from(
      { length: count },
      (_, i) => `.tm-stagger > *:nth-child(${i + 1}) { --tm-stagger-index: ${i}; }`
    );
    forward.push(
      `.tm-stagger > *:nth-child(n + ${count + 1}) { --tm-stagger-index: ${count - 1}; }`
    );
    return forward.join('\n  ');
  },
  'stagger-indices-end': (count) => {
    const backward = Array.from(
      { length: count },
      (_, i) => `.tm-stagger > *:nth-last-child(${i + 1}) { --tm-stagger-index-end: ${i}; }`
    );
    backward.push(
      `.tm-stagger > *:nth-last-child(n + ${count + 1}) { --tm-stagger-index-end: ${count - 1}; }`
    );
    return backward.join('\n  ');
  },
};

// Process @generate: comments
const processGenerators = (css) => {
  return css.replace(/\/\*\s*@generate:([\w-]+):(\d+)\s*\*\//g, (_, name, count) => {
    const generator = generators[name];
    if (!generator) {
      console.warn(`Unknown generator: ${name}`);
      return `/* Unknown generator: ${name} */`;
    }
    return generator(parseInt(count, 10));
  });
};

const build = async () => {
  const version = await readPackageVersion();
  const generated = new Date().toISOString();
  await mkdir(modulesDir, { recursive: true });

  for (const { entry, out } of targets) {
    const rawCss = await inlineCSS(entry);
    const css = processGenerators(rawCss);
    const name = path.relative(rootDir, out);
    const banner = `/* TailMotion v${version} — ${name} | Generated ${generated} */`;
    await writeFile(out, `${banner}\n${css}\n`, 'utf8');
    const kb = (Buffer.byteLength(css, 'utf8') / 1024).toFixed(1);
    console.log(`Built ${name} (${kb} KB)`);
  }
};

build().catch((error) => {
  console.error('[tailmotion] Build failed');
  console.error(error);
  process.exitCode = 1;
});
