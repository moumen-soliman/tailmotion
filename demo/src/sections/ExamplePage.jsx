import { useEffect, useState } from 'react';
import { ArrowRight, Bell, Bookmark, Check, Folder, Star } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Code,
  CONTROL_TRANSITION,
  FOCUS_RING,
  Section,
  SectionHeading,
  cx,
} from '../lib/ui';

const STATS = [
  { label: 'Shipped', value: ['1', '2', ',', '4', '8'], delay: 'tm-delay-0' },
  { label: 'Reviews', value: ['9', '8', '4'], delay: 'tm-delay-150', sparkle: true },
  { label: 'Uptime', value: ['9', '9', '.', '9'], delay: 'tm-delay-300' },
];

const PROJECTS = [
  { name: 'Atlas', files: '18 files', note: 'Design system' },
  { name: 'Harbor', files: '9 files', note: 'Checkout' },
  { name: 'North', files: '24 files', note: 'Dashboard' },
];

const TEAM = [
  { initial: 'A', name: 'Amira', tone: 'bg-card-hover text-ink' },
  { initial: 'N', name: 'Noah', tone: 'bg-ink-strong text-page' },
  { initial: 'S', name: 'Sana', tone: 'bg-card-hover text-ink' },
];

const SAMPLE = `<button className="tm-press rounded-md bg-white px-4 py-2">
  Invite reviewers
</button>

<ul className="tm-stagger">
  <li>Atlas</li>
  <li>Harbor</li>
  <li>North</li>
</ul>

<button className="tm-icon-swap" aria-pressed={saved}>
  <Bookmark />
  <Bookmark className="fill-current" />
</button>`;

export function ExamplePage() {
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <main>
      <Section className="border-b border-line">
        <div className="tm-stagger max-w-measure">
          <p className="font-mono text-overline uppercase text-accent">React example</p>
          <h1 className="mt-3 text-balance text-display font-semibold text-ink-strong sm:text-display-lg">
            Ship the motion with the markup.
          </h1>
          <p className="mt-4 text-pretty text-body-lg text-ink-muted">
            A product surface built only from TailMotion classes and Tailwind layout. No animation
            library, no runtime, no extra wrappers.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => setToast('Invite sent to the review channel.')}>
              Invite reviewers
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Button>
            <Button as="a" href="/#explorer">
              Browse classes
            </Button>
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Product UI" title="The same classes you copy from the playground">
          Entrances, press feedback, hover lift, a counter, and an icon swap. Each one is a class on
          ordinary HTML.
        </SectionHeading>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {STATS.map((stat) => (
            <Card key={stat.label} className={cx('p-5', 'tm-slide-block-start', stat.delay)}>
              <p className="font-mono text-overline uppercase text-ink-faint">{stat.label}</p>
              <p className="mt-3 font-mono text-title font-semibold tabular-nums text-ink-strong">
                <span className="tm-count-reveal" aria-label={stat.value.join('')}>
                  {stat.value.map((digit, index) => (
                    <span key={`${stat.label}-${index}`}>{digit}</span>
                  ))}
                </span>
                {stat.sparkle ? (
                  <Star
                    className="ms-2 inline h-4 w-4 text-ink-strong tm-sparkle tm-repeat-infinite"
                    aria-hidden
                  />
                ) : null}
              </p>
            </Card>
          ))}
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-heading font-medium text-ink-strong">Active projects</h2>
                <p className="mt-1 text-label text-ink-muted">Hover a card. The lift is interruptible.</p>
              </div>
              <Badge>tm-hover-lift</Badge>
            </div>
            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {PROJECTS.map((project) => (
                <li key={project.name}>
                  <article className="tm-hover-lift rounded-md border border-line bg-card-hover p-4">
                    <Folder className="h-4 w-4 text-ink-faint" aria-hidden />
                    <h3 className="mt-3 text-label font-medium text-ink">{project.name}</h3>
                    <p className="mt-1 text-micro text-ink-muted">{project.note}</p>
                    <p className="mt-3 font-mono text-micro text-ink-faint">{project.files}</p>
                  </article>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-heading font-medium text-ink-strong">Reviewers</h2>
                <p className="mt-1 text-label text-ink-muted">Save with a real pressed state.</p>
              </div>
              <Badge tone="warn">Markup</Badge>
            </div>

            <div className="tm-avatar-group mt-6" role="list" aria-label="Reviewers">
              {TEAM.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  className={cx(
                    'tm-avatar tm-avatar-ring grid size-10 place-items-center rounded-full border-2 border-page',
                    'text-micro font-medium',
                    member.tone,
                    FOCUS_RING
                  )}
                  aria-label={member.name}
                >
                  <span className="tm-avatar-tooltip">{member.name}</span>
                  {member.initial}
                </button>
              ))}
              <span
                className="tm-avatar grid size-10 place-items-center rounded-full border-2 border-page bg-card-hover text-micro font-medium text-ink-muted"
                aria-label="5 more reviewers"
              >
                +5
              </span>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-pressed={saved}
                  aria-label={saved ? 'Saved' : 'Save'}
                  onClick={() => setSaved((value) => !value)}
                  className={cx(
                    'tm-icon-swap tm-press h-9 w-9 rounded-md border border-line-strong',
                    FOCUS_RING,
                    CONTROL_TRANSITION
                  )}
                >
                  <Bookmark className="h-4 w-4 text-ink-muted" aria-hidden />
                  <Bookmark className="h-4 w-4 fill-ink-strong text-ink-strong" aria-hidden />
                </button>
                <span className="text-label text-ink-muted" aria-hidden>
                  {saved ? 'Saved' : 'Save'}
                </span>
              </div>
              <Button onClick={() => setToast('Invite sent to the review channel.')}>
                <Bell className="h-3.5 w-3.5" aria-hidden />
                Notify
              </Button>
            </div>
          </Card>
        </div>

        <Code className="mt-10" label="Copy into any React file after import 'tailmotion/css'" copyValue={SAMPLE}>
          {SAMPLE}
        </Code>
      </Section>

      {toast ? (
        <div
          role="status"
          className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-5"
        >
          <p className="tm-slide-block-start inline-flex items-center gap-2 rounded-full border border-line bg-card px-4 py-2 text-label text-ink">
            <Check className="h-3.5 w-3.5 text-accent" aria-hidden />
            {toast}
          </p>
        </div>
      ) : null}
    </main>
  );
}
