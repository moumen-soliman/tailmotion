import { useMemo, useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { AnimationPreview } from '../lib/previews';
import { classForTrigger, markupForTrigger, triggersFor } from '../lib/variants';
import { Button, Card, Chip, ChipGroup, CopyButton, cx } from '../lib/ui';

/* --------------------------------------------------------------------------
   The Motion Lab.

   Pick an animation, see it, copy the class. Only the object inside the
   preview box runs an expressive animation; every control around it is a
   150ms transition.
   -------------------------------------------------------------------------- */

const CHOICES = [
  { id: 'fade-in', label: 'Fade' },
  { id: 'pop', label: 'Pop' },
  { id: 'slide-block-start', label: 'Slide' },
  { id: 'wiggle', label: 'Wiggle' },
  { id: 'sparkle', label: 'Sparkle' },
];

const DURATIONS = [150, 300, 500];
const EASINGS = [
  { id: 'out', label: 'Out' },
  { id: 'soft', label: 'Soft' },
  { id: 'snappy', label: 'Snappy' },
];

export function MotionLab({ variants }) {
  const [name, setName] = useState('pop');
  const [duration, setDuration] = useState(300);
  const [easing, setEasing] = useState('out');
  const [trigger, setTrigger] = useState('load');
  const [replayKey, setReplayKey] = useState(0);

  const triggers = useMemo(() => triggersFor(name, variants), [name, variants]);
  const activeTrigger = triggers.some((t) => t.id === trigger) ? trigger : 'load';

  const classString = useMemo(
    () =>
      `${classForTrigger(name, activeTrigger, { stableHover: true })} ` +
      `tm-duration-${duration} tm-ease-${easing}`,
    [name, activeTrigger, duration, easing]
  );

  const entry = { name, preview: undefined };
  const snippet = markupForTrigger(classString, activeTrigger);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <p className="text-label font-medium text-ink">Motion Lab</p>
          <p className="text-micro text-ink-muted">Pick one, see it, copy it.</p>
        </div>
        <Button
          size="sm"
          onClick={() => setReplayKey((k) => k + 1)}
          disabled={activeTrigger !== 'load'}
          title={activeTrigger === 'load' ? 'Replay the animation' : 'Switch the trigger to Load to replay'}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Replay
        </Button>
      </div>

      {/* Preview stage. Fixed aspect rather than a fixed pixel height, so it
          keeps its shape from narrow phones up to 200% zoom. */}
      <div className="grid h-56 place-items-center border-b border-line bg-page p-6 sm:h-64">
        <AnimationPreview
          entry={entry}
          appliedClass={classString}
          replayKey={replayKey}
          trigger={activeTrigger}
        />
      </div>

      <div className="space-y-3.5 p-4">
        <ChipGroup label="Animation" scroll>
          {CHOICES.map((choice) => (
            <Chip
              key={choice.id}
              selected={name === choice.id}
              onClick={() => {
                setName(choice.id);
                setReplayKey((k) => k + 1);
              }}
            >
              {choice.label}
            </Chip>
          ))}
        </ChipGroup>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-x-6">
          <ChipGroup label="Duration">
            {DURATIONS.map((value) => (
              <Chip key={value} selected={duration === value} onClick={() => setDuration(value)}>
                {value}ms
              </Chip>
            ))}
          </ChipGroup>

          <ChipGroup label="Easing">
            {EASINGS.map((option) => (
              <Chip key={option.id} selected={easing === option.id} onClick={() => setEasing(option.id)}>
                {option.label}
              </Chip>
            ))}
          </ChipGroup>
        </div>

        <ChipGroup label="Trigger">
          {triggers.map((option) => (
            <Chip
              key={option.id}
              selected={activeTrigger === option.id}
              onClick={() => {
                setTrigger(option.id);
                setReplayKey((k) => k + 1);
              }}
            >
              {option.label}
            </Chip>
          ))}
        </ChipGroup>

        <div className="rounded-lg border border-line bg-page">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-1.5">
            <span className="font-mono text-micro text-ink-faint">Generated class</span>
            <CopyButton value={classString} label="Copy class" />
          </div>
          <pre dir="ltr" className="overflow-x-auto px-3 py-2.5 text-micro leading-relaxed text-ink">
            <code className="font-mono">{snippet}</code>
          </pre>
        </div>

        <a
          href="#explorer"
          className={cx(
            'inline-flex items-center gap-1.5 text-label text-accent',
            'transition-[color,gap] duration-150 ease-out hover:gap-2.5',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
          )}
        >
          Explore all animations
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </Card>
  );
}
