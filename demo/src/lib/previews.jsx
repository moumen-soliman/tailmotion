import { useEffect, useRef, useState } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import { initNumberSwapElement, initStreamTextElement, initTextFlipElement } from 'tailmotion/utils';
import { cx, CONTROL_TRANSITION } from './ui';

/* --------------------------------------------------------------------------
   Preview renderers.

   Each one shows the class doing its actual job. The surrounding chrome stays
   quiet so the motion is the only thing moving: no gradients, no glow, one
   accent shape per box.
   -------------------------------------------------------------------------- */

const OBJECT = 'grid h-20 w-20 place-items-center rounded-lg bg-ink-strong text-page';
const SURFACE = 'rounded-md border border-line bg-card-hover';

/** The default object: one accent square carrying the class under test. */
function DefaultPreview({ className }) {
  return (
    <div className={cx(OBJECT, className)}>
      <span className="font-mono text-micro font-medium">tm</span>
    </div>
  );
}

function SurfacePreview({ className }) {
  return <div className={cx('h-28 w-full max-w-xs rounded-md border border-line', className)} />;
}

function GlowPreview({ className }) {
  // currentColor drives the halo, so the box carries the effect colour while
  // the label stays readable against it.
  return (
    <div className={cx(OBJECT, className)} style={{ color: 'oklch(0.53 0.1597 258)' }}>
      <span className="font-mono text-micro font-medium text-page">tm</span>
    </div>
  );
}

function ShimmerPreview({ className }) {
  return (
    <div className="w-full max-w-xs space-y-2.5 text-ink-faint">
      <div className={cx(SURFACE, 'h-3 w-2/3', className)} />
      <div className={cx(SURFACE, 'h-3 w-full', className)} />
      <div className={cx(SURFACE, 'h-3 w-4/5', className)} />
    </div>
  );
}

function ShimmerTextPreview({ className }) {
  /* The sweep child is the recipe: a masked window that travels while the copy
     inside it counter-translates, so the highlight moves and the glyphs do
     not. Duplicating the text is the whole cost of keeping the loop on the
     compositor. */
  const text = 'Shimmering text';
  return (
    <p className={cx('text-center text-title font-semibold text-ink-strong', className)}>
      {text}
      <span className="tm-shimmer-text-sweep" aria-hidden="true">
        <span>{text}</span>
      </span>
    </p>
  );
}

function NumberSwapPreview() {
  const ref = useRef(null);
  const controllerRef = useRef(null);
  const [value, setValue] = useState(42);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    controllerRef.current = initNumberSwapElement(node, { value });
  }, []);

  const bump = () => {
    const next = value + Math.ceil(Math.random() * 9) + 1;
    setValue(next);
    controllerRef.current?.update(next);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <span ref={ref} className="font-mono text-title font-semibold text-ink-strong" />
      <button
        type="button"
        onClick={bump}
        className="tm-press rounded-md border border-line px-4 py-1.5 text-label text-ink-muted"
      >
        Change value
      </button>
    </div>
  );
}

const STREAM_TEXT_SENTENCES = [
  'Motion should explain, not decorate.',
  'Streaming text reads as arriving, not swapping.',
];

function StreamTextPreview() {
  const ref = useRef(null);
  const controllerRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    controllerRef.current = initStreamTextElement(node, { text: STREAM_TEXT_SENTENCES[0] });
  }, []);

  const replay = () => {
    const next = (index + 1) % STREAM_TEXT_SENTENCES.length;
    setIndex(next);
    controllerRef.current?.update(STREAM_TEXT_SENTENCES[next]);
  };

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p ref={ref} className="max-w-xs text-xl text-ink" />
      <button
        type="button"
        onClick={replay}
        className="tm-press rounded-md border border-line px-4 py-1.5 text-label text-ink-muted"
      >
        Stream again
      </button>
    </div>
  );
}

function ShimmerHoverPreview() {
  return (
    <button
      type="button"
      className="tm-shimmer-hover rounded-md bg-ink-strong px-6 py-2.5 text-label font-medium text-page"
    >
      Hover for sheen
    </button>
  );
}

function PressPreview({ name }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <button type="button" className={cx(`tm-${name}`, 'rounded-md bg-ink-strong px-6 py-2.5 text-label font-medium text-page')}>
        Press and hold
      </button>
      <button
        type="button"
        disabled
        className={cx(`tm-${name}`, 'rounded-md border border-line px-6 py-2.5 text-label text-ink-faint')}
      >
        Disabled, no scale
      </button>
    </div>
  );
}

