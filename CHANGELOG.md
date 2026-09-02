# Changelog

## 0.11.0 · 2026-09-02

Every continuous effect now runs on the compositor, and the build fails if that
stops being true.

A looping animation that touches a paint-tier property re-rasterizes its
element on the main thread on every frame, for as long as the page is open,
whether or not anyone is looking at it. Three classes were doing exactly that.
Nothing in the project would have caught a fourth.

### Changed

- **`tm-shimmer-text` gained a sweep recipe and runs on the compositor.**
  The old implementation painted a gradient through `background-clip: text`
  and animated `background-position`, which re-rasterizes the glyph clip and
  repaints the gradient every frame. The new form moves a masked window across
  a copy of the text while the copy counter-translates by the same amount, so
  the glyphs stay still and the whole loop is one transform:

  ```html
  <p class="tm-shimmer-text">
    Generating response
    <span class="tm-shimmer-text-sweep" aria-hidden="true">
      <span>Generating response</span>
    </span>
  </p>
  ```

  **Migration:** none is required. Markup with no sweep child keeps the old
  behaviour unchanged, scoped off by `:has()`. That path is now the only
  looping effect in the library that still repaints, and it is scheduled for
  removal in 1.0. The element must carry no padding of its own for the recipe
  — put padding on a parent — and it needs to establish a box (block,
  inline-block or grid). Two new guarded features, `mask-image` and
  `:has()`, are in the browser-support table; without `:has()` (Firefox
  before 121) an element with no sweep child renders as ordinary, fully
  visible text rather than shimmering.

- **`tm-glow` and `tm-ripple` paint on a pseudo-element.** Both animated
  `box-shadow`, which no engine can composite. The halo and the ring are now
  drawn once on `::after` and only their opacity and scale move.

  **Migration:** both classes now own the element's `::after` and set
  `position: relative` on it. If your own CSS puts a pseudo-element on the
  same element, one of the two will win; and the element is now the containing
  block for any absolutely positioned descendant. Every token
  (`--tm-glow-size`, `--tm-glow-spread`, `--tm-ripple-size` and the
  colors) keeps its meaning, and the prebuilt `hover:`, `focus:`,
  `group-hover:`, `focus-within:`, `focus-visible:` and responsive
  variants carry the same setup, so `hover:tm-glow` still works with no base
  class alongside it.

- **`tm-ripple` uses the individual `scale` property** rather than the
  `transform` shorthand, so a Tailwind `rotate-3` on the same element now
  survives it.

- Under `prefers-reduced-motion: reduce`, the shimmer sweep recipe returns
  its text to full contrast instead of leaving it at the 45% resting value.
  With no sweep running there is nothing for the dimming to buy, and a reader
  who asked for less motion should not also get less contrast.

### Fixed

- **`tm-unfold` was not transform-safe.** It animated
  `transform: scaleY() translateY()`, so a Tailwind `rotate-3` on the same
  element was silently discarded for the length of the animation — the one
  entrance in the library where the documented guarantee did not hold. It now
  uses the individual `scale` and `translate` properties like the other 25.
- **`tm-morph` declared `border-radius: inherit` in a keyframe.** The value
  was identical at both ends, so it animated nothing while still forcing the
  browser to treat `border-radius` as an animated property on every frame of
  a 4000ms infinite loop. Removed.
- **Every documented size was stale.** The full bundle was described as
  31.6 KB gzipped and measured 35.3 KB, a 10% drift accumulated over two minor
  releases, with the same drift on all six module entries and in the prose.
  All 25 claims are corrected and now checked.
- **The 8px blur cap was not true.** `tm-text-rotate` used 10px and
  `tm-text-morph` 12px. Both are one-shot, on one inline element, and the
  blur is the word-to-word transition rather than decoration, so both are kept
  and documented as named exceptions; the cap is now enforced on everything
  else. Browser support also now notes that `tm-motion-expressive` multiplies
  `--tm-emphasis` to 1.3, so an 8px blur resolves to 10.4px inside that scope.

### Added

- **`scripts/check-render-cost.mjs`, wired into `npm run check`.** It reads
  the built stylesheet with a real structural parser and sorts every animated
  property into compositor, filter, paint or layout. It fails the build when a
  loop leaves the compositor, when one-shot paint or layout work has no
  allowlist entry naming the reason, when a blur exceeds 8px, when a transition
  names `all`, when `will-change` names a property the compositor cannot act
  on, or when an entrance, exit, presence or scroll keyframe uses the
  `transform` shorthand. A property it does not recognise is a failure, not a
  default, so a new one has to be classified deliberately.
