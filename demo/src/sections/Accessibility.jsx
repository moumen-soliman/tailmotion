import { useEffect, useState } from 'react';
import { ArrowRight, Github, ShieldCheck } from 'lucide-react';
import { Button, Card, Code, CONTROL_TRANSITION, Section, SectionHeading, cx } from '../lib/ui';

const GITHUB = 'https://github.com/moumen-soliman/tailmotion';

/* --------------------------------------------------------------------------
   Accessibility and performance.

   Each claim below is something you can check in the shipped CSS, and the
   toggle lets you watch the reduced-motion behaviour without changing an OS
   setting.
   -------------------------------------------------------------------------- */

const CLAIMS = [
  {
    title: 'Honors prefers-reduced-motion',
    body:
      'Under the reduce preference every animation and transition collapses to 1ms rather than ' +
      'being dropped, so the state a class communicates still lands. Pseudo-elements and the ' +
      'generated children of tm-stagger and tm-count-reveal are covered too.',
    code:
      '@media (prefers-reduced-motion: reduce) {\n' +
      '  [class*="tm-"], [class*="tm-"]::after, .tm-stagger > * {\n' +
      '    animation-duration: 1ms !important;\n' +
      '    animation-iteration-count: 1 !important;\n' +
      '    transition-duration: 1ms !important;\n' +
      '  }\n' +
      '}',
  },
  {
    title: 'Transform and opacity first',
    body:
      'Entrances, exits and loops animate transform, opacity and filter — the properties a browser ' +
      'can composite. Where an effect needs a colour, it derives one from currentColor instead of ' +
      'shipping a palette.',
    code:
      '@keyframes tm-slide-block-start {\n' +
      '  from { opacity: 0; transform: translate3d(0, var(--tm-distance, 12px), 0); }\n' +
      '  to   { opacity: 1; transform: translate3d(0, 0, 0); }\n' +
      '}',
  },
  {
    title: 'Interruptible transitions for interactions',
    body:
      'Press, hover and toggle states are transitions, not keyframes, so releasing halfway ' +
      'reverses smoothly instead of snapping back or restarting.',
    code:
      '.tm-press {\n' +
      '  transition-property: scale;\n' +
      '  transition-duration: var(--tm-duration, 150ms);\n' +
      '}\n' +
      '.tm-press:active:not(:disabled) { scale: 0.96; }',
  },
  {
    title: 'No runtime dependency',
    body:
      'Every keyframe and transition class is plain CSS. The optional JavaScript helpers only exist ' +
      'for the text rotators and count helpers, which need to change text content.',
    code: "import 'tailmotion/css'; // that is the whole runtime",
  },
];

function useForcedReducedMotion() {
  const [forced, setForced] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (forced) root.setAttribute('data-force-reduced-motion', 'on');
    else root.removeAttribute('data-force-reduced-motion');
    return () => root.removeAttribute('data-force-reduced-motion');
  }, [forced]);

  return [forced, setForced];
}

export function Accessibility() {
  const [forced, setForced] = useForcedReducedMotion();
  const [systemReduced, setSystemReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setSystemReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <Section id="accessibility">
      <SectionHeading eyebrow="Accessible by default" title="Motion you can turn down">
        Four things you can verify in the stylesheet, not four things to take on trust.
      </SectionHeading>

      <Card className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 p-4 lg:mt-10">
        <ShieldCheck className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-label text-ink">Simulate reduced motion on this page</p>
          <p className="mt-0.5 text-micro text-ink-muted">
            Applies the same collapse-to-1ms rule TailMotion ships, to everything here. Your system
            setting is currently{' '}
            <span className="font-mono text-ink-muted">{systemReduced ? 'reduce' : 'no-preference'}</span>.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={forced}
          onClick={() => setForced((value) => !value)}
          className={cx(
            'tm-press inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-micro font-medium',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
            'focus-visible:outline-accent',
            CONTROL_TRANSITION,
            forced
              ? 'border-ink-faint bg-card-hover text-ink-strong'
              : 'border-line-strong text-ink-muted hover:border-ink-faint'
          )}
        >
          <span
            className={cx(
              'h-1.5 w-1.5 rounded-full transition-colors duration-150 ease-out',
              forced ? 'bg-ink-strong' : 'bg-line-strong'
            )}
            aria-hidden
          />
          {forced ? 'Simulation on' : 'Simulation off'}
        </button>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-5">
        {CLAIMS.map((claim) => (
          <Card key={claim.title} className="flex min-w-0 flex-col gap-3 p-5">
            <div>
              <h3 className="text-label font-medium text-ink">{claim.title}</h3>
              <p className="mt-1.5 text-label text-ink-muted">{claim.body}</p>
            </div>
            <Code className="mt-auto">{claim.code}</Code>
          </Card>
        ))}
      </div>
    </Section>
  );
}

export function FinalCta() {
  return (
    <Section id="get-started" className="border-t border-line">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance text-title font-semibold text-ink-strong sm:text-display">
          Give your interface a motion language.
        </h2>
        <p className="mx-auto mt-4 max-w-measure text-pretty text-body-lg text-ink-muted">
          Tailwind already owns how your interface looks. Hand the movement to a vocabulary instead
          of a pile of one-off keyframes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button as="a" href="#install" variant="primary">
            Install TailMotion
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
          <Button as="a" href="#explorer" variant="secondary">
            Explore animations
          </Button>
          <Button as="a" href={GITHUB} target="_blank" rel="noreferrer" variant="ghost">
            <Github className="h-4 w-4" aria-hidden />
            View source
          </Button>
        </div>
      </div>
    </Section>
  );
}