function CardPreview({ name }) {
  return (
    <button
      type="button"
      className={cx(
        `tm-${name}`,
        'w-44 rounded-md border border-line bg-card-hover p-4 text-start',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
      )}
      style={{ '--tm-lift-shadow': '0 16px 32px -16px oklch(0.205 0 0 / 0.22)' }}
    >
      <span className="block text-label font-medium text-ink">Hover or tab to me</span>
      <span className="mt-0.5 block text-micro text-ink-muted">tm-{name}</span>
    </button>
  );
}

function IconSwapPreview() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
        className={cx(
          'tm-icon-swap tm-press h-12 w-12 rounded-full border border-line bg-card-hover',
          'hover:border-line-strong focus-visible:outline focus-visible:outline-2',
          'focus-visible:outline-offset-2 focus-visible:outline-accent',
          CONTROL_TRANSITION
        )}
      >
        <Bookmark className="h-5 w-5 text-ink-muted" aria-hidden />
        <Bookmark className="h-5 w-5 fill-ink-strong text-ink-strong" aria-hidden />
      </button>
      {/* The label is the state; the cross-fade only decorates it. */}
      <span className="font-mono text-micro text-ink-muted">{saved ? 'Saved' : 'Not saved'}</span>
    </div>
  );
}

function LiquidPreview({ name }) {
  return (
    <button
      type="button"
      className={cx(`tm-${name}`, 'rounded-md border border-line-strong px-6 py-2.5 text-label text-ink hover:text-page')}
      style={{ '--tm-liquid-color': 'oklch(0.205 0 0)', '--tm-liquid-bg': 'transparent' }}
    >
      Hover me
    </button>
  );
}

/* tm-hold-delete is the one legacy class that ships its own colours and
   padding, and on a <button> under Tailwind v3 it never gets to keep them:
   preflight is unlayered, so `button { color: inherit; padding: 0 }` and
   `button { background-color: transparent }` outrank anything in
   @layer utilities. The result is an unpadded, uncoloured pill with a sweep
   running through it.

   So the preview does what the rest of the library asks for: Tailwind owns the
   look, TailMotion owns the movement. The tokens still feed the ::before sweep
   and the ::after success fill, which preflight does not touch.

   tm-hold-confirm has none of this problem -- it sets no colour, no padding and
   no background, and reads currentColor instead. */
function HoldDeletePreview() {
  return (
    <button
      type="button"
      className={cx(
        'tm-hold-delete text-label',
        'gap-2 rounded-lg bg-red-50 px-6 py-3 font-medium text-red-600'
      )}
      style={{
        '--tm-hold-color': 'rgb(239 68 68)',
        '--tm-hold-success-bg': 'rgb(254 202 202)',
        '--tm-hold-fg': 'oklch(0.205 0 0)',
      }}
    >
      <Trash2 className="h-4 w-4" aria-hidden />
      Hold to delete
    </button>
  );
}

function StaggerPreview({ replayKey, step = '100ms' }) {
  return (
    <ul key={replayKey} className="tm-stagger w-full max-w-xs space-y-2" style={{ '--tm-stagger-step': step }}>
      {['Title', 'Description', 'Actions'].map((label) => (
        <li key={label} className={cx(SURFACE, 'px-3 py-2 text-micro text-ink-muted')}>
          {label}
        </li>
      ))}
    </ul>
  );
}

function CountRevealPreview({ replayKey }) {
  return (
    <div key={replayKey} className={cx(SURFACE, 'px-5 py-3')}>
      <div className="tm-count-reveal font-mono text-title font-semibold text-ink-strong">
        {['1', '2', ',', '3', '4', '5'].map((char, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <span key={i} style={{ '--tm-stagger': i }}>
            {char}
          </span>
        ))}
      </div>
      <p className="mt-1 text-micro text-ink-muted">Digits are markup, not a JS counter</p>
    </div>
  );
}

