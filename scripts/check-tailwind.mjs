/* --------------------------------------------------------------------------
   Regression check for the Phase 1 Tailwind integrations (see
   docs/COMPILER_PLAN.md). Builds a real Tailwind v3 project against
   tailmotion.config.cjs and a real Tailwind v4 project against
   dist/compiler/tailwind.css, then asserts the pruning behaviour measured
   during the feasibility spike still holds: used classes present, unused
   classes absent, every Phase-1 keyframe present unconditionally, and the
   mandatory token/reduced-motion base layer present.

   Tailwind v4's `@import "tailwindcss"` resolution walks up from the CSS
   file's own directory looking for node_modules/tailwindcss. This package's
   own devDependency is tailwindcss v3 (what the v3 fixture below needs), so
   a v4 fixture placed anywhere under this repo resolves to the wrong major.
   @tailwindcss/cli carries its own correctly isolated v4 copy nested under
   its own node_modules, so the v4 fixture is written and run from inside
   that package's directory instead. If that nesting shape ever changes,
   resolveBin()/require.resolve() below throws and this check fails loudly
   rather than silently passing.

   Run with `npm run check` (via check.mjs) or directly:
   node scripts/check-tailwind.mjs
   -------------------------------------------------------------------------- */

import { execFileSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);

const USED_ANIMATION_CLASSES = ['tm-fade-in', 'tm-press', 'tm-slide-up'];
const USED_STATIC_CLASSES = ['tm-gpu'];
const USED_TOKEN_CLASSES = ['tm-duration-300', 'tm-ease-snappy', 'tm-stagger-100'];
const UNUSED_CLASSES = ['tm-bounce', 'tm-morph', 'tm-hover-lift', 'tm-duration-400', 'tm-ease-linear'];

const fixtureHtml = () =>
  `<button class="${[...USED_ANIMATION_CLASSES, ...USED_STATIC_CLASSES, ...USED_TOKEN_CLASSES].join(
    ' '
  )}">Save</button>\n`;

const resolveBin = (pkgName) => {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);
  const pkg = require(pkgJsonPath);
  const bin = typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin)[0];
  return path.join(path.dirname(pkgJsonPath), bin);
};

const runCli = (bin, args, cwd) =>
  execFileSync('node', [bin, ...args], { cwd, encoding: 'utf8', stdio: 'pipe' });

const assertOutput = (label, css, keyframeNames) => {
  for (const name of [...USED_ANIMATION_CLASSES, ...USED_STATIC_CLASSES, ...USED_TOKEN_CLASSES]) {
    if (!css.includes(`.${name} {`) && !css.includes(`.${name},`)) {
      fail(`${label}: expected used class .${name} to be present, it was not.`);
    }
  }
  for (const name of UNUSED_CLASSES) {
    if (css.includes(`.${name} {`) || css.includes(`.${name},`)) {
      fail(`${label}: expected unused class .${name} to be absent, it was present.`);
    }
  }
  for (const name of keyframeNames) {
    if (!css.includes(`@keyframes ${name} {`)) {
      fail(`${label}: expected keyframe @keyframes ${name} to ship unconditionally, it was missing.`);
    }
  }
  if (!css.includes('--tm-ease-entrance') || !css.includes('--tm-glow-color')) {
    fail(`${label}: expected the mandatory token base layer to be present, it was not.`);
  }
  if (!css.includes('prefers-reduced-motion')) {
    fail(`${label}: expected the mandatory prefers-reduced-motion rule to be present, it was not.`);
  }
};