- **`dist/render-cost.json`**, written on every check: one record per animated
  rule with its selector, keyframes, animated properties, tier, and whether it
  loops. It is excluded from the published tarball — 170 KB of analysis is not
  something anyone installing a stylesheet should download — and `npm run
  check` fails if that exclusion is ever lost.
- **A [Render cost](https://docs.tailmotion.moumen.dev/docs/reference/render-cost)
  reference page**, naming the four tiers, the guarantee, and every exception.
- **A size-drift check.** `npm run check` now fails when a size quoted in
  README.md or the imports reference is more than 2% off the file it describes,
  and `node scripts/sync-doc-sizes.mjs` rewrites them all from the build.
- **`npm test`.** Twelve tests over the pure helpers in `src/utils.js`,
  which had none, using `node:test` and no dependencies. One of them checks
  that every class `tm()` can build actually exists in the stylesheet.
- **`verify/assert.html`**, 26 assertions that run in whatever browser opens
  the page: feature support with the fallback for anything missing, every class
  in the manifest still leaving content on screen at rest, the same under a
  reduced-motion collapse, RTL mirroring, transform safety against an inline
  `transform: rotate(6deg)`, presence driven by `data-state`, and the sweep
  recipe's geometry. A page rather than a Playwright script on purpose:
  Playwright's WebKit is not Safari, and Safari is the browser whose fallbacks
  most need checking. Green in Chromium at the time of writing.
- **Render cost badges in the demo explorer**, generated into
  `demo/src/render-cost.js` by the same check rather than typed by hand. Only
  classes that leave the compositor carry one, so a badge means something.
- **A complete listing of every class that leaves the compositor** on the render
  cost page — 29 of them, 5 of which loop — with the count, the loop count and
  every name in the table checked against the stylesheet.
- **A consolidated [removal notice](https://docs.tailmotion.moumen.dev/docs/support)
  for 1.0**, naming the zero-markup shimmer path, `tm-hold-delete` and the
  `tm-liquid-*` family, each with what to use instead.
- **`verify/render-cost.html`**, a harness covering the sweep recipe, the
  legacy path, the glow and ripple pseudo-elements, the variants used without a
  base class, transform safety under an inline `rotate`, and a load section.
- **`npm run perf` (optional).** Traces a real Chromium and counts paint
  events per second for every looping class, failing when one the manifest
  calls compositor-only paints anyway. Playwright is not a dependency; the
  script says how to install it and exits cleanly when it is absent.

  Measured on first use: the zero-markup `tm-shimmer-text` produces about
  2,527 paint events a second across twenty copies, roughly two per element per
  frame, while the sweep recipe that replaces it produces none. `tm-glow`,
  `tm-ripple` and every other looping class in the core also measure zero.

  It uses the paint-tier loops as a control group: those are known to repaint,
  so if one of them registers no paints the fixture is not exercising the
  class and the run is reported as inconclusive rather than green. That guard
  earned itself immediately — the first run returned all zeroes and a pass,
  because the fixture's own `.cell { background: … }` was unlayered and
  unlayered rules beat every rule in a cascade layer regardless of
  specificity. It was overwriting the gradient `tm-shimmer-text` animates, so
  the most expensive loop in the library measured as free. The fixture's
  styles now sit in a layer declared below the library's, the dark veil layer
  modifiers are composed with `tm-dark-veil` instead of being measured alone,
  and the shimmer sweep is measured in its real markup.
- **`docs/QUALITY_PLAN.md`**, the plan this release is the first milestone of.

### Documentation

- Zero-runtime, support and browser-support now state the compositor guarantee
  and point at the render-cost page.
- The class reference notes that `tm-glow` and `tm-ripple` own `::after`,
  and that `tm-shimmer-text` takes a sweep child.
- Structured recipes gained the shimmer sweep, with the React form.
- The demo catalogue shows the recipe markup and labels `tm-shimmer-text` as
  markup-shaped rather than class-only.

## 0.10.1 · 2026-08-25

Word rotation (`tm-text-flip`, `tm-text-rotate`, `tm-text-morph`) no longer
needs JavaScript to cycle.

### Added

- **CSS-only word cycling.** Render every word as a sibling `*-word` span and
  set `[data-tm-count]` on the container (2-6 words supported); an infinite
  animation, phased per word via `:nth-child`, cycles through them forever.
  No JS, no `setInterval`, nothing mounted or torn down. Every word shares
  one grid cell (`grid-area: 1 / 1`) so they stack instead of running
  together with no space between words. In React, Vue or Svelte this is just
  `words.map()`.
- `initTextFlipElement` now also reads a `data-tm-words='["a","b","c"]'` JSON
  attribute off the element when no `words` option is passed.
- A reduced-motion fallback freezes the cycle on its first word, since each
  word's own keyframes intentionally end hidden (for seamless looping) and
  the existing collapse-to-1ms rule would otherwise leave the container
  showing nothing.

### Changed

- **`initTextFlipElement` no longer runs an interval for `"flip"`, `"morph"`
  or `"rotate"`.** It renders every word once, sets `[data-tm-count]`, and
  gets out of the way -- CSS owns every cycle after that. `"chars"` is
  unchanged and keeps its `setInterval`-driven `TextRotator` controller,
  since each word change there re-splits fresh characters rather than
  swapping between two fixed states. **Migration note:** code calling
  `.start()`, `.stop()`, `.next()`, `.prev()` or `.goTo()` on the return
  value for the `flip`/`morph`/`rotate` variants should remove those calls --
  the new controller only exposes `.destroy()`.

### Fixed

- Demo: clicking "Copy install" no longer pushes "View on GitHub" onto a new
  line. The button previously resized when its label changed to "Copied
  install"; it now reserves width for the longer of its two label states.

### Documentation and demo

- Corrected `docs/guides/structured-recipes.mdx`, which previously said text
  flip/rotate/morph "genuinely need JavaScript" -- CSS-only markup is now the
  documented default, with the JS helper positioned as an optional
  convenience for vanilla projects.
- Demo entries for `tm-text-flip`, `tm-text-rotate` and `tm-text-morph` now
  show the CSS-only markup and are labelled "Markup" instead of "JS",
  matching how `tm-view-morph` is already labelled.
- Added `verify/text-cycle.html` for manual QA of the new cycling behavior.

## 0.10.0 · 2026-08-25

Tailwind v3 and v4 can now generate only the animation and interaction
utilities your markup actually uses, instead of the whole catalogue.

### Added

- **Usage-generated CSS for the simple animation/interaction catalogue
  (experimental).** Tailwind v3:
  `require("tailmotion/plugin")({ usageGenerated: true })` registers the
  fade/pop/bounce-style utilities and interactions (about 47 classes) as real
  Tailwind utilities, so the v3 JIT emits only what your content uses.
  Tailwind v4: `tailmotion/tailwind.css` is a new, natively tree-shaken
  `@utility` entry covering the same catalogue. In both cases, keyframes and
  the token/reduced-motion base layer still ship unconditionally — neither
  Tailwind major prunes a `@keyframes` block for a custom-named utility, and
  the base layer is a real dependency regardless of which classes are used.
  Use either path instead of `tailmotion/css`, not alongside it.
- **`tailmotion/tailwind.css` also includes the fixed-value token modifiers**
  (`tm-duration-*`, `tm-delay-*`, `tm-ease-*`, `tm-repeat-*`, `tm-stagger-*`,
  `tm-speed-*`, `tm-emphasis-*`, `tm-overshoot-*`, `tm-hold-*`,
  `tm-distance-*`) at their shipped values, so it works standalone in
  Tailwind v4 with no JS plugin required. Arbitrary values
  (`tm-duration-[420ms]`) still need `@plugin "tailmotion/plugin";` alongside
  it — its `matchUtilities` registrations tree-shake correctly under v4's
  JS-plugin compatibility layer, unlike `addUtilities`/`addBase`.
- `npm run check` now also builds real Tailwind v3 and v4 fixtures
  (`scripts/check-tailwind.mjs`) and asserts that pruning behavior holds; a
  self-consistency guard (`checkCatalogueConsistency`) fails if a utility and
  its keyframe ever drift out of sync with each other.
- **`scripts/check-phase1-source-parity.mjs`** (also wired into `npm run
  check`) checks the transcribed catalogue against the actual
  `src/animations/*.css` it was copied from, so a future retune of a
  duration or keyframe that isn't also updated in `tailmotion.config.cjs`
  fails the build instead of silently shipping a stale value.
- `npm run check` also verifies, via a real `npm pack --dry-run`, that every
  file consumers need (including `dist/compiler/tailwind.css`) actually lands
  in the published tarball.

### Changed

- The repository has its first npm dependencies: `tailwindcss` and
  `@tailwindcss/cli` (dev-only, for the fixture check above). Contributors
  now need `npm install` before `npm run check`.
- Declared a `devEngines` requirement of Node 20+ (the fixture check's
  `@tailwindcss/cli` dependency needs it). The package's own published
  `engines.node` stays `>=16.0.0` — unaffected, since this only applies to
  installing devDependencies in this repository. `check-tailwind.mjs` also
  fails with an actionable message on an older Node instead of a native
  binding error.

### Documentation

- Documented `usageGenerated` and `tailmotion/tailwind.css` in Installation
  and the plugin reference, including why Tailwind v4's `@plugin` directive
  cannot use the option the same way (it does not tree-shake legacy JS plugin
  output by usage).

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
