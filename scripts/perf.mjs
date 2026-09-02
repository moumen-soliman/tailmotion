/* --------------------------------------------------------------------------
   Measures what the render cost check asserts.

   check-render-cost.mjs proves, statically, that no looping class animates a
   property outside the compositor. That is the cause. This measures the
   effect: it traces a real Chromium, counts Paint and RasterTask events per
   second for each looping class, and fails when a class the manifest calls
   compositor-only paints anyway.

   Deliberately NOT part of `npm run check`: it needs Playwright and its
   browser binaries, which is a several-hundred-megabyte install that every
   contributor should opt into rather than inherit.

     npm i -D playwright && npx playwright install chromium
     npm run perf
     npm run perf -- --update    # rewrite the committed baseline

   Numbers vary by machine, so the pass/fail rule is about paint events, which
   are either there or not, rather than about wall-clock timings.
   -------------------------------------------------------------------------- */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = path.join(rootDir, 'verify', 'perf-baseline.json');
const SAMPLE_MS = 3000;
const COPIES = 20;

/* A class is failing if it paints more than twice a second while looping.
   Zero would be the honest target, but a scrollbar or a caret blink elsewhere
   on the page can contribute a stray event. */
const PAINTS_PER_SECOND_LIMIT = 2;

const loadPlaywright = async () => {
  try {
    return await import('playwright');
  } catch {
    console.error(
      'Playwright is not installed, so there is nothing to measure with.\n\n' +
        '  npm i -D playwright && npx playwright install chromium\n\n' +
        'The static guarantee is checked without it, by `npm run check`. This script\n' +
        'only confirms the browser agrees.'
    );
    return null;
  }
};

const loopingClasses = async () => {
  const manifest = JSON.parse(await readFile(path.join(rootDir, 'dist/render-cost.json'), 'utf8'));
  const seen = new Map();
  for (const record of manifest.classes) {
    if (!record.loops) continue;
    /* One entry per class, and skip the prebuilt variants: they animate the
       same keyframes as the class they are named after. */
    if (record.selector.includes('\\:')) continue;
    if (!seen.has(record.id)) {
      seen.set(record.id, { id: record.id, tier: record.tier, allowlisted: record.allowlisted });
    }
  }
  return [...seen.values()];
};

/* Classes that are modifiers rather than standalone: the dark veil layers
   override the background and animation of a ::before whose content, position
   and inset come from tm-dark-veil itself. On their own they generate no box
   at all, and measuring them alone reports a confident zero for an element
   that was never animating. */
const COMPANIONS = {
  'tm-dark-veil-layer-1': 'tm-dark-veil',
  'tm-dark-veil-layer-2': 'tm-dark-veil',
  'tm-dark-veil-layer-3': 'tm-dark-veil',
  'tm-dark-veil-noise': 'tm-dark-veil',
};

/* Classes that need real structure rather than a div with a class on it. */
const MARKUP = {
  'tm-shimmer-text-sweep': (i) =>
    `<p class="cell tm-shimmer-text">item ${i}<span class="tm-shimmer-text-sweep" aria-hidden="true"><span>item ${i}</span></span></p>`,
};

const cellFor = (className, i) => {
  if (MARKUP[className]) return MARKUP[className](i);
  const companion = COMPANIONS[className] ? `${COMPANIONS[className]} ` : '';
  return `<div class="cell ${companion}${className}">item ${i}</div>`;
};

/* A page holding COPIES elements of one class, and nothing else that moves.

   The fixture's own styles sit in a cascade layer declared *below* the
   library's. Unlayered rules beat every layered rule regardless of
   specificity, so an unlayered `.cell { background: … }` silently removed the
   gradient that tm-shimmer-text animates, and the class then reported zero
   paints while appearing to run. The layer statement has to come before the
   library's CSS, because layer order is fixed by first declaration. */
const pageFor = (className, css) => `<!doctype html>
<html><head><meta charset="utf-8">
<style>@layer fixture, base, utilities;</style>
<style>${css}</style>
<style>
  @layer fixture {
    body { margin: 0; padding: 16px; font: 600 20px/1.6 system-ui, sans-serif; background: #101014; color: #fff; }
    .cell { width: 220px; height: 44px; display: inline-grid; place-items: center; margin: 10px; background: #2563eb; border-radius: 10px; }
  }
</style></head>
<body>${Array.from({ length: COPIES }, (_, i) => cellFor(className, i)).join('')}</body></html>`;

