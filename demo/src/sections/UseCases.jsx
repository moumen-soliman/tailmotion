import { useState } from 'react';
import { Bell, Check, Heart, Loader2, Sparkles } from 'lucide-react';
import { Badge, Card, CopyButton, Section, SectionHeading, CONTROL_TRANSITION, cx } from '../lib/ui';

/* --------------------------------------------------------------------------
   Use-case gallery.

   Every demo here is built from generic utility classes. Component-shaped
   things (avatar stacks, flip buttons) live in the explorer under Recipes.
   -------------------------------------------------------------------------- */

const TILE = 'grid min-h-[9.5rem] place-items-center rounded-md border border-line bg-page p-4';

function Demo({ title, classes, requires, children }) {
  return (
    <div className="min-w-0 space-y-2.5">
      <div className="flex items-center gap-2">
        <h4 className="min-w-0 truncate text-label font-medium text-ink">{title}</h4>
        {requires ? (
          <Badge tone="warn" title={requires}>
            Markup
          </Badge>
        ) : (
          <Badge>CSS only</Badge>
        )}
      </div>
      <div className={TILE}>{children}</div>
      <div className="flex items-center gap-2">
        <code dir="ltr" className="min-w-0 flex-1 truncate font-mono text-micro text-ink-muted" title={classes}>
          {classes}
        </code>
        <CopyButton value={classes} label="Copy" />
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- product */

function PressDemo() {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <button type="button" className="tm-press rounded-md bg-ink-strong px-5 py-2 text-label font-medium text-page">
        Save changes
      </button>
      <button type="button" className="tm-press rounded-md border border-line-strong px-5 py-2 text-label text-ink">
        Cancel
      </button>
    </div>
  );
}

function MenuEntrance() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full max-w-[13rem] flex-col items-center gap-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cx(
          'tm-press w-full rounded-md border border-line-strong px-3 py-1.5 text-micro text-ink',
          'hover:border-ink-faint focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-accent',
          CONTROL_TRANSITION
        )}
      >
        {open ? 'Close menu' : 'Open menu'}
      </button>
      {open ? (
        <ul
          key="menu"
          className="tm-slide-block-start tm-duration-200 w-full space-y-1 rounded-md border border-line bg-card-hover p-1.5"
        >
          {['Duplicate', 'Rename', 'Delete'].map((item) => (
            <li
              key={item}
              className="rounded px-2 py-1 text-micro text-ink-muted transition-colors duration-150 ease-out hover:bg-card-hover"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function NotificationEntrance() {
  const [count, setCount] = useState(0);
  return (
    <div className="flex w-full max-w-[15rem] flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className={cx(
          'tm-press rounded-md border border-line-strong px-3 py-1.5 text-micro text-ink',
          'hover:border-ink-faint focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-accent',
          CONTROL_TRANSITION
        )}
      >
        Send a toast
      </button>
      {count > 0 ? (
        <div
          key={count}
          role="status"
          className="tm-slide-inline-start tm-duration-200 flex w-full items-center gap-2 rounded-md border border-line bg-card-hover px-3 py-2"
        >
          <Bell className="h-3.5 w-3.5 shrink-0 text-ink-strong" aria-hidden />
          <span className="text-micro text-ink">Saved to your library</span>
        </div>
      ) : null}
    </div>
  );
}

function IconTransition() {
  const [liked, setLiked] = useState(false);
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-pressed={liked}
        onClick={() => setLiked((v) => !v)}
        className={cx(
          'tm-icon-swap tm-press h-11 w-11 rounded-full border border-line bg-card-hover',
          'hover:border-line-strong focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-accent',
          CONTROL_TRANSITION
        )}
      >
        <Heart className="h-4 w-4 text-ink-muted" aria-hidden />
        <Heart className="h-4 w-4 fill-ink-strong text-ink-strong" aria-hidden />
      </button>
      <span className="font-mono text-micro text-ink-muted">{liked ? 'Liked' : 'Not liked'}</span>
    </div>
  );
}

/* --------------------------------------------------------------- marketing */

function StaggeredContent() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex w-full max-w-[14rem] flex-col items-center gap-3">
      <div key={key} className="tm-stagger w-full space-y-1.5">
        <p className="text-label font-medium text-ink">Ship faster</p>
        <p className="text-micro text-ink-muted">Motion that stays out of the way.</p>
        <span className="inline-block rounded bg-ink-strong px-2 py-1 text-micro font-medium text-page">
          Get started
        </span>
      </div>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className={cx('tm-press text-micro text-ink-muted hover:text-ink', CONTROL_TRANSITION)}
      >
        Replay
      </button>
    </div>
  );
}

function TextReveal() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3">
      <p key={key} className="tm-reveal text-center text-heading font-medium text-ink-strong">
        One class per idea
      </p>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className={cx('tm-press text-micro text-ink-muted hover:text-ink', CONTROL_TRANSITION)}
      >
        Replay
      </button>
    </div>
  );
}

function ShimmerSkeleton() {
  return (
    <div className="w-full max-w-[13rem] space-y-2.5 text-ink-faint">
      <div className="tm-shimmer h-3 w-2/3 rounded border border-line bg-card-hover" />
      <div className="tm-shimmer h-3 w-full rounded border border-line bg-card-hover" />
      <div className="tm-shimmer h-3 w-4/5 rounded border border-line bg-card-hover" />
    </div>
  );
}

