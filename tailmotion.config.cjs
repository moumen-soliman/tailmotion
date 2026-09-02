const plugin = require('tailwindcss/plugin');

const DEFAULT_TOKENS = {
  durations: {
    150: '150ms',
    200: '200ms',
    300: '300ms',
    400: '400ms',
    500: '500ms',
    700: '700ms',
    900: '900ms',
    1000: '1000ms',
    1200: '1200ms',
    1400: '1400ms',
    1600: '1600ms',
    2000: '2000ms',
    3000: '3000ms',
  },
  delays: {
    0: '0ms',
    75: '75ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    400: '400ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
    snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  repeat: {
    1: '1',
    2: '2',
    3: '3',
    infinite: 'infinite',
  },
  stagger: {
    50: '50ms',
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
  },
  distance: {
    4: '4px',
    8: '8px',
    12: '12px',
    20: '20px',
    30: '30px',
  },
  // Motion-profile factors. These multiply each animation's own tuned default
  // rather than replacing it, so a scope keeps its relative character.
  speed: {
    75: '0.75',
    85: '0.85',
    100: '1',
    110: '1.1',
    125: '1.25',
    150: '1.5',
  },
  emphasis: {
    0: '0',
    50: '0.5',
    75: '0.75',
    100: '1',
    125: '1.25',
    150: '1.5',
  },
  // How long a destructive hold has to be held.
  hold: {
    800: '800ms',
    1200: '1200ms',
    1600: '1600ms',
    2000: '2000ms',
  },
};

const withImportant = (value) =>
  typeof value === 'string' && value.trim().endsWith('!important') ? value : `${value} !important`;

const resolveTokens = (themeTokens = {}, optionTokens = {}) => {
  const merged = {};

  Object.keys(DEFAULT_TOKENS).forEach((key) => {
    merged[key] = {
      ...DEFAULT_TOKENS[key],
      ...(themeTokens[key] || {}),
      ...(optionTokens[key] || {}),
    };
  });

  return merged;
};

/* ---------------------------------------------------------------------------
   Phase 1 of usage-generated CSS (see docs/COMPILER_PLAN.md): the animation
   catalogue's "simple" utilities -- one class, one matching @keyframes block,
   the uniform six-property animation shape -- registered here so Tailwind's
   own JIT tree-shakes them by usage instead of the whole catalogue shipping
   unconditionally. Recipes with child/state selectors (tm-icon-swap, the
   presence engine, native starting-style, scroll, choreography, profiles, and
   the larger animation files) are a separate, later pass.

   TOKEN_BASE and SIMPLE_KEYFRAMES ship unconditionally, regardless of which
   utilities below are actually used:

   - Neither Tailwind major prunes a @keyframes block for a custom-named
     utility (confirmed empirically -- Tailwind's theme.extend.keyframes /
     theme.extend.animation pruning only fires for its own literal
     `animate-<key>` utilities, which TailMotion's public classes are not).
     The fixed cost is small (~2.3KB gzip for the full catalogue; this is a
     subset of it).
   - The token/color/reduced-motion base layer is a real dependency, not an
     optional extra: tm-glow, tm-ripple and tm-hover-lift read custom
     properties with no fallback value, and every TailMotion class relies on
     the prefers-reduced-motion collapse below regardless of which specific
     class is present on the page.
   -------------------------------------------------------------------------- */

const SIMPLE_BASE = {
  ':root, :host': {
    '--tm-duration-scale': '1',
    '--tm-emphasis': '1',
    '--tm-overshoot': '1',
    '--tm-distance': '12px',
    '--tm-inline-flip': '1',
    '--tm-ease-entrance': 'cubic-bezier(0.22, 1, 0.36, 1)',
    '--tm-ease-exit': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '--tm-ease-interaction': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    '--tm-ease-morph': 'cubic-bezier(0.2, 0, 0, 1)',
    '--tm-ease-emphasis': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    '--tm-color': 'currentColor',
    '--tm-shadow-color': 'color-mix(in oklab, var(--tm-color) 25%, transparent)',
    '--tm-glow-color': 'color-mix(in oklab, var(--tm-color) 45%, transparent)',
    '--tm-outline-color': 'color-mix(in oklab, var(--tm-color) 40%, transparent)',
  },
  '@supports not (color: color-mix(in oklab, currentColor, transparent))': {
    ':root, :host': {
      '--tm-shadow-color': 'var(--tm-color)',
      '--tm-glow-color': 'var(--tm-color)',
      '--tm-outline-color': 'var(--tm-color)',
    },
  },
  '[dir="ltr"]': { '--tm-inline-flip': '1' },
  '[dir="rtl"]': { '--tm-inline-flip': '-1' },
  '@supports selector(:dir(rtl))': {
    '[dir="auto"]:dir(ltr)': { '--tm-inline-flip': '1' },
    '[dir="auto"]:dir(rtl)': { '--tm-inline-flip': '-1' },
  },
  '@media (prefers-reduced-motion: reduce)': {
    '[class*="tm-"], [class*="tm-"]::before, [class*="tm-"]::after': {
      'animation-duration': '1ms !important',
      'animation-delay': '0ms !important',
      'animation-iteration-count': '1 !important',
      'transition-duration': '1ms !important',
      'transition-delay': '0ms !important',
    },
    '[class*="tm-"]::backdrop': {
      'animation-duration': '1ms !important',
      'animation-delay': '0ms !important',
      'transition-duration': '1ms !important',
      'transition-delay': '0ms !important',
    },
  },
};

const SIMPLE_KEYFRAMES = {
  'tm-fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
  'tm-fade-out': { from: { opacity: '1' }, to: { opacity: '0' } },
  'tm-pop': {
    '0%': { scale: 'calc(1 - 0.15 * var(--tm-emphasis, 1))', opacity: '0' },
    '70%': { scale: 'calc(1 + 0.05 * var(--tm-overshoot, 1))', opacity: '1' },
    '100%': { scale: '1', opacity: '1' },
  },
  'tm-bounce': {
    '0%, 100%': { translate: '0 0' },
    '30%': { translate: '0 calc(-18% * var(--tm-emphasis, 1))' },
    '50%': { translate: '0 0' },
    '70%': { translate: '0 calc(-8% * var(--tm-emphasis, 1))' },
  },
  'tm-pulse': {
    '0%, 100%': { scale: '1', opacity: '1' },
    '50%': { scale: 'calc(1 + 0.05 * var(--tm-emphasis, 1))', opacity: '0.85' },
  },
  'tm-spin': { '0%': { rotate: '0deg' }, '100%': { rotate: '360deg' } },
  'tm-float': {
    '0%': { translate: '0 0' },
    '50%': { translate: '0 calc(-6px * var(--tm-emphasis, 1))' },
    '100%': { translate: '0 0' },
  },
  'tm-drift': {
    '0%': { translate: '0 0' },
    '25%': { translate: '6px -2px' },
    '50%': { translate: '0 0' },
    '75%': { translate: '-6px 2px' },
    '100%': { translate: '0 0' },
  },
  'tm-shake': {
    '0%, 100%': { translate: '0 0' },
    '10%, 30%, 50%, 70%, 90%': { translate: 'calc(-10px * var(--tm-emphasis, 1)) 0' },
    '20%, 40%, 60%, 80%': { translate: 'calc(10px * var(--tm-emphasis, 1)) 0' },
  },
  'tm-wiggle': {
    '0%': { translate: '0 0' },
    '20%': { translate: '-6px 0' },
    '40%': { translate: '6px 0' },
    '60%': { translate: '-4px 0' },
    '80%': { translate: '4px 0' },
    '100%': { translate: '0 0' },
  },
  'tm-glow': {
    '0%, 100%': { opacity: '0' },
    '50%': { opacity: '1' },
  },
  'tm-morph': {
    '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
    '25%': { transform: 'scale(1.02, 0.98) rotate(0.5deg)' },
    '50%': { transform: 'scale(0.98, 1.02) rotate(-0.5deg)' },
    '75%': { transform: 'scale(1.01, 0.99) rotate(0.3deg)' },
  },
  'tm-sway': {
    '0%, 100%': { transform: 'rotate(0deg) translateX(0)' },
    '25%': { transform: 'rotate(2deg) translateX(3px)' },
    '50%': { transform: 'rotate(0deg) translateX(0)' },
    '75%': { transform: 'rotate(-2deg) translateX(-3px)' },
  },
  'tm-ripple': {
    '0%, 100%': { scale: '1' },
    '40%': { scale: '1.03' },
  },
  'tm-ripple-ring': {
    '0%': { opacity: '1', scale: '0.96' },
    '40%': { opacity: '0', scale: '1.04' },
    '100%': { opacity: '0', scale: '0.96' },
  },
  'tm-elastic': {
    '0%': { scale: '0 0.5', opacity: '0' },
    '40%': {
      scale: 'calc(1 + 0.12 * var(--tm-overshoot, 1)) calc(1 - 0.12 * var(--tm-overshoot, 1))',
      opacity: '1',
    },
    '60%': { scale: 'calc(1 - 0.08 * var(--tm-overshoot, 1)) calc(1 + 0.08 * var(--tm-overshoot, 1))' },
    '80%': { scale: 'calc(1 + 0.04 * var(--tm-overshoot, 1)) calc(1 - 0.04 * var(--tm-overshoot, 1))' },
    '100%': { scale: '1 1', opacity: '1' },
  },
  'tm-blur-in': {
    from: { opacity: '0', filter: 'blur(calc(var(--tm-blur, 8px) * var(--tm-emphasis, 1)))' },
    to: { opacity: '1', filter: 'blur(0)' },
  },
  'tm-blur-out': {
    from: { opacity: '1', filter: 'blur(0)' },
    to: { opacity: '0', filter: 'blur(calc(var(--tm-exit-blur, 4px) * var(--tm-emphasis, 1)))' },
  },
  'tm-rotate-in': {
    from: {
      opacity: '0',
      rotate: 'calc(var(--tm-rotate-from, -6deg) * var(--tm-emphasis, 1))',
      scale: 'var(--tm-scale-from, calc(1 - 0.04 * var(--tm-emphasis, 1)))',
    },
    to: { opacity: '1', rotate: '0deg', scale: '1' },
  },
  'tm-slide-block-start': {
    from: { opacity: '0', translate: '0 var(--tm-distance, 12px)' },
    to: { opacity: '1', translate: '0 0' },
  },
  'tm-slide-block-end': {
    from: { opacity: '0', translate: '0 calc(var(--tm-distance, 12px) * -1)' },
    to: { opacity: '1', translate: '0 0' },
  },
  'tm-slide-inline-start': {
    from: { opacity: '0', translate: 'calc(var(--tm-distance, 12px) * var(--tm-inline-flip, 1)) 0' },
    to: { opacity: '1', translate: '0 0' },
  },
  'tm-slide-inline-end': {
    from: { opacity: '0', translate: 'calc(var(--tm-distance, 12px) * var(--tm-inline-flip, 1) * -1) 0' },
    to: { opacity: '1', translate: '0 0' },
  },
  'tm-slide-block-out': {
    from: { opacity: '1', translate: '0 0' },
    to: { opacity: '0', translate: '0 calc(var(--tm-exit-distance, calc(var(--tm-distance, 12px) * 0.7)) * -1)' },
  },
  'tm-slide-inline-out': {
    from: { opacity: '1', translate: '0 0' },
    to: {
      opacity: '0',
      translate: 'calc(var(--tm-exit-distance, calc(var(--tm-distance, 12px) * 0.7)) * var(--tm-inline-flip, 1)) 0',
    },
  },
  'tm-drop-in': {
    '0%': {
      opacity: '0',
      translate: '0 calc(var(--tm-drop-distance, calc(var(--tm-distance, 12px) * 3.3)) * -1)',
      scale: '1 calc(1 + 0.08 * var(--tm-emphasis, 1))',
    },
    '60%': {
      opacity: '1',
      translate: '0 calc(var(--tm-distance, 12px) * 0.33 * var(--tm-overshoot, 1))',
      scale: '1 calc(1 - 0.02 * var(--tm-overshoot, 1))',
    },
    '80%': {
      translate: '0 calc(var(--tm-distance, 12px) * -0.17 * var(--tm-overshoot, 1))',
      scale: '1 calc(1 + 0.01 * var(--tm-overshoot, 1))',
    },
    '100%': { opacity: '1', translate: '0 0', scale: '1 1' },
  },
  'tm-scale-in': {
    from: { opacity: '0', scale: 'var(--tm-scale-from, calc(1 - 0.06 * var(--tm-emphasis, 1)))' },
    to: { opacity: '1', scale: '1' },
  },
  'tm-scale-out': {
    from: { opacity: '1', scale: '1' },
    to: { opacity: '0', scale: 'var(--tm-exit-scale, calc(1 - 0.04 * var(--tm-emphasis, 1)))' },
  },
  'tm-zoom-in': {
    '0%': {
      scale: 'calc(1 - 0.08 * var(--tm-emphasis, 1))',
      translate: '0 calc(var(--tm-distance, 12px) * 0.66)',
      opacity: '0',
    },
    '60%': {
      scale: 'calc(1 + 0.02 * var(--tm-overshoot, 1))',
      translate: '0 calc(var(--tm-distance, 12px) * -0.17 * var(--tm-overshoot, 1))',
      opacity: '1',
    },
    '100%': { scale: '1', translate: '0 0', opacity: '1' },
  },
  'tm-zoom-out': {
    '0%': { scale: 'calc(1 + 0.1 * var(--tm-emphasis, 1))', opacity: '0' },
    '60%': { scale: 'calc(1 - 0.02 * var(--tm-overshoot, 1))', opacity: '1' },
    '100%': { scale: '1', opacity: '1' },
  },
};

const SIMPLE_ANIMATION_UTILITIES = {
  '.tm-fade-in': {
    'animation-name': 'tm-fade-in',
    'animation-duration': 'var(--tm-duration, calc(250ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-entrance, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-fade-out': {
    'animation-name': 'tm-fade-out',
    'animation-duration': 'var(--tm-duration, calc(200ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-exit, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-pop': {
    'animation-name': 'tm-pop',
    'animation-duration': 'var(--tm-duration, calc(380ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-emphasis, cubic-bezier(0.18, 0.89, 0.32, 1.28)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-bounce': {
    'animation-name': 'tm-bounce',
    'animation-duration': 'var(--tm-duration, calc(900ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, cubic-bezier(0.68, -0.55, 0.27, 1.55))',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'transform-origin': 'center bottom',
    'will-change': 'translate',
  },
  '.tm-pulse': {
    'animation-name': 'tm-pulse',
    'animation-duration': 'var(--tm-duration, calc(1400ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, ease-in-out)',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'will-change': 'transform, opacity',
  },
  '.tm-spin': {
    'animation-name': 'tm-spin',
    'animation-duration': 'var(--tm-duration, calc(1200ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, linear)',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'will-change': 'transform',
  },
  '.tm-float': {
    'animation-name': 'tm-float',
    'animation-duration': 'var(--tm-duration, calc(3000ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, ease-in-out)',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'will-change': 'transform',
  },
  '.tm-drift': {
    'animation-name': 'tm-drift',
    'animation-duration': 'var(--tm-duration, calc(2800ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, ease-in-out)',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'will-change': 'transform',
  },
  '.tm-shake': {
    'animation-name': 'tm-shake',
    'animation-duration': 'var(--tm-duration, calc(600ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, cubic-bezier(0.36, 0.07, 0.19, 0.97))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
    'transform-origin': 'center',
  },
  '.tm-wiggle': {
    'animation-name': 'tm-wiggle',
    'animation-duration': 'var(--tm-duration, calc(500ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, ease-in-out)',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-glow': {
    position: 'relative',
    '&::after': {
      content: "''",
      position: 'absolute',
      inset: '0',
      'border-radius': 'inherit',
      'box-shadow': '0 0 var(--tm-glow-size, 18px) var(--tm-glow-spread, 0) var(--tm-glow-color)',
      opacity: '0',
      'pointer-events': 'none',
      'animation-name': 'tm-glow',
      'animation-duration': 'var(--tm-duration, calc(1600ms * var(--tm-duration-scale, 1)))',
      'animation-delay': 'var(--tm-delay, 0ms)',
      'animation-timing-function': 'var(--tm-easing, ease-in-out)',
      'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
      'animation-fill-mode': 'both',
      'will-change': 'opacity',
    },
  },
  '.tm-morph': {
    'animation-name': 'tm-morph',
    'animation-duration': 'var(--tm-duration, calc(4000ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, cubic-bezier(0.45, 0.05, 0.55, 0.95))',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'will-change': 'transform',
  },
  '.tm-sway': {
    'animation-name': 'tm-sway',
    'animation-duration': 'var(--tm-duration, calc(3500ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, cubic-bezier(0.37, 0, 0.63, 1))',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'transform-origin': 'top center',
    'will-change': 'transform',
  },
  '.tm-ripple': {
    position: 'relative',
    'animation-name': 'tm-ripple',
    'animation-duration': 'var(--tm-duration, calc(1800ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, cubic-bezier(0.25, 0.46, 0.45, 0.94))',
    'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
    'animation-fill-mode': 'both',
    'will-change': 'transform',
    '&::after': {
      content: "''",
      position: 'absolute',
      inset: '0',
      'border-radius': 'inherit',
      'box-shadow': '0 0 0 var(--tm-ripple-size, 10px) var(--tm-outline-color)',
      opacity: '0',
      'pointer-events': 'none',
      'animation-name': 'tm-ripple-ring',
      'animation-duration': 'var(--tm-duration, calc(1800ms * var(--tm-duration-scale, 1)))',
      'animation-delay': 'var(--tm-delay, 0ms)',
      'animation-timing-function': 'var(--tm-easing, cubic-bezier(0.25, 0.46, 0.45, 0.94))',
      'animation-iteration-count': 'var(--tm-iteration-count, infinite)',
      'animation-fill-mode': 'both',
      'will-change': 'transform, opacity',
    },
  },
  '.tm-elastic': {
    'animation-name': 'tm-elastic',
    'animation-duration': 'var(--tm-duration, calc(900ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-emphasis, cubic-bezier(0.68, -0.6, 0.32, 1.6)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-blur-in': {
    'animation-name': 'tm-blur-in',
    'animation-duration': 'var(--tm-duration, calc(280ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-entrance, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-blur-out': {
    'animation-name': 'tm-blur-out',
    'animation-duration': 'var(--tm-duration, calc(220ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-exit, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-rotate-in': {
    'animation-name': 'tm-rotate-in',
    'animation-duration': 'var(--tm-duration, calc(280ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.22, 1, 0.36, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-slide-block-start, .tm-slide-up': {
    'animation-name': 'tm-slide-block-start',
    'animation-duration': 'var(--tm-duration, calc(260ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.22, 1, 0.36, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-slide-block-end, .tm-slide-down': {
    'animation-name': 'tm-slide-block-end',
    'animation-duration': 'var(--tm-duration, calc(260ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.22, 1, 0.36, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-slide-inline-start, .tm-slide-left': {
    'animation-name': 'tm-slide-inline-start',
    'animation-duration': 'var(--tm-duration, calc(260ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.22, 1, 0.36, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-slide-inline-end, .tm-slide-right': {
    'animation-name': 'tm-slide-inline-end',
    'animation-duration': 'var(--tm-duration, calc(260ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.22, 1, 0.36, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-slide-block-out': {
    'animation-name': 'tm-slide-block-out',
    'animation-duration': 'var(--tm-duration, calc(210ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-exit, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-slide-inline-out': {
    'animation-name': 'tm-slide-inline-out',
    'animation-duration': 'var(--tm-duration, calc(210ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-exit, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-drop, .tm-drop-in': {
    'animation-name': 'tm-drop-in',
    'animation-duration': 'var(--tm-duration, calc(600ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-emphasis, cubic-bezier(0.34, 1.56, 0.64, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
    'transform-origin': 'top center',
  },
  '.tm-scale-in': {
    'animation-name': 'tm-scale-in',
    'animation-duration': 'var(--tm-duration, calc(220ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.22, 1, 0.36, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-scale-out': {
    'animation-name': 'tm-scale-out',
    'animation-duration': 'var(--tm-duration, calc(180ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function': 'var(--tm-easing, var(--tm-ease-exit, ease-out))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-zoom-in': {
    'animation-name': 'tm-zoom-in',
    'animation-duration': 'var(--tm-duration, calc(520ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.19, 1, 0.22, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-zoom-in-slow': {
    'animation-name': 'tm-zoom-in',
    'animation-duration': 'var(--tm-duration, calc(900ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.25, 0.8, 0.25, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
  '.tm-zoom-out': {
    'animation-name': 'tm-zoom-out',
    'animation-duration': 'var(--tm-duration, calc(520ms * var(--tm-duration-scale, 1)))',
    'animation-delay': 'var(--tm-delay, 0ms)',
    'animation-timing-function':
      'var(--tm-easing, var(--tm-ease-entrance, cubic-bezier(0.19, 1, 0.22, 1)))',
    'animation-iteration-count': 'var(--tm-iteration-count, 1)',
    'animation-fill-mode': 'both',
  },
};

/* Nested under `&` (rather than flat sibling selectors) so the same object
   shape serializes directly into a v4 `@utility` body -- see build.mjs. */
const SIMPLE_TRANSITION_UTILITIES = {
  '.tm-press': {
    'transition-property': 'scale',
    'transition-duration': 'var(--tm-duration, calc(150ms * var(--tm-duration-scale, 1)))',
    'transition-timing-function': 'var(--tm-easing, var(--tm-ease-interaction, ease-out))',
    '&:active:not(:disabled):not([aria-disabled="true"])': {
      scale: 'var(--tm-press-scale, 0.96)',
    },
  },
  '.tm-hover-lift, .tm-lift-hover': {
    'transition-property': 'translate, box-shadow',
    'transition-duration': 'var(--tm-duration, calc(150ms * var(--tm-duration-scale, 1)))',
    'transition-timing-function': 'var(--tm-easing, var(--tm-ease-interaction, ease-out))',
    '&:hover, &:focus-visible': {
      translate: '0 calc(var(--tm-lift-distance, 4px) * -1)',
      'box-shadow': 'var(--tm-lift-shadow, 0 8px 24px -8px var(--tm-shadow-color))',
    },
  },
  '.tm-hover-scale': {
    'transition-property': 'scale',
    'transition-duration': 'var(--tm-duration, calc(150ms * var(--tm-duration-scale, 1)))',
    'transition-timing-function': 'var(--tm-easing, var(--tm-ease-interaction, ease-out))',
    '&:hover, &:focus-visible': {
      scale: 'var(--tm-hover-scale, 1.04)',
    },
  },
  '.tm-rotate-hover': {
    'transition-property': 'rotate',
    'transition-duration': 'var(--tm-duration, calc(150ms * var(--tm-duration-scale, 1)))',
    'transition-timing-function': 'var(--tm-easing, var(--tm-ease-interaction, ease-out))',
    '&:hover, &:focus-visible': {
      rotate: 'var(--tm-rotate, 6deg)',
    },
  },
  '.tm-rotate-press': {
    'transition-property': 'scale, rotate',
    'transition-duration': 'var(--tm-duration, calc(150ms * var(--tm-duration-scale, 1)))',
    'transition-timing-function': 'var(--tm-easing, var(--tm-ease-interaction, ease-out))',
    '&:active:not(:disabled):not([aria-disabled="true"])': {
      scale: 'var(--tm-press-scale, 0.96)',
      rotate: 'var(--tm-rotate, -4deg)',
    },
  },
};

const SIMPLE_STATIC_UTILITIES = {
  '.tm-perspective': { perspective: '1200px' },
  '.tm-3d': { 'transform-style': 'preserve-3d', 'backface-visibility': 'hidden' },
  '.tm-gpu': { 'will-change': 'transform, opacity, filter' },
  '.tm-motion-paused': { 'animation-play-state': 'paused !important' },
  '.tm-motion-running': { 'animation-play-state': 'running !important' },
  '.tm-motion-reset': { '--tm-delay': '0ms', '--tm-iteration-count': '1' },
};

const simpleKeyframesAsAtRules = () =>
  Object.fromEntries(Object.entries(SIMPLE_KEYFRAMES).map(([name, steps]) => [`@keyframes ${name}`, steps]));

/* Describes the token-modifier utilities (tm-duration-*, tm-ease-*, etc.)
   once, driven by DEFAULT_TOKENS / the resolved `tokens` object below. v3
   registers these through matchUtilities (dynamic: supports named values and
   arbitrary ones like tm-duration-[420ms]). scripts/build.mjs also reads this
   same data to emit fixed-value @utility entries for every named value into
   dist/compiler/tailwind.css, so the v4 export is self-contained without
   requiring the JS plugin -- tokenGroup names DEFAULT_TOKENS's key rather
   than storing values directly, so v3 can still resolve user overrides
   through `tokens` while v4 always gets the shipped defaults. */
const TOKEN_UTILITY_GROUPS = [
  { names: ['tm-duration'], props: ['--tm-duration'], tokenGroup: 'durations' },
  { names: ['tm-delay'], props: ['--tm-delay'], tokenGroup: 'delays' },
  { names: ['tm-ease'], props: ['--tm-easing'], tokenGroup: 'easing' },
  { names: ['tm-repeat'], props: ['--tm-iteration-count'], tokenGroup: 'repeat' },
  // tm-stagger-step-* is the 0.6 spelling; tm-stagger-* is the shorter one
  // introduced with the choreography module. Same token, same behaviour.
  { names: ['tm-stagger-step', 'tm-stagger'], props: ['--tm-stagger-step'], tokenGroup: 'stagger' },
  // Motion-profile factor, for a scope that needs one axis of a personality
  // without taking a whole tm-motion-* profile.
  { names: ['tm-speed'], props: ['--tm-duration-scale'], tokenGroup: 'speed' },
  // Emphasis moves how far a keyframe departs from rest; overshoot moves
  // only the frames that travel past it. tm-emphasis sets both, which is
  // what a personality wants; tm-overshoot flattens the spring on its own.
  { names: ['tm-emphasis'], props: ['--tm-emphasis', '--tm-overshoot'], tokenGroup: 'emphasis' },
  { names: ['tm-overshoot'], props: ['--tm-overshoot'], tokenGroup: 'emphasis' },
  // Hold duration for tm-hold-confirm.
  { names: ['tm-hold'], props: ['--tm-hold-duration'], tokenGroup: 'hold' },
  // Travel distance for every slide entrance and exit. --tm-exit-distance
  // derives from this, so one utility retunes both.
  { names: ['tm-distance'], props: ['--tm-distance'], tokenGroup: 'distance' },
];

module.exports = plugin.withOptions(
  (options = {}) => {
    return ({ addBase, addUtilities, matchUtilities, theme }) => {
      /* Opt-in, default off: this plugin is documented and widely used
         alongside the complete `tailmotion/css` import (for token
         customization and arbitrary values), which already ships every
         class and keyframe unconditionally. Registering the Phase 1
         catalogue unconditionally here too would silently double that output
         for every existing user, in both Tailwind majors -- and under
         Tailwind v4's `@plugin` directive specifically, addBase/addUtilities
         content is not tree-shaken by usage at all (confirmed empirically:
         v4's JS-plugin compatibility layer ships it always, unlike v3's
         JIT), so it would be a fixed size increase with no pruning benefit.
         Pass `usageGenerated: true` to opt in -- see docs/COMPILER_PLAN.md
         and docs/install.mdx. For Tailwind v4, prefer importing
         `tailmotion/tailwind.css` instead, which *is* natively tree-shaken. */
      if (options.usageGenerated) {
        addBase(SIMPLE_BASE);
        addBase(simpleKeyframesAsAtRules());
        addUtilities(SIMPLE_ANIMATION_UTILITIES);
        addUtilities(SIMPLE_TRANSITION_UTILITIES);
        addUtilities(SIMPLE_STATIC_UTILITIES);
      }

      const tokens = resolveTokens(theme('tailmotion', {}), options);

      for (const group of TOKEN_UTILITY_GROUPS) {
        matchUtilities(
          Object.fromEntries(
            group.names.map((name) => [
              name,
              (value) => Object.fromEntries(group.props.map((prop) => [prop, withImportant(value)])),
            ])
          ),
          {
            values: tokens[group.tokenGroup],
            supportsNegativeValues: false,
          }
        );
      }
    };
  },
  () => ({
    theme: {
      extend: {
        tailmotion: DEFAULT_TOKENS,
      },
    },
  })
);

/* Exposed for scripts/build.mjs, which serializes this same data into the
   `tailmotion/tailwind.css` (v4 `@utility`) export -- one authored data set
   feeding both Tailwind majors, instead of a third hand-copied CSS file. */
module.exports.__simple = {
  SIMPLE_KEYFRAMES,
  SIMPLE_ANIMATION_UTILITIES,
  SIMPLE_TRANSITION_UTILITIES,
  SIMPLE_STATIC_UTILITIES,
  TOKEN_UTILITY_GROUPS,
  DEFAULT_TOKENS,
};

module.exports.default = module.exports;