const countPaintEvents = async (client, page, html) => {
  await page.setContent(html, { waitUntil: 'load' });
  await page.waitForTimeout(600); // let the first paint and layer promotion settle

  await client.send('Tracing.start', {
    categories: 'disabled-by-default-devtools.timeline',
    transferMode: 'ReturnAsStream',
  });
  await page.waitForTimeout(SAMPLE_MS);

  const done = new Promise((resolve) => client.once('Tracing.tracingComplete', resolve));
  await client.send('Tracing.end');
  const { stream } = await done;

  let raw = '';
  for (;;) {
    const chunk = await client.send('IO.read', { handle: stream });
    raw += chunk.data;
    if (chunk.eof) break;
  }
  await client.send('IO.close', { handle: stream });

  const events = JSON.parse(raw).traceEvents ?? [];
  const counts = { Paint: 0, RasterTask: 0, UpdateLayoutTree: 0, Layout: 0 };
  for (const event of events) {
    if (event.name in counts) counts[event.name] += 1;
  }
  return counts;
};

const run = async () => {
  const playwright = await loadPlaywright();
  if (!playwright) return;

  const update = process.argv.includes('--update');
  const css = await readFile(path.join(rootDir, 'tailmotion.css'), 'utf8');
  const classes = await loopingClasses();

  let baseline = {};
  try {
    baseline = JSON.parse(await readFile(BASELINE, 'utf8')).classes ?? {};
  } catch {
    console.log('No committed baseline yet. Run with --update to write one.');
  }

  const browser = await playwright.chromium.launch();
  const page = await browser.newPage();
  const client = await page.context().newCDPSession(page);
  const failures = [];
  const measured = {};

  console.log(
    `${'class'.padEnd(26)}${'tier'.padEnd(13)}${'paints/s'.padStart(9)}${'rasters/s'.padStart(11)}`
  );

  for (const entry of classes) {
    const counts = await countPaintEvents(client, page, pageFor(entry.id, css));
    const perSecond = (n) => +(n / (SAMPLE_MS / 1000)).toFixed(1);
    const result = {
      tier: entry.tier,
      allowlisted: entry.allowlisted,
      paintsPerSecond: perSecond(counts.Paint),
      rastersPerSecond: perSecond(counts.RasterTask),
    };
    measured[entry.id] = result;

    console.log(
      entry.id.padEnd(26) +
        entry.tier.padEnd(13) +
        String(result.paintsPerSecond).padStart(9) +
        String(result.rastersPerSecond).padStart(11)
    );

    const claimsCompositor = entry.tier === 'compositor' || entry.tier === 'discrete';
    if (claimsCompositor && result.paintsPerSecond > PAINTS_PER_SECOND_LIMIT) {
      failures.push(
        `${entry.id} is compositor-only in dist/render-cost.json but painted ` +
          `${result.paintsPerSecond} times a second with ${COPIES} copies on screen.`
      );
    }

    const previous = baseline[entry.id];
    if (previous && result.paintsPerSecond > previous.paintsPerSecond * 1.5 + 1) {
      failures.push(
        `${entry.id} regressed: ${previous.paintsPerSecond} paints/s in the baseline, ` +
          `${result.paintsPerSecond} now.`
      );
    }
  }

  await browser.close();

  /* The control group. Classes the manifest calls paint-tier are known to
     repaint; if one of them reports zero, the fixture did not exercise it and
     every zero on this run is meaningless, including the compositor ones. A
     green result with a silent control is the failure mode this catches. */
  const controls = classes.filter((c) => c.tier === 'paint');
  const silent = controls.filter((c) => measured[c.id].paintsPerSecond === 0);
  if (!controls.length) {
    failures.push(
      'No paint-tier loop to use as a control. Without one, a run of zeroes cannot be ' +
        'told apart from a fixture that never ran.'
    );
  } else if (silent.length) {
    failures.push(
      `Inconclusive: ${silent.map((c) => c.id).join(', ')} ${silent.length === 1 ? 'is' : 'are'} ` +
        'paint-tier and should repaint, but registered no paints. The fixture is not ' +
        'exercising the class, so the zeroes elsewhere prove nothing. Check the markup and ' +
        'the cascade layers in pageFor() before trusting this run.'
    );
  }

  if (update) {
    await writeFile(
      BASELINE,
      `${JSON.stringify(
        { sampleMs: SAMPLE_MS, copies: COPIES, note: 'Machine-dependent. Paint counts, not timings, are the signal.', classes: measured },
        null,
        2
      )}\n`,
      'utf8'
    );
    console.log(`\nBaseline written to ${path.relative(rootDir, BASELINE)}.`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} performance check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log('\nEvery compositor-only loop stayed off the paint path.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
