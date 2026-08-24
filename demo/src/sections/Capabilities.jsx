import { useEffect, useId, useRef, useState } from 'react';
import { Badge, Button, Card, Chip, ChipGroup, Code, Shell, cx } from '../lib/ui';

/* --------------------------------------------------------------------------
   Package capabilities.

   Every panel below is the same markup under three motion personalities, two
   writing directions and two motion preferences. The point of the page is
   what does NOT change: no panel swaps a class when you change the profile,
   the direction or the state. Only attributes your application already sets
   move.

   Tailwind owns every colour, size, radius and shadow on this page.
   TailMotion owns only the movement, and each panel names the exact classes
   it is demonstrating.
   -------------------------------------------------------------------------- */

const PROFILES = [
  ['tm-motion-calm', 'Calm', 'Settings, finance, long-form reading'],
  ['tm-motion-productive', 'Productive', 'The recommended default for product UI'],
  ['tm-motion-expressive', 'Expressive', 'Onboarding, milestones, celebration'],
  ['tm-motion-default', 'Library default', 'No personality applied'],
];

function Panel({ n, title, classes, children, note }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
        <h3 className="text-heading font-semibold text-ink-strong">
          <span className="me-2 font-mono text-overline text-ink-faint">{String(n).padStart(2, '0')}</span>
          {title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {classes.map((c) => (
            <Badge key={c} tone="accent">{c}</Badge>
          ))}
        </div>
      </div>
      {note ? <p className="mt-2 max-w-measure text-pretty text-micro text-ink-faint">{note}</p> : null}
      <div className="mt-4">{children}</div>
    </Card>
  );
}

/* 01 — the same interface under any personality. */
function PersonalityPanel({ replayKey }) {
  return (
    <div key={replayKey} className="tm-stagger max-w-sm space-y-3">
      <h4 className="text-body font-medium text-ink-strong">Account</h4>
      <p className="text-micro text-ink-muted">
        Nothing in this block names a duration, a distance or an easing.
      </p>
      <div className="flex gap-2">
        <Button variant="primary" className="tm-press">Save</Button>
        <Button className="tm-press">Cancel</Button>
      </div>
      <div className="tm-pop rounded-md border border-line bg-card-hover px-3 py-2 text-micro text-ink">
        Saved
      </div>
    </div>
  );
}

/* 02 — presence driven by state the app already owns. */
function PresencePanel() {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <div className="max-w-sm space-y-3">
      <Button aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className="tm-press">
        {open ? 'Close menu' : 'Open menu'}
      </Button>

      <div
        id={id}
        data-state={open ? 'open' : 'closed'}
        className="tm-presence-slide-block rounded-lg border border-line bg-card-hover p-3"
      >
        <ul className="space-y-1.5 text-micro text-ink">
          <li>Profile</li>
          <li>Settings</li>
          <li>Sign out</li>
        </ul>
      </div>

      <Code label="the only thing that changes">{`data-state="${open ? 'open' : 'closed'}"`}</Code>
    </div>
  );
}

