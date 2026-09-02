/* --------------------------------------------------------------------------
   Static checks over the built stylesheets.

   These encode the rules TailMotion has broken before, or would be easy to
   break silently:

     1. Every animation-name resolves to a real @keyframes block. Two classes
        shipped in 0.6 pointing at keyframes that did not exist.
     2. Nothing hides content outside a guard. A rule that sets opacity: 0 or
        visibility: hidden has to be reachable only when the element is in a
        closed state, or inside an @supports block that also says how it comes
        back. Otherwise an unsupported browser is left with invisible content.
     3. Timing tokens are never given a :root value, which would shadow every
        per-class default.
     4. --tm-exit-distance is not declared on :root, where calc() would freeze
        against the root --tm-distance instead of the element's.
     5. Every module that ships motion also ships a reduced-motion reset.
     6. Every prebuilt hover variant has a group-hover equivalent, so motion
        can run on a child without moving the pointer's hit target.

   Run with `npm run check`. Exits non-zero on failure.
   -------------------------------------------------------------------------- */

import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/* TM_CHECK_ROOT lets the negative tests point the same checks at a mutated
   copy of the output. */
const rootDir =
  process.env.TM_CHECK_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const notes = [];

const fail = (message) => failures.push(message);

/* Strip comments so their prose never trips a regex below. */
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');

/* A rule may hide its subject when the selector says the subject is closed. */
const CLOSED_STATE =
  /(data-state=|aria-expanded="false"|aria-pressed="false"|aria-checked="false"|tm-closed|:not\(:popover-open\)|:not\(\[open\]\)|tm-feedback-|popover\]|tm-native-dialog|tm-native-popover)/;

/* Recipes where the hidden element is one face of a pair that is always
   mounted, so something is on screen at every moment. Each entry names the
   visible counterpart, because that is the thing that makes it safe. */
const TWO_FACE_RECIPES = [
  ['.tm-icon-swap > * + *', 'the first icon is visible'],
  ['> :first-child', 'tm-icon-swap: the second icon is visible'],
  ['.tm-view-morph > [data-tm-panel]', 'the [data-tm-active] panel is visible'],
  ['.tm-flip-back', 'tm-flip: the front face is visible'],
  ['.tm-flip-front', 'tm-flip: the back face is visible'],
  ['.tm-shimmer-hover::after', 'decorative sweep over visible content'],
  ['tm-glow::after', 'tm-glow: a decorative halo over content that stays visible'],
  ['tm-ripple::after', 'tm-ripple: a decorative ring over content that stays visible'],
  ['.tm-dark-veil::after', 'decorative layer over visible content'],
  ['.tm-avatar-tooltip', 'a tooltip is hidden until hover by definition'],
  [
    '.tm-text-flip[data-tm-count] > .tm-text-flip-word',
    'tm-text-cycle: exactly one word in the stack is visible at a time, phased by :nth-child'
  ],
];

const findHidingRules = (css) => {
  const hits = [];
  /* Walk brace-balanced blocks, tracking which at-rules we are inside. */
  const stack = [];
  let i = 0;
  let chunkStart = 0;

  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') {
      /* Collapse the whole slice, not just its last line: the state contract
         selectors here run over a dozen lines. */
      const header = css.slice(chunkStart, i).replace(/\s+/g, ' ').trim();
      stack.push(header);
      chunkStart = i + 1;
      i += 1;
      continue;
    }
    if (ch === '}') {
      const header = stack.pop() ?? '';
      const body = css.slice(chunkStart, i);
      const guarded = stack.some((h) => h.startsWith('@supports') || h.startsWith('@keyframes'));
      const isFrame = stack.some((h) => h.startsWith('@keyframes'));
      const isStartingStyle = stack.some((h) => h.startsWith('@starting-style')) ||
        header.startsWith('@starting-style');

      if (
        !guarded &&
        !isFrame &&
        !isStartingStyle &&
        !header.startsWith('@') &&
        /(^|[;\s])(opacity:\s*0\b|visibility:\s*hidden)/.test(body) &&
        !CLOSED_STATE.test(header) &&
        !TWO_FACE_RECIPES.some(([selector]) => header.includes(selector))
      ) {
        hits.push(header.slice(0, 140));
      }
      chunkStart = i + 1;
      i += 1;
      continue;
    }
    i += 1;
  }
  return hits;
};

