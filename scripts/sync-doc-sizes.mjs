/* --------------------------------------------------------------------------
   Rewrites every documented size in README.md and docs/reference/imports.mdx
   from the built stylesheets.

   check.mjs fails the build when a documented size drifts more than 2% from
   the file it describes. This is the other half: run it and the numbers are
   correct again, so nobody has to transcribe seven pairs of measurements by
   hand and nobody has to guess which sentence still holds the old one.

   node scripts/sync-doc-sizes.mjs
   -------------------------------------------------------------------------- */

import { readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const ENTRY_FILES = {
  'tailmotion/css': 'tailmotion.css',
  'tailmotion/profiles.css': 'modules/profiles.css',
  'tailmotion/presence.css': 'modules/presence.css',
  'tailmotion/native.css': 'modules/native.css',
  'tailmotion/recipes.css': 'modules/recipes.css',
  'tailmotion/scroll.css': 'modules/scroll.css',
  'tailmotion/choreography.css': 'modules/choreography.css',
};

const kb = (n) => (n / 1024).toFixed(1);

const run = async () => {
  const sizes = {};
  for (const [entry, relativePath] of Object.entries(ENTRY_FILES)) {
    const source = await readFile(path.join(rootDir, relativePath), 'utf8');
    sizes[entry] = {
      raw: kb(Buffer.byteLength(source, 'utf8')),
      gzip: kb(gzipSync(Buffer.from(source, 'utf8')).length),
    };
  }
  const full = sizes['tailmotion/css'].gzip;
  const edits = [];

  const importsPath = path.join(rootDir, 'docs/reference/imports.mdx');
  let imports = await readFile(importsPath, 'utf8');
  imports = imports.replace(
    /(\|\s*`(tailmotion\/[\w.]+)`\s*\|\s*)[\d.]+( KB\s*\|\s*)[\d.]+( KB\s*\|)/g,
    (match, head, entry, mid, tail) => {
      if (!sizes[entry]) return match;
      edits.push(entry);
      return `${head}${sizes[entry].raw}${mid}${sizes[entry].gzip}${tail}`;
    }
  );
  imports = imports.replace(/[\d.]+ KB gzipped/g, `${full} KB gzipped`);
  await writeFile(importsPath, imports, 'utf8');

  const readmePath = path.join(rootDir, 'README.md');
  let readme = await readFile(readmePath, 'utf8');
  readme = readme.replace(
    /(@import "(tailmotion\/[\w.]+)";\s*\/\*[^*]*?)[\d.]+( KB)/g,
    (match, head, entry, tail) => {
      if (!sizes[entry]) return match;
      edits.push(entry);
      return `${head}${sizes[entry].gzip}${tail}`;
    }
  );
  readme = readme.replace(/[\d.]+ KB gzipped/g, `${full} KB gzipped`);
  await writeFile(readmePath, readme, 'utf8');

  console.log(`Synced ${edits.length} documented sizes. Full bundle: ${full} KB gzipped.`);
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
