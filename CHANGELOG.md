# Changelog

## 0.9.0 · 2026-08-25

Text can now shimmer, swap values and stream in word by word; stagger can opt
into blur; avatar stacks have a first-class overflow cell; and every bundled
`hover:` animation now has a stable `group-hover:` form.

### Added

- **Three text-motion utilities.** `tm-shimmer-text` sweeps a gradient through
  the element's own glyphs without duplicate markup. `tm-number-swap` animates
  characters with a 40ms default stagger, and `tm-stream-text` resolves words
  with a 60ms default stagger and tunable blur.
- **Two dependency-free helpers.** `initNumberSwapElement(element, options)`
  returns an `update(value)` controller, and
  `initStreamTextElement(element, options)` returns an `update(text)`
  controller. Both are exported from `tailmotion/utils`, included on the
  default `TailMotion` object, and fully typed.
- **Opt-in stagger blur.** Add `tm-stagger-blur` beside `tm-stagger` to resolve
  children through an 8px blur on entrance and exit. Existing stagger markup
  remains unchanged because `--tm-stagger-blur` defaults to `0px`.
- **Avatar overflow cells.** `tm-avatar-more` provides the visual and stacking
  behavior for a `+N` cell inside `tm-avatar-group`.
- **Complete stable-hover coverage.** All 43 bundled `hover:tm-*` classes now
  have matching `group-hover:tm-*` variants, including translation, scale,
  rotation, flip, celebration and ambient effects.
- New public variables for shimmer text, number and stream stagger timing,
  stream blur, stagger blur and avatar overflow colour.
- `npm run check` now fails when a bundled hover variant has no matching
  `group-hover:` selector.

### Fixed

- **Hover animations no longer need to chase their own hit target.** The demo,
  copied examples and documentation now put `group` on a stationary parent and
  `group-hover:tm-*` on the moving child. This prevents geometry-changing
  keyframes from repeatedly losing and regaining `:hover`.
- **Avatar rings no longer look like the avatar is growing.** The ring now
  fades at a fixed width instead of animating its spread from zero.
- Explorer search renders one clear control instead of the browser's native
  search control beside a custom one.

### Changed

- **Avatar groups respond per avatar.** Hovering or focusing one avatar lifts
  that avatar and reveals its own ring and tooltip; the whole stack no longer
  spreads on group hover. Lift now uses the individual `translate` property.
- **Migration note:** `--tm-avatar-gap` was removed. Use the stack's existing
  overlap behavior and `tm-avatar-more` for overflow rather than retuning a
  group spread.
- `tm-stagger` children include `filter` in their motion path so the optional
  blur can enter and exit cleanly.
- The full stylesheet is now about 215 KB raw and 31.6 KB gzipped.

### Documentation and demo

- Added structured recipes for shimmer text, number swaps, streaming text and
  avatar overflow, plus the stable-parent hover pattern.
- Expanded Tailwind v3 preflight guidance for `tm-hold-delete` and
  `tm-liquid-btn`, including appearance-class workarounds.
- Added live Explorer previews for the new text utilities and updated the
  composability examples to generate safe `group-hover:` markup.
- Refined the landing-page content and navigation: related destinations now
  share an Explore menu, mobile uses one combined Menu, and all navbar controls
  share a common alignment and spacing system.

## 0.8.0 · 2026-08-24

TailMotion stops being a keyframe collection. Six layers turn it into a motion
language: personalities that retune a subtree, presence that reads the state
your application already owns, real entrances and exits for the three elements
the browser controls, motion-only recipes for the patterns everyone rebuilds,
scroll reveals with no observer, and stagger that can also leave.

Nothing was removed. Every 0.7 class still exists and still does what it did.

### Added

- **Motion personalities.** `tm-motion-calm`, `tm-motion-productive`,
  `tm-motion-expressive` and `tm-motion-default` retune every TailMotion
  descendant from one class on an ancestor, without changing a single animation
  class. Duration is a factor rather than a value, so each animation keeps its
  own relative character: `tm-pop` stays livelier than `tm-fade-in` in all
  three. Element-level utilities still win, profiles nest predictably, and the
  whole thing is inherited custom properties, so it costs nothing at runtime.
  Single-axis utilities too: `tm-speed-*`, `tm-emphasis-*`, `tm-overshoot-*`
  and `tm-no-overshoot`.
- **Five easing roles.** `--tm-ease-entrance`, `--tm-ease-exit`,
  `--tm-ease-interaction`, `--tm-ease-morph` and `--tm-ease-emphasis`. Classes
  opt into a role; a profile retunes the role. Animations with a character of
  their own — linear spins, ambient drifts — stay out of it and keep their
  literal curve.
- **State-driven presence.** `tm-presence-fade`, `-scale`, `-pop`,
  `-slide-block` and `-slide-inline` animate between open and closed using the
  state you already set: `data-state`, `aria-expanded`, `aria-pressed`,
  `aria-checked`, or `.tm-open` / `.tm-closed`. An element with no recognised
  state is treated as open, so a typo leaves content visible. Built from
  transitions, so reversing mid-flight retargets from the current position
  instead of restarting, and `@starting-style` supplies the missing first frame
  for an element mounted already open. Closed ends on `visibility: hidden`, so a
  closed panel is neither clickable nor announced.
