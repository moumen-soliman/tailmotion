import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/* --------------------------------------------------------------------------
   Shared primitives.

   Two roles carry meaning: white is the primary action and the selected
   state, blue is a link or a focus ring. Everything else is grey, so the only
   thing competing for attention inside a preview is the motion itself.

   Every control transitions explicitly named properties in 150ms or less, and
   every one pairs its motion with a colour or icon change, so no state is
   communicated by movement alone.
   -------------------------------------------------------------------------- */

export const CONTROL_TRANSITION =
  'transition-[background-color,border-color,color,opacity] duration-150 ease-out';

const FOCUS_RING =
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent';

export { FOCUS_RING };

export function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

/** Copy-to-clipboard with a 1.6s confirmation, safe on insecure origins. */
export function useCopy() {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      document.body.removeChild(field);
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  }, []);

  return { copied, copy };
}

export function Shell({ className, children }) {
  return <div className={cx('mx-auto w-full max-w-shell px-5 sm:px-6 lg:px-8', className)}>{children}</div>;
}

/* Sections sit ~112px apart while groups inside them sit ~40px apart, keeping
   the between-group gap comfortably past 2x the within-group gap. */
export function Section({ id, children, className }) {
  return (
    <section id={id} className={cx('py-14 sm:py-16 lg:py-20', className)}>
      <Shell>{children}</Shell>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, children }) {
  return (
    <div>
      {eyebrow ? (
        <p className="font-mono text-overline uppercase text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="mt-3 max-w-measure text-balance text-title font-semibold text-ink-strong sm:text-title-lg">
        {title}
      </h2>
      {children ? <p className="mt-3 max-w-measure text-pretty text-body text-ink-muted">{children}</p> : null}
    </div>
  );
}

const BUTTON_BASE = cx(
  'tm-press inline-flex select-none items-center justify-center gap-2 rounded-md',
  'text-label font-medium disabled:pointer-events-none disabled:opacity-40',
  FOCUS_RING,
  CONTROL_TRANSITION
);

const BUTTON_VARIANTS = {
  // White is the one primary action per view.
  primary: 'bg-ink-strong text-page hover:bg-ink',
  secondary: 'border border-line-strong text-ink hover:border-ink-faint hover:bg-card',
  ghost: 'text-ink-muted hover:bg-card hover:text-ink',
};

const BUTTON_SIZES = {
  sm: 'h-8 px-2.5',
  md: 'h-9 px-4',
};

export function Button({ as = 'button', variant = 'secondary', size = 'md', className, ...rest }) {
  const Tag = as;
  return (
    <Tag
      className={cx(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
      {...rest}
    />
  );
}

/** A selectable option. Selection is white-on-dark, never colour alone. */
export function Chip({ selected, className, children, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(
        'tm-press shrink-0 select-none rounded-full border px-3 py-1.5 text-micro font-medium',
        FOCUS_RING,
        CONTROL_TRANSITION,
        selected
          ? 'border-ink-faint bg-card-hover text-ink-strong'
          : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

/** Labelled group of chips, label sharing the rail's leading edge. */
export function ChipGroup({ label, children, scroll = false }) {
  return (
    <div>
      <p className="mb-2 font-mono text-overline uppercase text-ink-faint">{label}</p>
      <div className={cx('flex gap-2', scroll ? 'rail -mx-1 overflow-x-auto px-1 pb-1' : 'flex-wrap')}>
        {children}
      </div>
    </div>
  );
}

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  size = 'sm',
  variant = 'ghost',
  ariaLabel,
}) {
  const { copied, copy } = useCopy();
  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => copy(value)}
      aria-label={ariaLabel ?? `${label}: ${value}`}
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0" aria-hidden />
      )}
      <span className="whitespace-nowrap">{copied ? copiedLabel : label}</span>
    </Button>
  );
}

/** Code block. Wide content scrolls inside its own box, never the page. */
export function Code({ children, copyValue, label, className }) {
  return (
    <div className={cx('min-w-0 overflow-hidden rounded-md border border-line bg-page', className)}>
      {label || copyValue ? (
        <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-1.5">
          <span className="truncate font-mono text-micro text-ink-faint">{label}</span>
          {copyValue ? <CopyButton value={copyValue} /> : null}
        </div>
      ) : null}
      <pre dir="ltr" className="overflow-x-auto p-3 text-micro leading-relaxed text-ink">
        <code className="font-mono">{children}</code>
      </pre>
    </div>
  );
}

export function Card({ className, children, ...rest }) {
  return (
    <div className={cx('rounded-lg border border-line bg-card', className)} {...rest}>
      {children}
    </div>
  );
}

const BADGE_TONES = {
  neutral: 'border-line text-ink-faint',
  accent: 'border-accent/40 bg-accent/10 text-accent',
  // "needs markup" reads heavier than "css only" without introducing a colour.
  warn: 'border-ink-faint bg-card-hover text-ink',
};

export function Badge({ tone = 'neutral', className, children, ...rest }) {
  return (
    <span
      {...rest}
      className={cx(
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded border px-1.5 py-0.5',
        'font-mono text-overline uppercase',
        BADGE_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** A copyable one-liner, e.g. the install command. */
export function CommandPill({ command, className }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(command)}
      aria-label={`Copy install command: ${command}`}
      className={cx(
        'tm-press group inline-flex h-8 items-center gap-2 rounded-md border border-line bg-card',
        'px-2.5 font-mono text-micro text-ink-muted hover:border-line-strong hover:text-ink',
        FOCUS_RING,
        CONTROL_TRANSITION,
        className
      )}
    >
      <span aria-hidden className="select-none text-ink-faint">$</span>
      <span dir="ltr" className="whitespace-nowrap">{command}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 text-ink-faint group-hover:text-ink-muted" aria-hidden />
      )}
      <span className="sr-only" role="status">
        {copied ? 'Copied' : ''}
      </span>
    </button>
  );
}
