import { Accessibility, ArrowRight, Braces, Github, RefreshCw } from 'lucide-react';
import { Explorer } from './Explorer';
import { Button, Code, CopyButton, Shell, streamWords } from '../lib/ui';

const GITHUB = 'https://github.com/moumen-soliman/tailmotion';

const PROOF = [
  {
    icon: Braces,
    label: 'Purpose-built',
    detail: 'Press, presence, toast and stagger encode the behavior — not animation plumbing.',
  },
  {
    icon: RefreshCw,
    label: 'State-aware',
    detail: 'Reads data-state and ARIA state, with transitions that reverse smoothly mid-flight.',
  },
  {
    icon: Accessibility,
    label: 'CSS-native',
    detail: 'Zero runtime in the core, logical RTL direction and reduced-motion handling included.',
  },
];

export function Hero({ variants }) {
  return (
    <section id="top" className="pt-12 sm:pt-16 lg:pt-20">
      <Shell>
        {/* Copy. One staggered entrance, on first paint only. */}
        <div className="tm-stagger min-w-0 max-w-[54ch] space-y-7 [--tm-stagger-step:90ms]">
          <div>
            <p className="font-mono text-overline uppercase text-accent">
              A motion language for product interfaces
            </p>
            <h1 className="tm-stream-text mt-4 text-balance text-display font-semibold text-ink-strong sm:text-display-lg">
              <span style={{ '--tm-stagger': 0 }}>Purposeful</span>{' '}
              <span style={{ '--tm-stagger': 1 }}>
                <span
                  className="text-accent tm-shimmer-text tm-duration-1600 leading-none"
                >
                  motion
                </span>
              </span>{' '}
              <span style={{ '--tm-stagger': 2 }}>that</span>{' '}
              <span style={{ '--tm-stagger': 3 }}>speaks</span>{' '}
              <span style={{ '--tm-stagger': 4 }}>Tailwind</span>
            </h1>
            <p
              className="tm-stream-text mt-5 text-pretty text-body-lg text-ink-muted"
              style={{ '--tm-stream-text-stagger-step': '18ms' }}
            >
              {streamWords(
                'Add tuned entrances, interruptible state transitions and product-ready recipes with composable classes. Tailwind owns the look. TailMotion owns how it moves.'
              )}
            </p>
          </div>

          <Code label="Add the behavior you mean" copyValue='<button class="tm-press">Save changes</button>'>
            {'<button class="tm-press">Save changes</button>'}
          </Code>

          <div className="grid grid-cols-2 items-center gap-2.5 sm:flex sm:flex-wrap">
            <Button
              as="a"
              href="/#explorer"
              variant="primary"
              size="lg"
              className="group col-span-2 w-full px-5 shadow-[0_1px_2px_rgb(0_0_0/0.14),0_6px_18px_-10px_rgb(0_0_0/0.45)] transition-[background-color,color,box-shadow] hover:shadow-[0_1px_2px_rgb(0_0_0/0.18),0_9px_24px_-11px_rgb(0_0_0/0.5)] sm:w-auto"
            >
              Explore the motion language
              <ArrowRight
                className="h-4 w-4 transition-transform duration-150 ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
                strokeWidth={1.75}
                aria-hidden
              />
            </Button>
            <CopyButton
              value="npm install tailmotion"
              label="Copy install"
              copiedLabel="Copied install"
              size="lg"
              variant="secondary"
              className="w-full bg-card/60 shadow-[0_1px_2px_rgb(0_0_0/0.06)] hover:bg-card sm:w-auto"
            />
            <Button
              as="a"
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              variant="ghost"
              size="lg"
              className="group w-full sm:w-auto"
            >
              <Github className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              View GitHub
            </Button>
          </div>
        </div>

        {/* The real explorer, right where visitors land. */}
        <div className="mt-12 lg:mt-16">
          <Explorer variants={variants} />
        </div>

        {/* Proof closes the hero as one responsive panel. */}
        <ul className="mt-12 grid grid-cols-1 divide-y divide-line overflow-hidden rounded-lg border border-line bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-16">
          {PROOF.map(({ icon: Icon, label, detail }) => (
            <li key={label} className="flex min-w-0 gap-3 p-4 sm:block sm:p-5 lg:flex">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-line-strong bg-page text-accent">
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-label font-medium text-ink-strong">{label}</p>
                <p className="mt-1 text-micro text-ink-muted">{detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Shell>
    </section>
  );
}