/* 03 + 04 + 05 — elements the browser owns. */
function NativePanel() {
  const dialogRef = useRef(null);
  const [support, setSupport] = useState(null);

  useEffect(() => {
    setSupport({
      popover: CSS.supports('selector(:popover-open)'),
      discrete: CSS.supports('transition-behavior', 'allow-discrete'),
      detailsContent: CSS.supports('selector(::details-content)'),
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          popovertarget="tm-capability-popover"
          className="tm-press"
          style={{ anchorName: '--tm-capability-popover-anchor' }}
        >
          Account menu
        </Button>
        <div
          id="tm-capability-popover"
          popover=""
          className="tm-native-popover rounded-lg border border-line bg-card p-3 text-micro text-ink shadow-2xl"
          style={{
            '--tm-origin': 'top center',
            positionAnchor: '--tm-capability-popover-anchor',
            positionArea: 'bottom center',
            positionTryFallbacks: 'flip-block',
            margin: 0,
            marginTop: '8px',
          }}
        >
          <ul className="space-y-1.5">
            <li>Billing</li>
            <li>Team</li>
            <li>Sign out</li>
          </ul>
        </div>

        <Button className="tm-press" onClick={() => dialogRef.current?.showModal()}>
          Open dialog
        </Button>
        <dialog
          ref={dialogRef}
          className="tm-native-dialog w-[min(24rem,90vw)] rounded-xl border border-line bg-card p-5 text-ink backdrop:bg-black/60"
        >
          <h4 className="text-heading font-semibold text-ink-strong">Delete workspace</h4>
          <p className="mt-2 text-micro text-ink-muted">
            The browser owns the top layer, focus trapping and Escape. TailMotion
            only animates the panel and the backdrop.
          </p>
          <form method="dialog" className="mt-4 flex justify-end">
            <Button variant="primary" className="tm-press">Close</Button>
          </form>
        </dialog>
      </div>

      <details className="tm-native-disclosure rounded-lg border border-line bg-card px-4 py-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-body text-ink-strong marker:content-['']">
          <span data-tm-marker aria-hidden className="text-ink-faint">›</span>
          Shipping details
        </summary>
        <div className="pt-2 text-micro text-ink-muted">
          Ships in two business days. Returns are accepted within 30 days of
          delivery, and tracking is emailed as soon as the parcel leaves the
          warehouse.
        </div>
      </details>

      {support ? (
        <p className="text-micro text-ink-faint">
          This browser:{' '}
          <span className="text-ink">:popover-open {support.popover ? 'yes' : 'no'}</span>,{' '}
          <span className="text-ink">allow-discrete {support.discrete ? 'yes' : 'no'}</span>,{' '}
          <span className="text-ink">::details-content {support.detailsContent ? 'yes' : 'no'}</span>.
          Anything missing degrades to an instant open and close — never to
          hidden content.
        </p>
      ) : null}
    </div>
  );
}

/* 06 — loading to success on one button. */
function FeedbackPanel() {
  const [state, setState] = useState('idle');
  const timers = useRef([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    setState('loading');
    timers.current = [
      setTimeout(() => setState('success'), 1100),
      setTimeout(() => setState('idle'), 2600),
    ];
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        data-state={state}
        onClick={run}
        disabled={state === 'loading'}
        className={cx(
          'tm-feedback-button tm-press h-9 min-w-[7rem] rounded-md px-4 text-micro font-medium',
          'bg-ink-strong text-page disabled:opacity-80',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
        )}
      >
        <span className="tm-feedback-idle">Save changes</span>
        <span className="tm-feedback-loading">Saving…</span>
        <span className="tm-feedback-success">Saved</span>
      </button>
      <span className="font-mono text-micro text-ink-faint">data-state=&quot;{state}&quot;</span>
    </div>
  );
}

/* 07 — enter, and reverse-exit, without touching the DOM order. */
function ChoreographyPanel() {
  const [phase, setPhase] = useState('enter');
  const [step, setStep] = useState('tm-stagger-75');
  const [runId, setRunId] = useState(0);

  const replay = (next) => {
    setPhase(next);
    setRunId((n) => n + 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button className="tm-press" onClick={() => replay('enter')}>Enter</Button>
        <Button className="tm-press" onClick={() => replay('exit')}>Reverse exit</Button>
      </div>

      <ChipGroup label="step">
        {['tm-stagger-50', 'tm-stagger-75', 'tm-stagger-150'].map((s) => (
          <Chip key={s} selected={step === s} onClick={() => setStep(s)}>
            {s.replace('tm-stagger-', '')}ms
          </Chip>
        ))}
      </ChipGroup>

      <ul
        key={runId}
        data-state={phase === 'enter' ? 'open' : 'closed'}
        className={cx(
          'tm-stagger max-w-xs space-y-1.5',
          step,
          phase === 'exit' && 'tm-stagger-from-end'
        )}
      >
        {['Profile', 'Settings', 'Notifications', 'Sign out'].map((label) => (
          <li key={label} className="rounded-md border border-line bg-card-hover px-3 py-2 text-micro text-ink">
            {label}
          </li>
        ))}
      </ul>

      <p className="max-w-measure text-micro text-ink-faint">
        The exit runs last-item-first, and the list items stay in the order you
        read them. Nothing is reversed in the DOM, so tab order and the
        accessibility tree are untouched.
      </p>
    </div>
  );
}

/* 08 — scroll-driven reveal, with the fallback stated plainly. */
function ScrollPanel() {
  const [supported, setSupported] = useState(null);

  useEffect(() => {
    setSupported(CSS.supports('animation-timeline', 'view()'));
  }, []);

  return (
    <div className="space-y-3">
      <p className="text-micro text-ink-faint">
        {supported === null
          ? 'Checking support…'
          : supported
            ? 'This browser drives these from the scroll position, on the compositor. No observer, no listener.'
            : 'This browser has no scroll-driven animations, so every section below renders as ordinary visible content. That is the whole fallback.'}
      </p>

      <div className="h-64 overflow-y-auto rounded-lg border border-line bg-page p-4">
        {/* The shipped class times itself off the page scrollbar (it's built for a
            fixed, full-page reading bar). This demo scrolls its own small box
            instead, so it needs its own nearest-scroller timeline. */}
        <div
          className="tm-scroll-progress sticky top-0 -mt-4 mb-3 h-0.5 bg-accent"
          style={{ animationTimeline: 'scroll(nearest block)' }}
        />
        <p className="pb-6 text-micro text-ink-faint">Scroll this box.</p>
        {['tm-scroll-reveal', 'tm-scroll-fade', 'tm-scroll-scale', 'tm-scroll-slide-block'].map(
          (className) => (
            <div
              key={className}
              className={cx(
                'mb-28 rounded-md border border-line bg-card px-4 py-6 font-mono text-micro text-ink',
                className
              )}
            >
              {className}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/* Recipes that need no interaction beyond a toggle. */
function RecipesPanel() {
  const [toast, setToast] = useState(false);
  const [tip, setTip] = useState(false);
  const [open, setOpen] = useState(true);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const showToast = () => {
    setToast(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(false), 2200);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Button className="tm-press" onClick={showToast}>Show toast</Button>
        <div
          role="status"
          data-state={toast ? 'open' : 'closed'}
          className="tm-toast rounded-md border border-line bg-card-hover px-3 py-2 text-micro text-ink"
        >
          Changes saved
        </div>
      </div>

      {/* The headroom lives on this outer wrapper, not the positioned element
          inside it -- `bottom-full` resolves against its own containing
          block's padding box, so padding there would push the tooltip up by
          that much extra. */}
      <div className="pt-8">
        <div className="relative inline-block">
          <Button
            className="tm-press"
            onFocus={() => setTip(true)}
            onBlur={() => setTip(false)}
            onMouseEnter={() => setTip(true)}
            onMouseLeave={() => setTip(false)}
            aria-describedby="tm-capability-tip"
          >
            Hover for a tooltip
          </Button>
          <div
            id="tm-capability-tip"
            role="tooltip"
            data-side="top"
            data-state={tip ? 'open' : 'closed'}
            className="tm-tooltip absolute bottom-full start-0 mb-2 whitespace-nowrap rounded border border-line bg-card px-2 py-1 text-micro text-ink"
          >
            120ms, because the pointer is already here
          </div>
        </div>
      </div>

      <div className="max-w-sm space-y-2">
        <Button className="tm-press" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? 'Collapse' : 'Expand'} accordion
        </Button>
        <div data-state={open ? 'open' : 'closed'} className="tm-accordion-panel">
          <div>
            <p className="rounded-md border border-line bg-card-hover p-3 text-micro text-ink-muted">
              A 0fr to 1fr grid row is the one height animation CSS can express
              without measuring anything, so this needs no JavaScript and no
              fixed height.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className={cx(
            'tm-hold-confirm h-9 rounded-md px-4 text-micro font-medium text-red-600',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
          )}
        >
          Hold to delete
        </button>
        <p className="max-w-measure text-micro text-ink-faint">
          The fill is the button&apos;s own colour at low alpha — TailMotion picks
          no red. Linear easing on purpose: the fill is a clock, and any other
          curve would misreport how much time is left.
        </p>
      </div>
    </div>
  );
}

export function Capabilities() {
  const [profile, setProfile] = useState('tm-motion-productive');
  const [dir, setDir] = useState('ltr');
  const [reduced, setReduced] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  useEffect(() => {
    document.documentElement.dataset.forceReducedMotion = reduced ? 'on' : 'off';
    return () => {
      document.documentElement.dataset.forceReducedMotion = 'off';
    };
  }, [reduced]);

  return (
    <div className="min-h-screen bg-page pb-20">
      <header className="border-b border-line">
        <Shell className="py-10">
          <p className="font-mono text-overline uppercase text-accent">Package capabilities</p>
          <h1 className="mt-3 max-w-measure text-balance text-title font-semibold text-ink-strong sm:text-display">
            One interface, three personalities, no class changes
          </h1>
          <p className="mt-4 max-w-measure text-pretty text-body text-ink-muted">
            Change the profile, the direction or the motion preference below.
            Watch the markup in each panel stay exactly the same.
          </p>
        </Shell>
      </header>

      <div className="sticky top-0 z-30 border-b border-line bg-page/90 backdrop-blur">
        <Shell className="flex flex-wrap items-end gap-x-8 gap-y-4 py-4">
          <ChipGroup label="motion profile" scroll>
            {PROFILES.map(([value, label, hint]) => (
              <Chip
                key={value}
                selected={profile === value}
                onClick={() => setProfile(value)}
                title={hint}
              >
                {label}
              </Chip>
            ))}
          </ChipGroup>

          <ChipGroup label="direction">
            {['ltr', 'rtl'].map((value) => (
              <Chip key={value} selected={dir === value} onClick={() => setDir(value)}>
                {value.toUpperCase()}
              </Chip>
            ))}
          </ChipGroup>

          <ChipGroup label="reduced motion">
            <Chip selected={!reduced} onClick={() => setReduced(false)}>Off</Chip>
            <Chip selected={reduced} onClick={() => setReduced(true)}>Simulated</Chip>
          </ChipGroup>

          <Button className="tm-press" onClick={() => setReplayKey((n) => n + 1)}>
            Replay entrances
          </Button>
        </Shell>
      </div>

      <Shell className="py-8">
        <div className={cx(profile, 'grid gap-5 lg:grid-cols-2')} dir={dir}>
          <Panel
            n={1}
            title="Motion personality"
            classes={[profile]}
            note="One class on the wrapper. Every TailMotion descendant retunes: duration, travel, overshoot and easing role, each animation keeping its own relative character."
          >
            <PersonalityPanel replayKey={`${replayKey}-${profile}-${dir}`} />
          </Panel>

          <Panel
            n={2}
            title="State-driven presence"
            classes={['tm-presence-slide-block']}
            note="The class never changes. Your aria-expanded and data-state do the work, and reversing mid-flight retargets instead of restarting."
          >
            <PresencePanel />
          </Panel>

          <Panel
            n={3}
            title="Native popover, dialog and disclosure"
            classes={['tm-native-popover', 'tm-native-dialog', 'tm-native-disclosure']}
            note="No JavaScript from TailMotion. The browser keeps focus management, the top layer, light dismiss and Escape."
          >
            <NativePanel />
          </Panel>

          <Panel
            n={4}
            title="Loading to success"
            classes={['tm-feedback-button']}
            note="Three labels stay mounted in one grid cell, so the button never resizes mid-transition. Success is the only state that arrives with a spring."
          >
            <FeedbackPanel />
          </Panel>

          <Panel
            n={5}
            title="Stagger choreography"
            classes={['tm-stagger', 'tm-stagger-from-end']}
            note="Enter in document order, exit last-item-first, with no DOM reordering."
          >
            <ChoreographyPanel />
          </Panel>

          <Panel
            n={6}
            title="Scroll-driven reveal"
            classes={['tm-scroll-reveal', 'tm-scroll-progress']}
            note="CSS view timelines. Where the browser has none, the content is simply there."
          >
            <ScrollPanel />
          </Panel>

          <Panel
            n={7}
            title="Product recipes"
            classes={['tm-toast', 'tm-tooltip', 'tm-accordion-panel', 'tm-hold-confirm']}
            note="Motion only: state selectors, timing, easing and transform origin. Every colour, size and radius on this page is Tailwind."
          >
            <RecipesPanel />
          </Panel>

          <Panel
            n={8}
            title="Right-to-left"
            classes={['tm-slide-inline-start', 'tm-presence-slide-inline']}
            note="Direction is logical, never physical. Switch the control above to RTL and the inline-axis motion mirrors itself; block-axis motion does not."
          >
            <div key={`${replayKey}-${dir}`} className="space-y-2">
              <div className="tm-slide-inline-start rounded-md border border-line bg-card-hover px-3 py-2 text-micro text-ink">
                Enters from the inline-start edge
              </div>
              <div className="tm-slide-inline-end rounded-md border border-line bg-card-hover px-3 py-2 text-micro text-ink">
                Enters from the inline-end edge
              </div>
              <div className="tm-slide-block-start rounded-md border border-line bg-card-hover px-3 py-2 text-micro text-ink">
                Enters from below, in both directions
              </div>
            </div>
          </Panel>
        </div>
      </Shell>
    </div>
  );
}
