import { Accessibility, ArrowRight, Braces, Github, RefreshCw } from 'lucide-react';
import { Explorer } from './Explorer';
import { Button, Code, CopyButton, Shell } from '../lib/ui';

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
            <h1 className="mt-4 text-balance text-display font-semibold text-ink-strong sm:text-display-lg">
              Purposeful motion that speaks Tailwind
            </h1>
            <p className="mt-5 text-pretty text-body-lg text-ink-muted">
              Add tuned entrances, interruptible state transitions and product-ready recipes with
              composable classes. Tailwind owns the look. TailMotion owns how it moves.
            </p>
          </div>

          <Code label="Add the behavior you mean" copyValue='<button class="tm-press">Save changes</button>'>
            {'<button class="tm-press">Save changes</button>'}
          </Code>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button as="a" href="/#explorer" variant="primary">
              Explore the motion language
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
