# Changelog

## 0.7.0 · 2026-08-24

TailMotion becomes a deliberate motion vocabulary: five categories, each with
one job, no colors, no layout, and logical direction names that mirror
themselves in right-to-left contexts.

### Fixed

- **Timing tokens no longer shadow per-class defaults.** `--tm-duration`,
  `--tm-delay`, `--tm-easing` and `--tm-iteration-count` were given values on
  `:root`, so every `var(--tm-duration, 450ms)` fallback in the library was dead
  code. Every animation ran at 400ms and every loop animation ran exactly once,
  `tm-spin`, `tm-pulse`, `tm-glow`, `tm-float`, `tm-bounce`, `tm-morph`,
  `tm-sway`, `tm-drift`, `tm-ripple` and `tm-sparkle` included. The root values
  are gone; each class now uses its own tuned timing and loop animations loop.
- **Reduced motion now reaches pseudo-elements and generated children.** The
  `prefers-reduced-motion` rule only matched elements carrying a `tm-` class, so
  `tm-shimmer-hover`'s sweep and the animated children of `tm-stagger` and
  `tm-count-reveal` kept moving.
- `tm-rotate-in` was documented and had a `hover:` variant but no keyframes.
  It now exists.
- `hover:tm-drop` pointed at a keyframe name that was never defined.
- `tm-lift-hover`, `tm-rotate-hover` and `tm-rotate-press` replayed keyframes on
  a state change, so releasing early snapped or restarted. They are transitions
  now. `tm-rotate-press` also no longer leaves the element at `scale(0.98)`
  after a click.

### Added

- Logical slide entrances: `tm-slide-block-start`, `tm-slide-block-end`,
  `tm-slide-inline-start`, `tm-slide-inline-end`. Inline-axis motion mirrors
  itself under `[dir="rtl"]`.
- `tm-scale-in`, a neutral scale entrance with no overshoot.
- Exit keyframes: `tm-fade-out`, `tm-scale-out`, `tm-slide-block-out`,
  `tm-slide-inline-out`, `tm-blur-out`.
- Interruptible interaction utilities: `tm-press`, `tm-hover-lift`,
  `tm-hover-scale`, `tm-icon-swap`.
- `tm-view-morph`, a structured recipe that cross-fades mounted views while
  transitioning the container between consumer-provided dimensions.
- `tm-shimmer`, a continuous sweep for skeleton and loading states.
- `tm-distance-*` and `tm-stagger-step-*` utilities, plus `distance` and
  `stagger` token groups in the Tailwind plugin.
- `tm-gpu`, opt-in GPU promotion.
- `focus-visible:` variants, and `hover:` / `focus-visible:` / `group-hover:` /
  `focus-within:` / `motion-safe:` variants for the new entrance and exit
  classes.
- Effect color tokens: `--tm-color`, `--tm-shadow-color`, `--tm-glow-color`,
  `--tm-outline-color`, `--tm-shimmer-color`, `--tm-shimmer-opacity`.

### Changed

- **No effect ships a color.** The blue in `tm-glow`, the indigo in `tm-ripple`,
  the white sheen in `tm-shimmer-hover`, the slate shadow in `tm-lift-hover`,
  and the black-on-white avatar tooltip with its blue focus ring all derive from
  `currentColor` now, via `color-mix(in oklab, ...)` with a flat fallback.
- `tm-fade-in` is opacity only; it no longer lifts 10px. Use
  `tm-slide-block-start` for fade plus lift.
- Entrances are shorter and travel less: slides run 260ms over `--tm-distance`
  (12px), where they were 400ms over 30px. `tm-blur-in` is 280ms and no longer
  scales.
- `tm-slide-up`, `tm-slide-down`, `tm-slide-left` and `tm-slide-right` are now
  compatibility aliases of the logical classes.
- `will-change` is opt-in. It was removed from every one-shot animation and from
  properties that cannot be GPU-composited (`box-shadow`, `border-radius`,
  `background-position`). Add `tm-gpu` where you have measured stutter.
- `tm-lift-hover` no longer forces `display: inline-flex`, and `tm-rotate-hover`
  and `tm-rotate-press` no longer force `display: inline-flex` either.
- The stagger step is 100ms, not 80ms, and is tunable with `--tm-stagger-step`.
- `staggerStyle()` defaults to a 100ms step and emits `--tm-stagger-index`
  alongside `--tm-stagger`, so one call drives `tm-stagger` and
  `tm-count-reveal`.
- `tm()` accepts `distance` and `staggerStep` modifiers.
- `tm-hold-delete` uses explicit transition properties instead of
  `transition: all`, and its pressed foreground is `--tm-hold-fg`.
