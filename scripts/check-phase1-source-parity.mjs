/* --------------------------------------------------------------------------
   Source parity for the Phase 1 usage-generated catalogue (see
   docs/COMPILER_PLAN.md and scripts/check-tailwind.mjs).

   check-tailwind.mjs's checkCatalogueConsistency only validates the
   hand-transcribed JS in tailmotion.config.cjs against itself (every
   animation-name has a matching keyframe, and vice versa). It cannot catch
   the actual failure mode: someone retunes a duration or keyframe in
   src/animations/*.css and forgets the transcribed copy, so the plugin and
   `tailmotion/tailwind.css` silently keep shipping the old value while
   every other check still passes.

   This checks the opposite direction: every declaration value in the
   transcribed data must appear, verbatim after whitespace normalization, in
   the source file PHASE1_SOURCES says it came from. It does not parse CSS or
   confirm the value sits under the *correct* selector in that file -- only
   that the exact value text still exists somewhere in it. That is enough to
   catch a retune (the old value stops appearing at all) without needing a
   CSS parser; a value that happened to move to an unrelated property in the
   same file is the one drift case this would miss.

   Run with `npm run check` (via check.mjs) or directly:
   node scripts/check-phase1-source-parity.mjs
   -------------------------------------------------------------------------- */

import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);

/* Selector key -> source file, exactly as each key appears in
   tailmotion.config.cjs's SIMPLE_ANIMATION_UTILITIES / SIMPLE_TRANSITION_UTILITIES
   / SIMPLE_STATIC_UTILITIES. Update alongside any Phase 1 addition. */
const UTILITY_SOURCES = {
  '.tm-fade-in': 'src/animations/fade.css',
  '.tm-fade-out': 'src/animations/exit.css',
  '.tm-pop': 'src/animations/pop.css',
  '.tm-bounce': 'src/animations/bounce.css',
  '.tm-pulse': 'src/animations/pulse.css',
  '.tm-spin': 'src/animations/spin.css',
  '.tm-float': 'src/animations/float.css',
  '.tm-drift': 'src/animations/drift.css',
  '.tm-shake': 'src/animations/shake.css',
  '.tm-wiggle': 'src/animations/wiggle.css',
  '.tm-glow': 'src/animations/glow.css',
  '.tm-morph': 'src/animations/morph.css',
  '.tm-sway': 'src/animations/sway.css',
  '.tm-ripple': 'src/animations/ripple.css',
  '.tm-elastic': 'src/animations/elastic.css',
  '.tm-blur-in': 'src/animations/blur-in.css',
  '.tm-blur-out': 'src/animations/exit.css',
  '.tm-rotate-in': 'src/animations/rotate.css',
  '.tm-slide-block-start, .tm-slide-up': 'src/animations/slide.css',
  '.tm-slide-block-end, .tm-slide-down': 'src/animations/slide.css',
  '.tm-slide-inline-start, .tm-slide-left': 'src/animations/slide.css',
  '.tm-slide-inline-end, .tm-slide-right': 'src/animations/slide.css',
  '.tm-slide-block-out': 'src/animations/exit.css',
  '.tm-slide-inline-out': 'src/animations/exit.css',
  '.tm-drop, .tm-drop-in': 'src/animations/drop.css',
  '.tm-scale-in': 'src/animations/zoom.css',
  '.tm-scale-out': 'src/animations/exit.css',
  '.tm-zoom-in': 'src/animations/zoom.css',
  '.tm-zoom-in-slow': 'src/animations/zoom.css',
  '.tm-zoom-out': 'src/animations/zoom.css',
  '.tm-press': 'src/animations/interactions.css',
  '.tm-hover-lift, .tm-lift-hover': 'src/animations/interactions.css',
  '.tm-hover-scale': 'src/animations/interactions.css',
  '.tm-rotate-hover': 'src/animations/rotate.css',
  '.tm-rotate-press': 'src/animations/rotate.css',
  '.tm-perspective': 'src/animations/base.css',
  '.tm-3d': 'src/animations/base.css',
  '.tm-gpu': 'src/animations/base.css',
  '.tm-motion-paused': 'src/animations/base.css',
  '.tm-motion-running': 'src/animations/base.css',
  '.tm-motion-reset': 'src/animations/base.css',
};

/* @keyframes name -> source file. tm-zoom-in-slow has no entry here: it
   reuses the tm-zoom-in keyframe, checked once under that name. */
