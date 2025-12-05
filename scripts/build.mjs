import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const entryFile = path.join(srcDir, 'index.css');
const outputFile = path.join(rootDir, 'tailmotion.css');

const readPackageVersion = async () => {
  try {
    const pkgRaw = await readFile(path.join(rootDir, 'package.json'), 'utf8');
    return JSON.parse(pkgRaw).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
};

const inlineCSS = async (filePath, stack = new Set()) => {
  const absolute = path.resolve(filePath);

  if (stack.has(absolute)) {
    throw new Error(`Circular @import detected at ${absolute}`);
  }

  stack.add(absolute);
  const css = await readFile(absolute, 'utf8');
  const importRegex = /@import\s+["'](.+?)["'];?/g;
  let cursor = 0;
  let bundled = '';

  for (const match of css.matchAll(importRegex)) {
    const [statement, relativePath] = match;
    const start = match.index;
    bundled += css.slice(cursor, start);

    const resolvedPath = path.resolve(path.dirname(absolute), relativePath);
    const nested = await inlineCSS(resolvedPath, stack);
    bundled += `\n/* --- ${path.relative(rootDir, resolvedPath)} --- */\n${nested}\n`;

    cursor = start + statement.length;
  }

  bundled += css.slice(cursor);
  stack.delete(absolute);
  return bundled.trimEnd();
};

const build = async () => {
  const [version, css] = await Promise.all([readPackageVersion(), inlineCSS(entryFile)]);
  const banner = `/* TailMotion v${version} | Generated ${new Date().toISOString()} */`;
  const output = `${banner}\n${css}\n`;

  await writeFile(outputFile, output, 'utf8');
  console.log(`Built ${path.relative(rootDir, outputFile)}`);
};

build().catch((error) => {
  console.error('[tailmotion] Build failed');
  console.error(error);
  process.exitCode = 1;
});


