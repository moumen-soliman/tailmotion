import { ArrowRight, Github } from 'lucide-react';
import { MotionLab } from './MotionLab';
import { Button, Code, CopyButton, Shell } from '../lib/ui';

const GITHUB = 'https://github.com/moumen-soliman/tailmotion';

const PROOF = [
  { label: 'Pure CSS', detail: 'No JavaScript behind any keyframe or transition class.' },
  { label: 'Framework agnostic', detail: 'One stylesheet. React, Vue, Svelte or plain HTML.' },
  { label: 'Reduced-motion ready', detail: 'Honors prefers-reduced-motion out of the box.' },
];

export function Hero({ variants }) {
  return (
    <section id="top" className="pt-12 sm:pt-16 lg:pt-20">
      <Shell>
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.06fr)] lg:gap-16">
          {/* Copy. One staggered entrance, on first paint only. */}
          <div className="tm-stagger min-w-0 space-y-7 [--tm-stagger-step:90ms]">
            <div>
              <h1 className="text-balance text-display font-semibold text-ink-strong sm:text-display-lg">
                Motion that speaks Tailwind
              </h1>
              <p className="mt-5 max-w-measure text-pretty text-body-lg text-ink-muted">
                Polished CSS animations.
                <br className="hidden sm:inline" /> One class. Zero runtime.
              </p>
            </div>

            <Code label="Drop it on anything" copyValue='<div class="tm-pop tm-duration-300">...</div>'>
              {'<div class="tm-pop tm-duration-300">...</div>'}
            </Code>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button as="a" href="#lab" variant="primary">
                Try playground
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
              <CopyButton
                value="npm install tailmotion"
                label="Copy install"
                copiedLabel="Copied install"
                size="md"
                variant="secondary"
              />
              <Button as="a" href={GITHUB} target="_blank" rel="noreferrer" variant="ghost">
                <Github className="h-4 w-4" aria-hidden />
                View on GitHub
              </Button>
            </div>
          </div>

          {/* The lab itself. Stacks under the copy on mobile. */}
          <div id="lab" className="min-w-0">
            <MotionLab variants={variants} />
          </div>
        </div>

        {/* Proof strip spans both columns, giving the section one closing edge
            instead of leaving a ragged gap beside the taller lab. */}
        <ul className="mt-12 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-line pt-8 sm:grid-cols-3 lg:mt-16">
          {PROOF.map((item) => (
            <li key={item.label} className="min-w-0">
              <p className="text-label font-medium text-ink">{item.label}</p>
              <p className="mt-1 text-micro text-ink-muted">{item.detail}</p>
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}
