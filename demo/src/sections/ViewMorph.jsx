import { useState } from 'react';
import { Bell, Phone, TimerReset } from 'lucide-react';
import { Card, Chip, ChipGroup, Code, Section, SectionHeading } from '../lib/ui';

const VIEWS = {
  idle: { label: 'Idle', width: 104, height: 34 },
  call: { label: 'Call', width: 228, height: 56 },
  timer: { label: 'Timer', width: 284, height: 64 },
};

const EXIT_VARIANTS = {
  'idle-call': { scale: 1.16, scaleX: 1, y: 0 },
  'idle-timer': { scale: 1.2, scaleX: 1, y: 5 },
  'call-idle': { scale: 0.88, scaleX: 0.88, y: 0 },
  'call-timer': { scale: 1.16, scaleX: 1, y: 4 },
  'timer-idle': { scale: 0.72, scaleX: 0.86, y: -6 },
  'timer-call': { scale: 0.82, scaleX: 0.92, y: -4 },
};

const SNIPPET = `<div
  class="tm-view-morph rounded-full bg-black"
  style="
    --tm-view-width: 284px;
    --tm-view-height: 64px;
  "
>
  <div data-tm-panel aria-hidden="true">Idle</div>
  <div data-tm-panel aria-hidden="true">Call</div>
  <div data-tm-panel data-tm-active>Timer</div>
</div>`;

function IdleView() {
  return (
    <div className="flex h-[34px] w-[104px] items-center justify-center gap-1.5 px-3 text-white">
      <Bell className="h-3.5 w-3.5" aria-hidden />
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />
    </div>
  );
}

function CallView() {
  return (
    <div className="flex h-14 w-[228px] items-center gap-3 px-3 text-white">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
        <Phone className="h-4 w-4" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] leading-tight text-white/55">Incoming call</span>
        <span className="block truncate text-[13px] font-medium leading-tight">Design review</span>
      </span>
      <span className="ms-auto font-mono text-[11px] tabular-nums text-emerald-400">00:24</span>
    </div>
  );
}

function TimerView() {
  return (
    <div className="flex h-16 w-[284px] items-center gap-3 px-3.5 text-white">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-amber-400/20 text-amber-400">
        <TimerReset className="h-4.5 w-4.5" aria-hidden />
      </span>
      <span>
        <span className="block text-[11px] leading-tight text-white/55">Focus timer</span>
        <span className="block text-[13px] font-medium leading-tight">Deep work</span>
      </span>
      <span className="ms-auto font-mono text-xl font-medium tabular-nums text-amber-400">08:42</span>
    </div>
  );
}

export function ViewMorph() {
  const [view, setView] = useState('idle');
  const [transitionKey, setTransitionKey] = useState('idle-call');
  const active = VIEWS[view];
  const exit = EXIT_VARIANTS[transitionKey];

  const selectView = (nextView) => {
    if (nextView === view) return;
    setTransitionKey(`${view}-${nextView}`);
    setView(nextView);
  };

  return (
    <Section id="view-morph">
      <SectionHeading eyebrow="Structured recipe" title="One surface, continuous state">
        Keep each view mounted, move one state attribute, and let the container reshape around
        the next interface without a motion runtime.
      </SectionHeading>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:mt-10 lg:grid-cols-2 lg:gap-8">
        <Card className="grid min-h-[24rem] place-items-center bg-page p-5 sm:p-8">
          <div className="flex w-full flex-col items-center gap-8">
            <div
              className="tm-view-morph tm-duration-500 rounded-full bg-black shadow-[0_18px_50px_-20px_oklch(0_0_0/0.8)]"
              style={{
                '--tm-view-width': `${active.width}px`,
                '--tm-view-height': `${active.height}px`,
                '--tm-view-exit-scale': exit.scale,
                '--tm-view-exit-scale-x': exit.scaleX,
                '--tm-view-exit-y': `${exit.y}px`,
              }}
            >
              <div data-tm-panel data-tm-active={view === 'idle' ? '' : undefined} aria-hidden={view !== 'idle'}>
                <IdleView />
              </div>
              <div data-tm-panel data-tm-active={view === 'call' ? '' : undefined} aria-hidden={view !== 'call'}>
                <CallView />
              </div>
              <div data-tm-panel data-tm-active={view === 'timer' ? '' : undefined} aria-hidden={view !== 'timer'}>
                <TimerView />
              </div>
            </div>

            <ChipGroup label="Active view">
              {Object.entries(VIEWS).map(([name, item]) => (
                <Chip key={name} selected={view === name} onClick={() => selectView(name)}>
                  {item.label}
                </Chip>
              ))}
            </ChipGroup>
            <span className="sr-only" role="status">
              {active.label} view active
            </span>
          </div>
        </Card>

        <div className="flex min-w-0 flex-col gap-5">
          <Code label="Markup" copyValue={SNIPPET} className="flex-1">
            {SNIPPET}
          </Code>
          <div className="rounded-lg border border-line bg-card p-4">
            <p className="font-mono text-micro uppercase tracking-wider text-ink-faint">
              State stays yours
            </p>
            <p className="mt-2 text-label leading-relaxed text-ink-muted">
              JavaScript chooses the active panel and its dimensions. TailMotion only handles
              the interruptible resize, outgoing blur and incoming cross-fade.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