function ViewMorphPreview({ className }) {
  const [view, setView] = useState('idle');
  const dimensions = view === 'idle' ? [104, 34] : view === 'call' ? [208, 54] : [252, 60];

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className={cx(className, 'rounded-full bg-black text-white')}
        style={{
          '--tm-view-stage-width': '252px',
          '--tm-view-stage-height': '60px',
          '--tm-view-width': `${dimensions[0]}px`,
          '--tm-view-height': `${dimensions[1]}px`,
        }}
      >
        <div data-tm-panel data-tm-active={view === 'idle' ? '' : undefined} aria-hidden={view !== 'idle'}>
          <div className="flex h-[34px] w-[104px] items-center justify-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] text-white/70">Ready</span>
          </div>
        </div>
        <div data-tm-panel data-tm-active={view === 'call' ? '' : undefined} aria-hidden={view !== 'call'}>
          <div className="flex h-[54px] w-52 items-center gap-2.5 px-3">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/20 text-xs text-emerald-400">
              C
            </span>
            <span className="text-xs font-medium">Incoming call</span>
            <span className="ms-auto font-mono text-[10px] text-emerald-400">00:24</span>
          </div>
        </div>
        <div data-tm-panel data-tm-active={view === 'timer' ? '' : undefined} aria-hidden={view !== 'timer'}>
          <div className="flex h-[60px] w-[252px] items-center gap-2.5 px-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-400/20 text-xs text-amber-400">
              T
            </span>
            <span className="text-xs font-medium">Focus timer</span>
            <span className="ms-auto font-mono text-base text-amber-400">08:42</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1.5">
        {['idle', 'call', 'timer'].map((name) => (
          <button
            key={name}
            type="button"
            aria-pressed={view === name}
            onClick={() => setView(name)}
            className={cx(
              'tm-press rounded-full border px-2.5 py-1 font-mono text-[10px] capitalize',
              view === name
                ? 'border-ink-faint bg-card-hover text-ink'
                : 'border-line text-ink-muted'
            )}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function TextFlipPreview({ name }) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const variant = name === 'text-flip' ? 'flip' : name === 'text-morph' ? 'morph' : 'rotate';
    // Renders the words once and hands the cycle to CSS -- no interval to
    // start, nothing ticking after this call returns.
    const rotator = initTextFlipElement(node, {
      words: ['beautiful', 'amazing', 'polished'],
      variant,
      interval: 2200,
    });
    return () => rotator?.destroy();
  }, [name]);

  return (
    <p className="text-center text-xl text-ink">
      Motion that feels{' '}
      <span ref={ref} className={cx(`tm-${name}`, 'text-accent')} />
    </p>
  );
}

function FlipPreview({ name }) {
  const isButton = name === 'flip-btn';
  return (
    <div className="tm-perspective">
      {isButton ? (
        <button type="button" className="tm-flip-btn rounded-md bg-ink-strong px-6 py-2.5 text-label font-medium text-page">
          <span className="tm-flip-front">Download</span>
          <span className="tm-flip-back">Let&apos;s go</span>
        </button>
      ) : (
        <div className="tm-flip-hover tm-3d h-20 w-20">
          <div className={cx('tm-flip-front grid place-items-center rounded-lg bg-ink-strong text-page')}>
            <span className="font-mono text-micro">front</span>
          </div>
          <div className={cx('tm-flip-back grid place-items-center rounded-lg border border-line-strong bg-card-hover')}>
            <span className="font-mono text-micro text-ink-muted">back</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AvatarGroupPreview() {
  const people = ['AB', 'CD', 'EF'];
  return (
    <div className="tm-avatar-group" style={{ '--tm-tooltip-bg': 'oklch(0.1913 0 0)', '--tm-tooltip-color': 'oklch(0.9461 0 0)' }}>
      {people.map((initials) => (
        <div
          key={initials}
          className="tm-avatar tm-avatar-ring grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-ink-strong font-mono text-micro text-page"
          tabIndex={0}
        >
          {initials}
          <span className="tm-avatar-tooltip">Teammate {initials}</span>
        </div>
      ))}
      <div
        className="tm-avatar tm-avatar-more grid h-10 w-10 place-items-center rounded-full font-mono text-micro"
        tabIndex={0}
      >
        +3
        <span className="tm-avatar-tooltip">3 more teammates</span>
      </div>
    </div>
  );
}

const RENDERERS = {
  surface: SurfacePreview,
  glow: GlowPreview,
  shimmer: ShimmerPreview,
  'shimmer-text': ShimmerTextPreview,
  'shimmer-hover': ShimmerHoverPreview,
  'number-swap': NumberSwapPreview,
  'stream-text': StreamTextPreview,
  press: PressPreview,
  card: CardPreview,
  'icon-swap': IconSwapPreview,
  liquid: LiquidPreview,
  'hold-delete': HoldDeletePreview,
  stagger: StaggerPreview,
  'view-morph': ViewMorphPreview,
  'count-reveal': CountRevealPreview,
  'text-flip': TextFlipPreview,
  flip: FlipPreview,
  'avatar-group': AvatarGroupPreview,
};

/**
 * Renders the preview for one catalogue entry.
 * `appliedClass` already includes any variant prefix the trigger needs.
 * Hover previews use a stationary group wrapper so an animated child cannot
 * move the pointer out of its own hit target and restart in a loop.
 */
export function AnimationPreview({ entry, appliedClass, replayKey, staggerStep, trigger = 'load' }) {
  const Renderer = entry.preview ? RENDERERS[entry.preview] : null;

  const preview = Renderer ? (
    <Renderer
      name={entry.name}
      className={appliedClass}
      replayKey={replayKey}
      step={staggerStep}
    />
  ) : (
    <DefaultPreview key={replayKey} className={appliedClass} />
  );

  if (trigger === 'hover') {
    return <div className="group grid min-h-40 w-full place-items-center">{preview}</div>;
  }

  return preview;
}