- **Native HTML motion.** `tm-native-popover`, `tm-native-dialog` and
  `tm-native-disclosure` give `[popover]`, `<dialog>` and `<details>` real
  entrances and exits — including exits out of `display: none` and the top
  layer — with no JavaScript and no opinion about colour, size, padding or
  radius. The browser keeps focus management, light dismiss, Escape and every
  native semantic.
- **Product-motion recipes.** `tm-menu`, `tm-dialog` + `tm-dialog-backdrop`,
  `tm-toast`, `tm-tooltip`, `tm-accordion-panel`, `tm-tab-panel`,
  `tm-tab-indicator`, `tm-feedback-button` and `tm-hold-confirm`. Each encodes
  the motion decisions that pattern needs — direction, transform origin, how
  much shorter the exit is — and nothing else. `tm-menu` and `tm-tooltip` read
  `data-side` for their transform origin, which is what Radix UI, Base UI and
  Floating UI already emit.
- **Scroll-driven motion.** `tm-scroll-fade`, `-reveal`, `-slide-block`,
  `-scale` and `tm-scroll-progress`, on CSS view timelines, with four range
  utilities. No IntersectionObserver, no scroll listener. Entirely inside
  `@supports (animation-timeline: view())`, so a browser without it renders
  ordinary, fully visible content.
- **Stagger became choreography.** `tm-stagger-from-end` (alias
  `tm-stagger-reverse`), `tm-stagger-from-start`, `tm-stagger-exit`, and
  `tm-stagger-50` … `tm-stagger-200` as shorter spellings of
  `tm-stagger-step-*`. A container carrying `data-state` plays the entrance when
  open and the exit when closed. Reverse order reads a second generated index
  counted from the last child, so nothing moves in the DOM and reading order,
  tab order and the accessibility tree are untouched.
- **Focused module entries.** `tailmotion/profiles.css`,
  `tailmotion/presence.css`, `tailmotion/native.css`, `tailmotion/recipes.css`,
  `tailmotion/scroll.css` and `tailmotion/choreography.css`. Each is
  self-contained, so it works without the full stylesheet. Per-animation imports
  are unchanged.
- **`npm run check`.** Static checks over the built stylesheets: every
  `animation-name` resolves to real keyframes, no rule hides content outside an
  `@supports` guard or a closed state, `:root` carries no timing token, and
  every module ships a reduced-motion reset.

### Fixed

- **`tm-distance-*` now retunes exits.** `--tm-exit-distance` was declared on
  `:root` as `calc(var(--tm-distance) * 0.7)`. A custom property is substituted
  where it is declared, so that `calc()` froze at 8.4px against the root
  distance and never saw a `tm-distance-*` utility further down the tree — the
  opposite of what the plugin documented. The ratio is resolved on the element
  now.
- **Reduced motion reaches `::backdrop`.** Added as its own rule rather than
  appended to the existing selector list, since one unparsed part would have
  discarded the whole thing in an older engine.

### Changed

- **32 keyframes moved from `transform` to `translate` / `scale` / `rotate`**,
  covering every entrance, exit, presence and scroll class. A TailMotion class
  on an element that already carries a Tailwind `rotate-*`, `scale-*` or
  `-translate-*` no longer erases it. The 32 that still write `transform` are
  3D flips, order-sensitive keyframes, pseudo-element sweeps and text effects,
  and the README says which and why rather than converting them unsafely.
- **`tm-pop` overshoots slightly more**, now that it reads the shared
  `--tm-ease-emphasis` curve instead of its own
  `cubic-bezier(0.18, 0.89, 0.32, 1.28)`. `tm-ease-*` on the element still
  overrides it, and `--tm-overshoot: 0` removes the overshoot entirely.
- **`tm-stagger` moved** from `animations/professional.css` to
  `choreography/stagger.css`. Same class, same bundle; only a per-file import
  path changes.
- **Stagger past 20 children** now reuses the last delay instead of falling back
  to zero, so a long list lands together at the end rather than all at once at
  the front.
- Several keyframes gained `--tm-emphasis` and `--tm-overshoot` factors so a
  profile can reach them: `tm-pop`, `tm-scale-in`, `tm-zoom-in`, `tm-zoom-out`,
  `tm-drop-in`, `tm-elastic`, `tm-bounce`, `tm-pulse`, `tm-shake`,
  `tm-blur-in`, `tm-scale-out` and `tm-blur-out`.

### Documentation

- New README section, *What TailMotion can do that a keyframe collection
  cannot*, plus a per-class reference table covering trigger, states, timing,
  required markup, variables, reduced motion, RTL and fallback.
- A browser-support table naming the exact fallback for every guarded feature.
- React Native is documented as unsupported: TailMotion needs real CSS and DOM
  selectors. React Native Web is supported only for its browser target.
- A new demo page at `/capabilities/` switches the same interface between
  personalities, directions and motion preferences without changing any markup.


## 0.7.1 · 2026-08-24

### Fixed

- **`tm-view-morph` no longer layout-thrash on mobile.** The container can keep
  a fixed stage and reshape with `clip-path: inset()`, so phones no longer
  recompute width and height every frame. Touch devices also skip the live
  blur, which Safari was rasterizing even on hidden panels.

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