const KEYFRAME_SOURCES = {
  'tm-fade-in': 'src/animations/fade.css',
  'tm-fade-out': 'src/animations/exit.css',
  'tm-pop': 'src/animations/pop.css',
  'tm-bounce': 'src/animations/bounce.css',
  'tm-pulse': 'src/animations/pulse.css',
  'tm-spin': 'src/animations/spin.css',
  'tm-float': 'src/animations/float.css',
  'tm-drift': 'src/animations/drift.css',
  'tm-shake': 'src/animations/shake.css',
  'tm-wiggle': 'src/animations/wiggle.css',
  'tm-glow': 'src/animations/glow.css',
  'tm-morph': 'src/animations/morph.css',
  'tm-sway': 'src/animations/sway.css',
  'tm-ripple': 'src/animations/ripple.css',
  'tm-ripple-ring': 'src/animations/ripple.css',
  'tm-elastic': 'src/animations/elastic.css',
  'tm-blur-in': 'src/animations/blur-in.css',
  'tm-blur-out': 'src/animations/exit.css',
  'tm-rotate-in': 'src/animations/rotate.css',
  'tm-slide-block-start': 'src/animations/slide.css',
  'tm-slide-block-end': 'src/animations/slide.css',
  'tm-slide-inline-start': 'src/animations/slide.css',
  'tm-slide-inline-end': 'src/animations/slide.css',
  'tm-slide-block-out': 'src/animations/exit.css',
  'tm-slide-inline-out': 'src/animations/exit.css',
  'tm-drop-in': 'src/animations/drop.css',
  'tm-scale-in': 'src/animations/zoom.css',
  'tm-scale-out': 'src/animations/exit.css',
  'tm-zoom-in': 'src/animations/zoom.css',
  'tm-zoom-out': 'src/animations/zoom.css',
};

/* Collapses whitespace, then whitespace directly against a paren -- long
   calc() expressions in src/animations/*.css often break the line exactly at
   "(" or ")", which a plain whitespace collapse leaves as a stray space that
   would otherwise cause an identical value to miss a verbatim match. */
const normalize = (text) =>
  text
    .replace(/\s+/g, ' ')
    .replace(/\(\s+/g, '(')
    .replace(/\s+\)/g, ')')
    .trim();

/* Walks a declarations object (possibly with nested `&...`/percentage-keyed
   sub-objects) down to its leaf property: value pairs. */
const collectDeclarations = (rules) => {
  const decls = [];
  for (const [key, value] of Object.entries(rules)) {
    if (typeof value === 'object') {
      decls.push(...collectDeclarations(value));
    } else {
      decls.push({ property: key, value });
    }
  }
  return decls;
};

const fileCache = new Map();
const readSource = async (relPath) => {
  if (!fileCache.has(relPath)) {
    try {
      fileCache.set(relPath, normalize(await readFile(path.join(rootDir, relPath), 'utf8')));
    } catch {
      fileCache.set(relPath, null);
    }
  }
  return fileCache.get(relPath);
};

const checkGroup = async (label, entries, sourceMap) => {
  for (const [key, body] of Object.entries(entries)) {
    const sourcePath = sourceMap[key];
    if (!sourcePath) {
      fail(`Source parity: no entry in ${label}_SOURCES for ${key} -- add one in scripts/check-phase1-source-parity.mjs.`);
      continue;
    }
    const source = await readSource(sourcePath);
    if (source == null) {
      fail(`Source parity: ${sourcePath} not found (mapped from ${key}).`);
      continue;
    }
    for (const { property, value } of collectDeclarations(body)) {
      const needle = normalize(`${property}: ${value};`);
      if (!source.includes(needle)) {
        fail(
          `Source parity: ${key} declares "${property}: ${value}" not found verbatim in ${sourcePath}. ` +
            'Either the source was retuned and the transcribed copy in tailmotion.config.cjs is stale, ' +
            'or this mapping is wrong.'
        );
      }
    }
  }
};

const run = async () => {
  const pluginPath = path.join(rootDir, 'tailmotion.config.cjs');
  const { SIMPLE_KEYFRAMES, SIMPLE_ANIMATION_UTILITIES, SIMPLE_TRANSITION_UTILITIES, SIMPLE_STATIC_UTILITIES } =
    require(pluginPath).__simple;

  await checkGroup('KEYFRAME', SIMPLE_KEYFRAMES, KEYFRAME_SOURCES);
  await checkGroup('UTILITY', SIMPLE_ANIMATION_UTILITIES, UTILITY_SOURCES);
  await checkGroup('UTILITY', SIMPLE_TRANSITION_UTILITIES, UTILITY_SOURCES);
  await checkGroup('UTILITY', SIMPLE_STATIC_UTILITIES, UTILITY_SOURCES);

  if (failures.length) {
    console.error(`\n${failures.length} Phase 1 source parity check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log('Phase 1 source parity check passed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