const checkStylesheet = async (relativePath, { expectReducedMotion = true } = {}) => {
  const absolute = path.join(rootDir, relativePath);
  const raw = await readFile(absolute, 'utf8');
  const css = stripComments(raw);

  // 1. animation-name resolves to a real @keyframes block.
  const defined = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const used = new Set();
  for (const m of css.matchAll(/animation-name:\s*([^;]+);/g)) {
    for (const name of m[1].replace(/!important/g, '').split(',')) {
      const trimmed = name.trim();
      if (trimmed && trimmed !== 'none' && !trimmed.startsWith('var(')) used.add(trimmed);
    }
  }
  for (const m of css.matchAll(/animation:\s*(tm-[\w-]+)/g)) used.add(m[1]);
  const missing = [...used].filter((name) => !defined.has(name));
  if (missing.length) {
    fail(`${relativePath}: animation-name with no @keyframes: ${missing.join(', ')}`);
  }

  // 2. Nothing hides content outside a guard or a closed state.
  const hiding = findHidingRules(css);
  if (hiding.length) {
    fail(
      `${relativePath}: rules hide content with no @supports guard and no closed state:\n    ` +
        hiding.join('\n    ')
    );
  }

  // 3 + 4. Root must not carry timing tokens or a derived exit distance.
  const rootBlocks = [...css.matchAll(/:root[^{]*\{([^}]*)\}/g)].map((m) => m[1]);
  for (const block of rootBlocks) {
    for (const token of ['--tm-duration', '--tm-delay', '--tm-easing', '--tm-iteration-count']) {
      if (new RegExp(`${token}\\s*:`).test(block)) {
        fail(`${relativePath}: :root sets ${token}, which shadows every per-class default`);
      }
    }
    if (/--tm-exit-distance\s*:/.test(block)) {
      fail(
        `${relativePath}: :root sets --tm-exit-distance; calc() there freezes against the root ` +
          `--tm-distance and ignores tm-distance-* further down the tree`
      );
    }
  }

  // 5. Reduced motion is handled.
  if (expectReducedMotion && !/@media\s*\(prefers-reduced-motion:\s*reduce\)/.test(css)) {
    fail(`${relativePath}: no prefers-reduced-motion block`);
  }

  const bytes = Buffer.byteLength(raw, 'utf8');
  const gzip = gzipSync(Buffer.from(raw, 'utf8')).length;
  notes.push(
    `${relativePath.padEnd(28)} ${(bytes / 1024).toFixed(1).padStart(7)} KB  ${(gzip / 1024)
      .toFixed(1)
      .padStart(6)} KB gzipped`
  );
};

const checkHoverVariantParity = async () => {
  const relativePath = 'src/animations/variants.css';
  const source = stripComments(await readFile(path.join(rootDir, relativePath), 'utf8'));
  const hover = new Set(
    [...source.matchAll(/\.hover\\:tm-([\w-]+):hover/g)].map((match) => match[1])
  );
  const groupHover = new Set(
    [...source.matchAll(/\.group:hover\s+\.group-hover\\:tm-([\w-]+)/g)].map(
      (match) => match[1]
    )
  );
  const missing = [...hover].filter((name) => !groupHover.has(name)).sort();

  if (missing.length) {
    fail(
      `${relativePath}: hover variants without a stable group-hover equivalent: ` +
        missing.map((name) => `tm-${name}`).join(', ')
    );
  }

  notes.push(
    `hover variant parity          ${String(hover.size).padStart(4)} hover classes have group-hover`
  );
};

/* --------------------------------------------------------------------------
   Documentation checks.

   The docs are the product's public surface, so the same rule applies to them
   as to the CSS: a broken cross-reference should fail the build, not wait for a
   reader to find it.
   -------------------------------------------------------------------------- */
