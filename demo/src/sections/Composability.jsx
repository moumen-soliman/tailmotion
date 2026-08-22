import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, Code, CONTROL_TRANSITION, Section, SectionHeading, cx } from '../lib/ui';

/* --------------------------------------------------------------------------
   Composability.

   Every part is a real class, so the string on the right is copy-pasteable at
   any combination the visitor lands on.
   -------------------------------------------------------------------------- */

const PARTS = [
  { id: 'duration', token: 'tm-duration-300', label: 'Duration', note: 'How long it runs' },
  { id: 'delay', token: 'tm-delay-150', label: 'Delay', note: 'When it starts' },
  { id: 'ease', token: 'tm-ease-snappy', label: 'Easing', note: 'How it accelerates' },
  { id: 'hover', token: 'hover:', label: 'Hover', note: 'What triggers it' },
];

export function Composability() {
  const [enabled, setEnabled] = useState({ duration: true, delay: true, ease: false, hover: true });

  const toggle = (id) => setEnabled((prev) => ({ ...prev, [id]: !prev[id] }));

  const base = enabled.hover ? 'hover:tm-pop' : 'tm-pop';
  const tokens = PARTS.filter((p) => p.id !== 'hover' && enabled[p.id]).map((p) => p.token);
  const classString = [base, ...tokens].join(' ');
  const snippet = `<button class="${classString}">\n  Hover me\n</button>`;

  return (
    <Section id="compose">
      <SectionHeading eyebrow="Composable" title="Stack the parts, skip the keyframes">
        Motion is assembled from small classes that each own one decision. You never write an
        <code className="mx-1 font-mono text-ink-muted">@keyframes</code> block, and you never fork a
        component to change a duration.
      </SectionHeading>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
        <Card className="min-w-0 p-5">
          <p className="mb-3 font-mono text-micro uppercase tracking-wider text-ink-faint">
            Parts (toggle any of them)
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 rounded-md border border-line-strong bg-card-hover px-3 py-2">
              <span dir="ltr" className="font-mono text-label text-ink-strong">tm-pop</span>
              <span className="ms-auto text-micro text-ink-muted">The animation. Always required.</span>
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
          <Code label="Result" copyValue={snippet} className="shrink-0">
            {snippet}
          </Code>

          <Card className="grid flex-1 place-items-center bg-page p-8">
            <div className="flex flex-col items-center gap-3">
              <button type="button" key={classString} className={cx(classString, 'rounded-md bg-ink-strong px-5 py-2.5 text-label font-medium text-page')}>
                Hover me
              </button>
              <p className="text-center text-micro text-ink-muted">
                {enabled.hover ? 'Runs on hover' : 'Ran once, when it mounted'}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Section>
  );
}