function AnimatedBackground() {
  return (
    <div
      className="tm-wavy-bg h-24 w-full max-w-[14rem] rounded-md border border-line"
      style={{
        '--tm-wavy-color1': 'oklch(0.53 0.1597 258 / 0.22)',
        '--tm-wavy-color2': 'oklch(0.68 0.1135 259 / 0.12)',
        '--tm-wavy-color3': 'oklch(0.7 0.09 155 / 0.12)',
      }}
    />
  );
}

/* ---------------------------------------------------------------- feedback */

function LoadingIndicators() {
  return (
    <div className="flex items-center gap-6">
      <div className="flex flex-col items-center gap-1.5">
        <Loader2 className="tm-spin h-6 w-6 text-ink-strong" aria-hidden />
        <span className="font-mono text-overline text-ink-muted">tm-spin</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <span className="tm-pulse h-6 w-6 rounded-full bg-ink-strong" aria-hidden />
        <span className="font-mono text-overline text-ink-muted">tm-pulse</span>
      </div>
      <span className="sr-only" role="status">
        Loading
      </span>
    </div>
  );
}

function SuccessAnimation() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => setDone((v) => !v)}
        className={cx(
          'tm-press rounded-md border border-line-strong px-3 py-1.5 text-micro text-ink',
          'hover:border-ink-faint focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-accent',
          CONTROL_TRANSITION
        )}
      >
        {done ? 'Reset' : 'Confirm'}
      </button>
      <div className="grid h-11 w-11 place-items-center">
        {done ? (
          <span key="ok" className="tm-burst grid h-11 w-11 place-items-center rounded-full bg-ink-strong">
            <Check className="h-5 w-5 text-page" aria-hidden />
          </span>
        ) : (
          <span className="h-11 w-11 rounded-full border border-dashed border-line" aria-hidden />
        )}
      </div>
      <span className="sr-only" role="status">
        {done ? 'Confirmed' : ''}
      </span>
    </div>
  );
}

function SparkleDemo() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-card-hover px-3 py-2">
      <Sparkles className="tm-sparkle h-4 w-4 text-ink-strong" aria-hidden />
      <span className="text-micro text-ink">Upgraded to Pro</span>
    </div>
  );
}

function CounterReveal() {
  const [key, setKey] = useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <div key={key} className="tm-count-reveal font-mono text-title font-semibold text-ink-strong">
        {['4', '2', ',', '1', '9', '0'].map((char, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} style={{ '--tm-stagger': i }}>
            {char}
          </span>
        ))}
      </div>
      <p className="text-center text-micro text-ink-muted">Static digits in markup, no JS counter</p>
      <button
        type="button"
        onClick={() => setKey((k) => k + 1)}
        className={cx('tm-press text-micro text-ink-muted hover:text-ink', CONTROL_TRANSITION)}
      >
        Replay
      </button>
    </div>
  );
}

const GROUPS = [
  {
    id: 'product',
    title: 'Product UI',
    blurb: 'Motion that confirms an action, and gets out of the way.',
    demos: [
      { title: 'Press feedback', classes: 'tm-press', render: () => <PressDemo /> },
      { title: 'Menu entrance', classes: 'tm-slide-block-start tm-duration-200', render: () => <MenuEntrance /> },
      { title: 'Notification entrance', classes: 'tm-slide-inline-start tm-duration-200', render: () => <NotificationEntrance /> },
      { title: 'Icon transitions', classes: 'tm-icon-swap', requires: 'Needs two child elements', render: () => <IconTransition /> },
    ],
  },
  {
    id: 'marketing',
    title: 'Marketing',
    blurb: 'Expressive motion for the moments a visitor only sees once.',
    demos: [
      { title: 'Staggered content', classes: 'tm-stagger', requires: 'Needs child elements to stagger', render: () => <StaggeredContent /> },
      { title: 'Text reveal', classes: 'tm-reveal', render: () => <TextReveal /> },
      { title: 'Shimmer', classes: 'tm-shimmer', render: () => <ShimmerSkeleton /> },
      { title: 'Animated background', classes: 'tm-wavy-bg', render: () => <AnimatedBackground /> },
    ],
  },
  {
    id: 'feedback',
    title: 'Feedback',
    blurb: 'State, told by motion and by something that stays put.',
    demos: [
      { title: 'Loading indicators', classes: 'tm-spin tm-pulse', render: () => <LoadingIndicators /> },
      { title: 'Success animation', classes: 'tm-burst', render: () => <SuccessAnimation /> },
      { title: 'Sparkles', classes: 'tm-sparkle', render: () => <SparkleDemo /> },
      { title: 'Static counter reveal', classes: 'tm-count-reveal', requires: 'Needs one span per digit', render: () => <CounterReveal /> },
    ],
  },
];

export function UseCases() {
  return (
    <Section id="use-cases" className="border-t border-line">
      <SectionHeading eyebrow="In practice" title="What it looks like in a real interface">
        Three places motion earns its keep. Every example below is plain utility classes — no
        component library, no wrapper.
      </SectionHeading>

      <div className="mt-8 space-y-10 lg:mt-12 lg:space-y-14">
        {GROUPS.map((group) => (
          <div key={group.id}>
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h3 className="text-heading font-medium text-ink-strong">{group.title}</h3>
              <p className="text-label text-ink-muted">{group.blurb}</p>
            </div>
            <Card className="mt-4 grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 xl:grid-cols-4">
              {group.demos.map((demo) => (
                <Demo key={demo.title} title={demo.title} classes={demo.classes} requires={demo.requires}>
                  {demo.render()}
                </Demo>
              ))}
            </Card>
          </div>
        ))}
      </div>
    </Section>
  );
}