const checkTailwindV3 = async (keyframeNames) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'tm-check-v3-'));
  try {
    await writeFile(path.join(dir, 'index.html'), fixtureHtml());
    await writeFile(
      path.join(dir, 'input.css'),
      '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n'
    );
    await writeFile(
      path.join(dir, 'tailwind.config.js'),
      `module.exports = {\n  content: ["./index.html"],\n  plugins: [require(${JSON.stringify(
        path.join(rootDir, 'tailmotion.config.cjs')
      )})({ usageGenerated: true })],\n};\n`
    );
    const bin = resolveBin('tailwindcss');
    runCli(bin, ['-i', 'input.css', '-o', 'output.css'], dir);
    const css = await readFile(path.join(dir, 'output.css'), 'utf8');
    assertOutput('Tailwind v3', css, keyframeNames);
  } catch (error) {
    fail(`Tailwind v3 fixture build failed: ${error.stderr || error.message}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};

const checkTailwindV4 = async (keyframeNames) => {
  let cliPkgJson;
  try {
    cliPkgJson = require.resolve('@tailwindcss/cli/package.json');
  } catch {
    fail('Tailwind v4 fixture build failed: @tailwindcss/cli is not installed.');
    return;
  }
  const dir = path.join(path.dirname(cliPkgJson), '.tm-check-fixture');
  try {
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, 'index.html'), fixtureHtml());
    const tailwindCssPath = path.join(rootDir, 'dist', 'compiler', 'tailwind.css');
    await readFile(tailwindCssPath);
    const relative = path.relative(dir, tailwindCssPath).split(path.sep).join('/');
    await writeFile(path.join(dir, 'input.css'), `@import "tailwindcss";\n@import "${relative}";\n`);
    const bin = resolveBin('@tailwindcss/cli');
    runCli(bin, ['-i', 'input.css', '-o', 'output.css', '--content', 'index.html'], dir);
    const css = await readFile(path.join(dir, 'output.css'), 'utf8');
    assertOutput('Tailwind v4', css, keyframeNames);
  } catch (error) {
    fail(`Tailwind v4 fixture build failed: ${error.stderr || error.message}`);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
};
/* Guards against the plugin data drifting from itself as it's hand-edited:
   every animation-name a utility declares must have a matching keyframe, and
   every keyframe must be referenced by at least one utility (an orphan
   means a leftover or forgotten wiring, not a real class). This does not
   check the data against src/animations/*.css -- that comparison was done
   by hand when Phase 1 was written; this only catches drift introduced
   after that point. */
const checkCatalogueConsistency = (keyframes, utilities) => {
  const keyframeNames = new Set(Object.keys(keyframes));
  const referenced = new Set();

  /* A utility may drive its animation from a nested pseudo-element rather
     than from the element itself -- tm-glow and tm-ripple both paint on
     ::after so the loop stays on the compositor -- so collect animation-name
     from the whole declaration tree, not just its top level. */
  const animationNamesIn = (decls) => {
    const names = [];
    for (const [key, value] of Object.entries(decls)) {
      if (typeof value === 'object') names.push(...animationNamesIn(value));
      else if (key === 'animation-name') names.push(value);
    }
    return names;
  };

  for (const [selector, decls] of Object.entries(utilities)) {
    const names = animationNamesIn(decls);
    if (!names.length) {
      fail(`Catalogue: ${selector} has no animation-name.`);
      continue;
    }
    for (const name of names) {
      referenced.add(name);
      if (!keyframeNames.has(name)) {
        fail(`Catalogue: ${selector} references @keyframes ${name}, which does not exist.`);
      }
    }
  }

  for (const name of keyframeNames) {
    if (!referenced.has(name)) {
      fail(`Catalogue: @keyframes ${name} exists but no utility references it.`);
    }
  }
};

const checkGeneratedCssParses = async (cssPath) => {
  let postcss;
  try {
    postcss = require('postcss');
  } catch {
    fail('Catalogue: postcss is not installed; cannot validate dist/compiler/tailwind.css syntax.');
    return;
  }
  const css = await readFile(cssPath, 'utf8');
  try {
    postcss.parse(css);
  } catch (error) {
    fail(`dist/compiler/tailwind.css failed to parse as CSS: ${error.message}`);
  }
};

const run = async () => {
  /* @tailwindcss/oxide (the native engine @tailwindcss/cli depends on)
     declares "engines": { "node": ">=20" } and fails with an unhelpful
     native-binding error below that version -- catch it here with an
     actionable message instead. This is a devDependency-only requirement
     (declared in package.json's devEngines); it does not raise the
     package's own published engines.node. */
  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (nodeMajor < 20) {
    fail(
      `Node.js ${process.versions.node} detected. The Tailwind v4 fixture (@tailwindcss/cli) ` +
        'requires Node 20+; skip this check on an older Node, or switch versions to run it.'
    );
    console.error(`\n${failures.length} Tailwind fixture check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }

  const pluginPath = path.join(rootDir, 'tailmotion.config.cjs');
  const distTailwindCss = path.join(rootDir, 'dist', 'compiler', 'tailwind.css');

  try {
    await readFile(distTailwindCss);
  } catch {
    fail('dist/compiler/tailwind.css: missing. Run `npm run build` first.');
    console.error(`\n${failures.length} Tailwind fixture check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }

  const { SIMPLE_KEYFRAMES, SIMPLE_ANIMATION_UTILITIES } = require(pluginPath).__simple;
  const keyframeNames = Object.keys(SIMPLE_KEYFRAMES);

  checkCatalogueConsistency(SIMPLE_KEYFRAMES, SIMPLE_ANIMATION_UTILITIES);
  await checkGeneratedCssParses(distTailwindCss);

  await checkTailwindV3(keyframeNames);
  await checkTailwindV4(keyframeNames);

  if (failures.length) {
    console.error(`\n${failures.length} Tailwind fixture check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log('Tailwind v3 and v4 fixture checks passed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