const checkDocs = async () => {
  const { readdir } = await import('node:fs/promises');

  let config;
  try {
    config = JSON.parse(await readFile(path.join(rootDir, 'docs.json'), 'utf8'));
  } catch {
    fail('docs.json: missing or not valid JSON');
    return;
  }

  const pages = config.navigation.groups.flatMap((group) => group.pages);

  const walk = async (dir) => {
    const entries = await readdir(path.join(rootDir, dir), { withFileTypes: true });
    const out = [];
    for (const entry of entries) {
      const next = `${dir}/${entry.name}`;
      if (entry.isDirectory()) out.push(...(await walk(next)));
      else if (entry.name.endsWith('.mdx')) out.push(next.replace(/\.mdx$/, ''));
    }
    return out;
  };

  let onDisk;
  try {
    onDisk = await walk('docs');
  } catch {
    fail('docs/: missing');
    return;
  }

  for (const page of pages) {
    if (!onDisk.includes(page)) fail(`docs.json lists ${page}, which does not exist`);
  }
  for (const page of onDisk) {
    if (!pages.includes(page)) fail(`${page}.mdx exists but is not in docs.json navigation`);
  }

  for (const page of onDisk) {
    const source = await readFile(path.join(rootDir, `${page}.mdx`), 'utf8');

    const frontmatter = source.startsWith('---\n') ? source.split('---')[1] ?? '' : '';
    if (!/\ntitle:/.test(frontmatter) || !/\ndescription:/.test(frontmatter)) {
      fail(`${page}.mdx: frontmatter needs both a title and a description`);
    }

    for (const match of source.matchAll(/\]\((\/docs\/[^)#\s]*)(#[^)\s]*)?\)/g)) {
      const target = match[1].replace(/^\//, '').replace(/\/$/, '');
      if (!pages.includes(target)) {
        fail(`${page}.mdx: link to ${match[1]} does not resolve to a page`);
      }
    }
  }

  notes.push(`\ndocs                         ${String(pages.length).padStart(4)} pages, all linked`);
};

/* --------------------------------------------------------------------------
   Documented sizes.

   README.md and docs/reference/imports.mdx both quote raw and gzipped sizes.
   Between 0.8 and 0.10 the full bundle grew by 6% while the documented number
   stayed put, which is exactly the kind of claim support.mdx says is measured
   rather than estimated. This compares every quoted number against the file it
   describes and fails on a drift of more than 2%.
   -------------------------------------------------------------------------- */
const SIZE_TOLERANCE = 0.02;

const ENTRY_FILES = {
  'tailmotion/css': 'tailmotion.css',
  'tailmotion/profiles.css': 'modules/profiles.css',
  'tailmotion/presence.css': 'modules/presence.css',
  'tailmotion/native.css': 'modules/native.css',
  'tailmotion/recipes.css': 'modules/recipes.css',
  'tailmotion/scroll.css': 'modules/scroll.css',
  'tailmotion/choreography.css': 'modules/choreography.css',
};

const measure = async (relativePath) => {
  const raw = await readFile(path.join(rootDir, relativePath), 'utf8');
  const bytes = Buffer.byteLength(raw, 'utf8');
  return {
    raw: bytes / 1024,
    gzip: gzipSync(Buffer.from(raw, 'utf8')).length / 1024,
  };
};

const compareSize = (label, documented, actual, where) => {
  const drift = Math.abs(documented - actual) / actual;
  if (drift <= SIZE_TOLERANCE) return true;
  fail(
    `${where}: ${label} is documented as ${documented.toFixed(1)} KB but measures ` +
      `${actual.toFixed(1)} KB (${(drift * 100).toFixed(0)}% off). Update the number, or ` +
      'the claim stops being measured.'
  );
  return false;
};

const checkDocumentedSizes = async () => {
  const sizes = {};
  for (const [entry, relativePath] of Object.entries(ENTRY_FILES)) {
    sizes[entry] = await measure(relativePath);
  }
  let compared = 0;

  const importsPath = 'docs/reference/imports.mdx';
  const imports = await readFile(path.join(rootDir, importsPath), 'utf8');
  for (const match of imports.matchAll(
    /\|\s*`(tailmotion\/[\w.]+)`\s*\|\s*([\d.]+) KB\s*\|\s*([\d.]+) KB\s*\|/g
  )) {
    const [, entry, raw, gzip] = match;
    if (!sizes[entry]) {
      fail(`${importsPath}: size row for unknown entry ${entry}`);
      continue;
    }
    compareSize(`${entry} raw`, Number(raw), sizes[entry].raw, importsPath);
    compareSize(`${entry} gzipped`, Number(gzip), sizes[entry].gzip, importsPath);
    compared += 2;
  }

  const readmePath = 'README.md';
  const readme = await readFile(path.join(rootDir, readmePath), 'utf8');
  for (const match of readme.matchAll(
    /@import "(tailmotion\/[\w.]+)";\s*\/\*[^*]*?([\d.]+) KB/g
  )) {
    const [, entry, gzip] = match;
    if (!sizes[entry]) continue;
    compareSize(`${entry} gzipped`, Number(gzip), sizes[entry].gzip, readmePath);
    compared += 1;
  }

  /* Prose repeats the full-bundle number in both files; a table fix that
     leaves the sentences behind is the drift this catches. */
  for (const [label, source] of [[importsPath, imports], [readmePath, readme]]) {
    for (const match of source.matchAll(/([\d.]+) KB gzipped/g)) {
      compareSize('the full bundle, in prose', Number(match[1]), sizes['tailmotion/css'].gzip, label);
      compared += 1;
    }
  }

  if (!compared) fail('Documented sizes: no size claims found to check. Did the format change?');
  notes.push(
    `documented sizes             ${String(compared).padStart(4)} claims within ${SIZE_TOLERANCE * 100}% of measured`
  );
};

/* Confirms the files consumers actually need are inside the published
   tarball, without needing to publish or inspect it by hand. Catches a
   files/exports mismatch in package.json (e.g. a new build target that
   nothing in "files" covers) before it ships silently missing. */
const checkPackageContents = async () => {
  const { execFileSync } = await import('node:child_process');

  const REQUIRED_FILES = [
    'tailmotion.css',
    'modules/profiles.css',
    'modules/presence.css',
    'modules/native.css',
    'modules/recipes.css',
    'modules/scroll.css',
    'modules/choreography.css',
    'tailmotion.config.cjs',
    'dist/tailmotion.js',
    'dist/compiler/tailwind.css',
    'types/index.d.ts',
    'src/index.js',
  ];

  let packed;
  try {
    const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: rootDir,
      encoding: 'utf8',
    });
    packed = new Set(JSON.parse(output)[0].files.map((f) => f.path));
  } catch (error) {
    fail(`npm pack --dry-run failed: ${error.message}`);
    return;
  }

  for (const file of REQUIRED_FILES) {
    if (!packed.has(file)) {
      fail(`${file}: not present in \`npm pack\` output. Check "files" in package.json.`);
    }
  }

  /* Build artefacts that exist for this repository, not for consumers. The
     render cost manifest is 170 KB of analysis nobody installing a stylesheet
     needs, and "files" includes dist wholesale, so the exclusion is easy to
     lose. */
  const FORBIDDEN_FILES = ['dist/render-cost.json'];
  for (const file of FORBIDDEN_FILES) {
    if (packed.has(file)) {
      fail(
        `${file}: present in \`npm pack\` output. It is a build artefact for this ` +
          'repository, not something consumers install. Keep the "!" entry in "files".'
      );
    }
  }

  notes.push(`package                       ${String(packed.size).padStart(4)} files in the published tarball`);
};

const run = async () => {
  const files = [
    'tailmotion.css',
    'modules/profiles.css',
    'modules/presence.css',
    'modules/native.css',
    'modules/recipes.css',
    'modules/scroll.css',
    'modules/choreography.css',
  ];

  for (const file of files) {
    try {
      await stat(path.join(rootDir, file));
    } catch {
      fail(`${file}: missing. Run \`npm run build\` first.`);
      continue;
    }
    await checkStylesheet(file);
  }

  await checkHoverVariantParity();
  await checkDocumentedSizes();
  await checkDocs();
  await checkPackageContents();

  console.log(notes.join('\n'));

  if (failures.length) {
    console.error(`\n${failures.length} check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log('\nAll checks passed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
