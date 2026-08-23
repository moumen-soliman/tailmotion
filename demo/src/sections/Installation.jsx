import { useState } from 'react';
import { Card, Chip, Code, CopyButton, Section, SectionHeading } from '../lib/ui';
import { AI_INSTALL_PROMPT } from '../lib/prompts';

/* --------------------------------------------------------------------------
   Installation.

   Three steps, three setups. The distinction between the full stylesheet and a
   per-animation import is stated plainly, because the numbers differ a lot.
   -------------------------------------------------------------------------- */

const SETUPS = [
  {
    id: 'v4',
    label: 'Tailwind v4',
    steps: [
      { label: 'Install', code: 'npm install tailmotion' },
      { label: 'Import', code: '@import "tailwindcss";\n@import "tailmotion/css";' },
      {
        label: 'Use',
        code: '<div class="motion-safe:tm-fade-in md:tm-slide-up">\n  Ready.\n</div>',
      },
    ],
  },
  {
    id: 'v3',
    label: 'Tailwind v3',
    steps: [
      { label: 'Install', code: 'npm install tailmotion' },
      {
        label: 'Import, and add the plugin for timing tokens',
        code:
          "// tailwind.config.js\nmodule.exports = {\n  plugins: [require('tailmotion/plugin')],\n};\n\n" +
          "/* your CSS */\n@tailwind base;\n@tailwind components;\n@tailwind utilities;\n@import 'tailmotion/css';",
      },
      {
        label: 'Use',
        code: '<div class="motion-safe:tm-fade-in md:tm-slide-up">\n  Ready.\n</div>',
      },
    ],
  },
  {
    id: 'standalone',
    label: 'Standalone CSS',
    steps: [
      { label: 'Install', code: 'npm install tailmotion' },
      {
        label: 'Link the stylesheet. No Tailwind required.',
        code: '<link rel="stylesheet" href="node_modules/tailmotion/tailmotion.css" />',
      },
      {
        label: 'Use',
        code: '<div class="motion-safe:tm-fade-in md:tm-slide-up">\n  Ready.\n</div>',
      },
    ],
  },
];

export function Installation({ variants }) {
  const [setup, setSetup] = useState('v4');
  const active = SETUPS.find((item) => item.id === setup);

  const variantList = [
    'hover',
    'focus',
    'focus-visible',
    'active',
    'focus-within',
    'group-hover',
    'motion-safe',
  ];
  const covered = variantList
    .map((name) => ({ name, count: variants[name]?.size ?? 0 }))
    .filter((item) => item.count > 0);
  const breakpoints = [...variants.breakpoints];

  return (
    <Section id="install">
      <SectionHeading eyebrow="Install" title="Three steps, whichever setup you are on">
        The plugin is optional: it adds the timing, easing, stagger and distance token utilities with
        theme configuration and arbitrary values. The animations themselves come from the stylesheet.
      </SectionHeading>

      <Card className="mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-overline uppercase text-accent">Install with AI</p>
          <h3 className="mt-2 text-heading font-medium text-ink-strong">
            Let your coding agent configure TailMotion
          </h3>
          <p className="mt-1.5 max-w-measure text-label text-ink-muted">
            Copy a prompt that detects Tailwind v3 or v4, your package manager, and React, Vue,
            Svelte, Astro, or web-capable native setups before changing files.
          </p>
        </div>
        <CopyButton
          value={AI_INSTALL_PROMPT}
          label="Copy AI install prompt"
          copiedLabel="Prompt copied"
          size="md"
          variant="primary"
          ariaLabel="Copy the TailMotion AI installation prompt"
        />
      </Card>

      <div className="mt-6 lg:mt-8">
        <div className="rail -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist" aria-label="Setup">
          {SETUPS.map((item) => (
            <Chip
              key={item.id}
              role="tab"
              aria-selected={setup === item.id}
              selected={setup === item.id}
              onClick={() => setSetup(item.id)}
            >
              {item.label}
            </Chip>
          ))}
        </div>

        <ol className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5">
          {active.steps.map((step, index) => (
            <li key={step.label} className="min-w-0">
              <div className="mb-2 flex items-baseline gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line-strong bg-card-hover font-mono text-overline text-ink">
                  {index + 1}
                </span>
                <span className="text-label text-ink-muted">{step.label}</span>
              </div>
              <Code copyValue={step.code}>
                {step.code}
              </Code>
            </li>
          ))}
        </ol>

        {/* Verified facts, read from the stylesheet that is loaded right now. */}
        <Card className="mt-6 grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:mt-8">
          <div className="min-w-0">
            <h3 className="text-label font-medium text-ink">Which variants ship in the CSS</h3>
            <p className="mt-1.5 text-label text-ink-muted">
              The standalone stylesheet hand-writes variant selectors for a curated subset of
              animations, not for every class. Counted from the stylesheet on this page:
            </p>
            <ul dir="ltr" className="mt-3 space-y-1 font-mono text-micro text-ink-muted">
              {covered.map((item) => (
                <li key={item.name}>
                  <span className="text-ink">{item.name}:</span> {item.count} classes
                </li>
              ))}
              {breakpoints.length ? (
                <li>
                  <span className="text-ink">breakpoints:</span> {breakpoints.join(', ')}
                </li>
              ) : null}
            </ul>
            <p className="mt-3 text-micro text-ink-muted">
              With Tailwind in the project you can also write your own variant of any class, since
              Tailwind generates the selector.
            </p>
          </div>

          <div className="min-w-0">
            <h3 className="text-label font-medium text-ink">Full stylesheet, or one file at a time</h3>
            <p className="mt-1.5 text-label text-ink-muted">
              <code className="font-mono text-ink-muted">tailmotion/css</code> is the whole library in
              one file: 127.5 KB as shipped, 94.5 KB minified, 9.8 KB gzipped. It is not tree-shaken
              — importing it gives you every class, whether or not you use it.
            </p>
            <p className="mt-3 text-label text-ink-muted">
              For a handful of animations, import the individual files instead and let your bundler
              keep only those:
            </p>
            <Code className="mt-3" copyValue={"@import 'tailmotion/animations/base.css';\n@import 'tailmotion/animations/fade.css';\n@import 'tailmotion/animations/interactions.css';"}>
              {"@import 'tailmotion/animations/base.css';\n@import 'tailmotion/animations/fade.css';\n@import 'tailmotion/animations/interactions.css';"}
            </Code>
            <p className="mt-2 text-micro text-ink-muted">
              Keep <code className="font-mono">base.css</code>: it carries the shared tokens, the
              right-to-left mirroring and the reduced-motion rule. Per-file imports do not include
              the pre-written variant selectors.
            </p>
          </div>
        </Card>
      </div>
    </Section>
  );
}
