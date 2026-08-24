import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, Code, CONTROL_TRANSITION, Section, SectionHeading, cx } from '../lib/ui';

/* --------------------------------------------------------------------------
   Composability.

   Every part is a real class, so the string on the right is copy-pasteable at
   any combination the visitor lands on.
   -------------------------------------------------------------------------- */

const PARTS = [
  { id: 'duration', token: 'tm-duration-300', note: 'Adjust the rhythm' },
  { id: 'delay', token: 'tm-delay-150', note: 'Sequence with its neighbors' },
  { id: 'ease', token: 'tm-ease-snappy', note: 'Change its personality' },
  { id: 'hover', token: 'hover:', note: 'Use any Tailwind variant' },
];

export function Composability() {
  const [enabled, setEnabled] = useState({ duration: true, delay: true, ease: false, hover: true });

  const toggle = (id) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));

  const base = enabled.hover ? 'hover:tm-pop' : 'tm-pop';
  const tokens = PARTS.filter((p) => p.id !== 'hover' && enabled[p.id]).map((p) => p.token);
  const classString = [base, ...tokens].join(' ');
  const snippet = `<button class="${classString}">\n  Preview motion\n</button>`;

  return (
    <Section id="compose" className="border-t border-line">
      <SectionHeading eyebrow="Decision-first" title="Stack the parts. Skip the animation plumbing.">
        Start with a named behavior whose movement is already tuned. Add a Tailwind variant or a
        timing token only when the context asks for it — without creating another component or
        shipping an animation runtime.
      </SectionHeading>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
        <Card className="min-w-0 p-5">
          <div className="mb-4">
            <p className="font-mono text-overline uppercase text-accent">01 · Choose the behavior</p>
            <p className="mt-1 text-label text-ink-muted">The useful decision comes first; tuning stays optional.</p>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 rounded-md border border-accent/40 bg-accent/10 px-3 py-2.5">
              <span dir="ltr" className="font-mono text-label text-ink-strong">tm-pop</span>
              <span className="ms-auto text-micro text-ink-muted">Tuned entrance behavior</span>
            </li>
            <li className="pb-1 pt-3">
              <p className="font-mono text-overline uppercase text-ink-faint">02 · Tune the context</p>
            </li>
            {PARTS.map((part) => (
              <li key={part.id}>
                <button
                  type="button"
                  aria-pressed={enabled[part.id]}
                  onClick={() => toggle(part.id)}
                  className={cx(
                    'tm-press flex w-full items-center gap-2 rounded-md border px-3 py-2 text-start',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                    'focus-visible:outline-accent',
                    CONTROL_TRANSITION,
                    enabled[part.id]
                      ? 'border-ink-faint bg-card-hover text-ink-strong'
                      : 'border-line text-ink-muted hover:border-line-strong hover:text-ink'
                  )}
                >
                  <Plus
                    className={cx(
                      'h-3.5 w-3.5 shrink-0 transition-transform duration-150 ease-out',
                      enabled[part.id] ? 'rotate-45' : 'rotate-0'
                    )}
                    aria-hidden
                  />
                  <span dir="ltr" className="font-mono text-label">{part.token}</span>
                  <span className="ms-auto hidden text-micro text-ink-muted sm:inline">{part.note}</span>
                  <span className="sr-only">{enabled[part.id] ? '(included)' : '(not included)'}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <div className="flex min-w-0 flex-col gap-6">
          <Code label="Copyable result" copyValue={snippet} className="shrink-0">
            {snippet}
          </Code>

          <Card className="flex min-h-48 flex-1 flex-col bg-page">
            <div className="border-b border-line px-4 py-3">
              <p className="font-mono text-overline uppercase text-ink-faint">Live composition</p>
              <p className="mt-1 text-micro text-ink-muted">
                The behavior stays readable even after you tune it.
              </p>
            </div>
            <div className="grid flex-1 place-items-center p-8">
              <div className="flex flex-col items-center gap-3">
                <button type="button" key={classString} className={cx(classString, 'rounded-md bg-ink-strong px-5 py-2.5 text-label font-medium text-page')}>
                  Preview motion
                </button>
                <p className="text-center text-micro text-ink-muted">
                  {enabled.hover ? 'Hover to trigger the named behavior' : 'Replays when the composition changes'}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
