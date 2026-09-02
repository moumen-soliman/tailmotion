# TailMotion Quality Plan

Next steps for raising the quality of the package, in priority order. Written
against 0.10.1 on 2026-09-01. Every number below was measured from this
checkout, not estimated; regenerate them before quoting.

The bar: TailMotion sells *motion decisions already made*. A decision the user
did not make is only worth trusting if it is cheap at runtime, correct in every
supported browser, honest in the docs, and verified by the build. Each section
below closes one gap between what the README promises and what the repository
currently proves.

## Status

**0.11 is done.** Sections 1, 2 and 8 are shipped, plus the parts of 5 and 7
that needed no new dependency. What follows is the plan as written, with the
completed work marked. Re-measure before quoting any number.

| Section | State |
|---|---|
| 1. Render cost: compositor-only loops | **Done.** `tm-shimmer-text` has a compositor sweep recipe, `tm-glow` and `tm-ripple` paint on a pseudo-element |
| 2. Render cost as a checked guarantee | **Done.** `scripts/check-render-cost.mjs`, in `npm run check`, writing `dist/render-cost.json` |
| 3. A measured perf harness | **Done**, apart from a committed baseline. Measured: the old text shimmer paints ~2,527 times a second across 20 copies, the recipe replacing it paints zero, and every looping class in the core measures zero. Playwright stays an opt-in install |
| 4. Cross-browser evidence | **Mostly.** `verify/assert.html` runs 26 assertions in any browser that opens it, including real Safari, which a Playwright matrix cannot reach. Screenshot diffing is not done |
| 5. One manifest, five consumers | **Partly.** Sizes, keyframe counts, the render-cost listing and the demo's badges are all generated or checked from the analysis; the full class manifest is still the compiler's to build |
| 6. Curate the catalogue | **Partly.** Cost labels ship in the demo and the docs, and the 1.0 removals are announced. The core/decorative module split is not done — see below |
| 7. Test the JavaScript helpers | **Partly.** `npm test` covers the pure helpers; the DOM helpers still need a browser harness |
| 8. Docs that cannot go stale | **Done** for sizes, keyframe counts, the blur cap and the compositor guarantee |
| 9. Release plan | 0.11 shipped |

Four things the work turned up that this plan did not predict:

- **`tm-morph` declared `border-radius: inherit` in a keyframe** with the
  same value at both ends. It animated nothing and forced `border-radius`
  onto the animated-property list of a 4000ms infinite loop. Removed.
- **The 8px blur cap was already false.** `tm-text-rotate` used 10px and
  `tm-text-morph` 12px. Both are now named exceptions rather than silent ones.
- **The README and `transform-safety.mdx` contradicted each other.** The
  README claimed every entrance was transform-safe; the concept page correctly
  excluded `tm-unfold`, `tm-flip-*` and `tm-swing-*`. The README was wrong,
  and the keyframe counts in both were stale by a whole release cycle.
- **Every documented size had drifted**, by 5-10%, which is what prompted
  making size drift a build failure rather than a one-time correction.
- **The first perf run was a false pass.** Every class reported zero and the
  script called it green, because the fixture's own unlayered `.cell`
  background beat the library's `@layer utilities` and removed the gradient
  `tm-shimmer-text` animates. A measurement harness needs a control group as
  much as a test suite needs a failing test.

**Why the decorative module split is still open.** The plan asks for a
`tailmotion/decorative.css` entry. Shipping one is easy; it is also close to
useless, because nobody wants decorative-only. The useful version is the
opposite — a core entry *without* the decorative families — and that either
changes what `tailmotion/css` means or adds an eighth entry point to a package
whose modules already duplicate the token layer. That is a product decision
about the package's public surface, not a quality fix, and it belongs to
whoever owns the roadmap. The measurable part of section 6 (labelling what
each class costs, and announcing the removals) is done.

One correction to this plan's own reasoning: section 1 proposed converting any
keyframe using the `transform` shorthand. That is wrong for the handful that
scale or rotate *before* they translate. Individual properties always apply
translate → rotate → scale, so converting those changes where the element ends
up. `transform-safety.mdx` had already reasoned this through; the check now
carries a curated list of what is actually promised rather than a blanket rule.

## 0. Where things stand

| Measured on this checkout | Value |
|---|---|
| Public `tm-*` selectors in `tailmotion.css` | 255 |
| `@keyframes` blocks | 86 |
| Rules whose default iteration count is `infinite` | 12 |
| `will-change` declarations | 19 |
| `tailmotion.css` | 227,960 B raw, 33,511 B gzip |
| `modules/recipes.css` | 23,654 B raw, 6,842 B gzip |
| `modules/native.css` | 18,567 B raw, 5,369 B gzip |
| `modules/choreography.css` | 17,296 B raw, 5,121 B gzip |
| `modules/presence.css` | 16,173 B raw, 5,114 B gzip |
| `modules/scroll.css` | 13,713 B raw, 4,455 B gzip |
| `modules/profiles.css` | 12,903 B raw, 4,058 B gzip |
| `dist/compiler/tailwind.css` | 35,634 B raw, 5,781 B gzip |

What `npm run check` already guarantees (keep all of it):

- every `animation-name` resolves to a real `@keyframes` block;
- nothing hides content outside an `@supports` guard or closed-state selector;
- `:root` carries no timing token that shadows per-class defaults;
- every module ships a reduced-motion reset (and infinite loops are clamped to
  one iteration there, so they cannot flicker at 1ms);
- `hover:` / `group-hover:` variant parity;
- docs navigation and internal links resolve;
- `npm pack` contains every consumer-facing file;
- Tailwind v3 and v4 fixtures prune unused utilities;
- the transcribed catalogue in `tailmotion.config.cjs` matches `src/animations`.

What nothing verifies today:

- **runtime cost**: which properties each class animates, and whether a loop
  repaints every frame;
- **real browsers**: the browser-support table is prose, no engine runs it;
- **numbers in docs**: the sizes in `README.md` and
  `docs/reference/imports.mdx` say 215 KB / 31.6 KB gzip for the full bundle;
  the file is 228 KB / 33.5 KB. Every module row has drifted the same way;
- **the JavaScript helpers** in `src/utils.js` (498 lines, zero tests);
- **the TypeScript declarations** against the CSS they describe.

## 1. Render cost: make every loop compositor-only

### The principle

The browser has three places it can run an animation. Only one of them is
free of per-frame main-thread work:

| Tier | Properties | Cost per frame |
|---|---|---|
| Compositor | `transform`, `translate`, `scale`, `rotate`, `opacity` | GPU only. No style, layout or paint |
| GPU filter | `filter` (blur, hue-rotate, saturate), `backdrop-filter` | Composited in Chromium and Firefox. Safari rasterizes blur, so cost scales with element area |
| Paint | `background-position`, `background-size`, `box-shadow`, `border-radius`, `color`, `mask-position`, `clip-path` (outside Chromium) | Re-rasterize the element, every frame, on the main thread |
| Layout | `width`, `height`, `inline-size`, `block-size`, `inset`, `margin`, `padding`, `grid-template-rows`, `font-size`, `letter-spacing` | Layout plus paint, and layout can cascade to siblings |

A text shimmer that animates `background-position` under `background-clip:
text` is the worst case of the paint tier: each frame re-rasterizes the glyph
outlines as a clip and repaints the gradient through them. That is the
"~20% CPU for one line of text" pattern. Moving a masked or clipped layer with
`transform` instead keeps the whole loop on the compositor.

Continuous effects matter most. A 300ms entrance that paints is 18 frames of
work once; a loop that paints is forever, on every element that carries it,
even while the user does nothing.

### Audit of the current catalogue

Continuous effects (default iteration count `infinite`):

| Class | Animates | Tier | Action |
|---|---|---|---|
| `tm-spin`, `tm-bounce`, `tm-float`, `tm-drift`, `tm-sway`, `tm-pulse`, `tm-sparkle` | transform / individual transforms / opacity | compositor | none; lock in with the check in section 2 |
| `tm-morph` | `transform`, plus `border-radius: inherit` in one keyframe | compositor (verify the radius keyframe is inert) | confirm, then lock in |
| `tm-shimmer`, `tm-shimmer-hover` | `transform` on `::after` | compositor | none; this is the reference implementation |
| **`tm-shimmer-text`** | **`background-position` with `background-clip: text`** | **paint, worst case** | **rewrite (section 1.1)** |
| **`tm-glow`** | **`box-shadow` blur and spread** | **paint** | **rewrite (section 1.2)** |
| **`tm-ripple`** | **`box-shadow` spread plus `transform`** | **paint** | **rewrite (section 1.2)** |
| `tm-wavy`, `tm-wavy-*` | `background-position` on three gradient layers, plus a blurred overlay | paint | move to the decorative tier, document the cost, no rewrite |
| `tm-dark-veil` | `transform` plus `filter: hue-rotate() saturate()` on blurred layers sized `inset: -50%` | GPU filter over a surface 4x the element; rasterized in Safari | decorative tier, document the cost, add a coarse-pointer trim like `tm-view-morph` already has |

One-shot entrances, exits and interactions that leave the compositor tier:

| Class | Animates | Tier | Action |
|---|---|---|---|
| `tm-hover-lift`, `tm-lift` | `translate` plus `box-shadow` transition | paint while hovering | consider the pseudo-element shadow (section 1.2); measure first, this one is short |
| `tm-blur-in`, `tm-blur-out`, `tm-stagger-blur`, `tm-text-*`, `tm-stream-text`, `tm-view-morph` | `filter: blur()` at or under 8px | GPU filter | keep; the 8px cap and the touch-device trim are the right calls, encode the cap in the check |
| `tm-reveal`, `tm-unfold`, `tm-count-reveal` | `clip-path: inset()` | compositor in Chromium only, paint elsewhere | keep; document as "paint outside Chromium, one-shot" |
| `tm-accordion-panel`, `tm-native-disclosure` | `grid-template-rows`, `block-size` | layout, by design | keep; the height tween is the feature |
| `tm-tab-indicator` | `translate` plus `inline-size` | layout | keep; a `scale` version would distort the radius. Document it |
| `tm-liquid-fill`, `tm-liquid-btn`, `tm-hold-delete` | `height`, `color`, `background-color`, `border-radius` transitions | layout and paint | already legacy; schedule removal for 1.0 (section 6) |

### 1.1 `tm-shimmer-text`: move the sweep to the compositor

The current class has one real virtue: it needs no extra markup, the element's
own text is the mask. That virtue is exactly what forces the paint-tier
implementation. A compositor-only text shimmer needs a moving *window* over a
static bright copy of the text, and a window that moves independently of its
content has to be a parent that moves while its child moves back. Pseudo-
elements cannot nest, so no `data-text` trick reaches it; the recipe needs one
wrapper.

Proposed structured recipe (keeps the class name; the child opts in):

```html
<p class="tm-shimmer-text">
  Generating
  <span class="tm-shimmer-text-sweep" aria-hidden="true"><span>Generating</span></span>
</p>
```

```css
@layer utilities {
  .tm-shimmer-text {
    position: relative;
    display: inline-block;
  }

  .tm-shimmer-text-sweep {
    position: absolute;
    inset: 0;
    color: var(--tm-shimmer-text-color);
    pointer-events: none;
    -webkit-mask-image: linear-gradient(
      var(--tm-shimmer-text-angle, 100deg),
      transparent 35%,
      #000 50%,
      transparent 65%
    );
    mask-image: linear-gradient(
      var(--tm-shimmer-text-angle, 100deg),
      transparent 35%,
      #000 50%,
      transparent 65%
    );
    animation: tm-shimmer-text-window var(--tm-duration, calc(2000ms * var(--tm-duration-scale, 1)))
      var(--tm-easing, linear) var(--tm-delay, 0ms) var(--tm-iteration-count, infinite);
    will-change: transform;
  }

  /* The bright copy moves the opposite way by the same amount, so the glyphs
     stay put on screen while the mask window attached to the parent sweeps. */
  .tm-shimmer-text-sweep > * {
    display: block;
    animation: tm-shimmer-text-copy var(--tm-duration, calc(2000ms * var(--tm-duration-scale, 1)))
      var(--tm-easing, linear) var(--tm-delay, 0ms) var(--tm-iteration-count, infinite);
    will-change: transform;
  }

  /* With the sweep child present, the paint-tier fallback must not also run.
     Browsers without :has() drop this whole rule, so the old class is simply
     static text there: fully visible, never doubled. */
  .tm-shimmer-text:not(:has(> .tm-shimmer-text-sweep)) {
    /* existing background-clip: text implementation, unchanged */
  }
}

@keyframes tm-shimmer-text-window {
  from { transform: translate3d(-100%, 0, 0); }
  to   { transform: translate3d(100%, 0, 0); }
}

@keyframes tm-shimmer-text-copy {
  from { transform: translate3d(100%, 0, 0); }
  to   { transform: translate3d(-100%, 0, 0); }
}
```

Both animations must share duration, easing, delay and iteration count, which
they do because both read the same `--tm-*` tokens. Any easing works as long
as it is identical on both; the two translations cancel exactly because the
child is `display: block` inside a parent that is `inset: 0`, so 100% means
the same width on both.

Decisions to make when implementing:

- **Keep or drop the zero-markup path.** Keeping it costs nothing and keeps
  0.9 markup working. The `:has()` guard means Firefox 97 to 120 loses the
  zero-markup shimmer (static, visible text). Firefox 121 shipped `:has()` in
  December 2023, so the population is tiny, but note it in the changelog and
  in `browser-support.mdx`.
- **Inline text that wraps across lines** cannot use the recipe: an absolute
  overlay only lines up on an element that owns its own box. Document that the
  recipe is for block and inline-block elements and leave the zero-markup path
  for a `<span>` inside a paragraph.
- **Reduced motion.** The existing 1ms/one-iteration collapse lands the window
  at `translate3d(100%)`, off the text, so the copy is invisible and the base
  text shows at rest. That is the correct end state; confirm it in the harness.
- **RTL.** The sweep direction is physical. Mirror the two keyframes under
  `[dir="rtl"]` the same way inline-axis motion is mirrored elsewhere.
- Add a `mask-image` row to the browser-support table (unprefixed in Chrome
  120, Safari 15.4, Firefox 53; keep the `-webkit-` prefix for older Chrome).

Acceptance: in the perf harness (section 3), a page with ten looping
`tm-shimmer-text` recipes records zero `Paint` events per second after the
first frame, in Chromium, WebKit and Firefox, and Task Manager CPU for the tab
is indistinguishable from the same page with the loops paused.

### 1.2 `tm-glow` and `tm-ripple`: shadow on a pseudo-element, motion on transform

Both animate `box-shadow`, which cannot leave the paint tier in any engine.
The standard fix is to paint the shadow once on a pseudo-element and animate
only that pseudo-element's `opacity` and `scale`:

- `tm-glow`: `::after` with `inset: 0; border-radius: inherit; box-shadow: 0 0
  var(--tm-glow-size) var(--tm-glow-spread) var(--tm-glow-color); opacity: 0;
  z-index: -1`, then loop `opacity` 0 to 1. The element needs `position:
  relative` and `isolation: isolate`, which `tm-shimmer` already imposes, so
  this is an established contract in the library.
- `tm-ripple`: `::after` with `inset: calc(-1 * var(--tm-ripple-size));
  border: var(--tm-ripple-size) solid var(--tm-outline-color); border-radius:
  inherit`, then loop `scale` 1 to 1.x with `opacity` 1 to 0.

Both keep their public class names and tokens. The only observable change is
that an element that already uses `::after` for something else now conflicts;
document that under required markup, the same way `tm-shimmer` does.

`tm-hover-lift` can use the same trick, but it is a 150ms transition, not a
loop. Measure before touching it: if the harness shows the shadow transition
staying under one frame of paint on a card-sized element, leave it.

## 2. Turn render cost into a checked guarantee

Add `scripts/check-render-cost.mjs` to `npm run check`. It parses the built
`tailmotion.css` and, for every `@keyframes` block and every
`transition-property` list, classifies the animated properties into the four
tiers above. Then it enforces:

1. **Every rule whose default iteration count is `infinite` animates only
   compositor-tier properties**, with `filter: blur()` allowed only when the
   radius resolves to 8px or less. This is what stops the next `tm-glow`.
2. **One-shot keyframes and transitions may use paint or layout properties
   only with an allowlist entry that names the reason** (`tm-accordion-panel:
   grid-template-rows, the height tween is the feature`). An allowlist entry
   without a reason fails.
3. **No blur radius in the library exceeds 8px.** This is already a documented
   rule in `browser-support.mdx`; make it a check.
4. **No `transition: all` and no `transition-property: all`.** Already true;
   lock it.
5. **`will-change` only ever names compositor-tier properties.**
6. **The transform-safety claim is exact.** The README says 32 keyframes use
   individual `translate` / `scale` / `rotate`. The check should enumerate the
   families the claim covers (entrance, exit, presence, scroll) and fail if any
   keyframe in those families uses the `transform` shorthand, and print the
   count so the README number can be regenerated rather than remembered.

The script should also emit `dist/render-cost.json`: one record per public
class with its tier, animated properties, and whether it loops. Section 5 and
the demo consume it.

## 3. A measured perf harness

The tweet's numbers (about 20% for one line of text, under 2% after the mask)
came from one machine and one page. TailMotion should publish its own, from
its own harness, or make no claim.

- Add `verify/perf.html`: a grid of N copies of every looping class, with a
  query string to pick the class and N, and a pause toggle.
- Add `scripts/perf.mjs` using Playwright (devDependency, not in
  `npm run check`, because it needs browser binaries). For each looping class
  it opens the harness in Chromium, starts a CDP trace with the
  `disabled-by-default-devtools.timeline` category for two seconds, and counts
  `Paint` and `RasterTask` events per second. It repeats in WebKit and Firefox
  with screenshots at rest instead of traces, since only Chromium exposes the
  trace.
- Store results in `verify/perf-baseline.json`, print a table, and fail when a
  class recorded in `render-cost.json` as compositor-tier paints more than
  twice per second, or when a class regresses by more than 50% against the
  baseline.
- Run it in CI on a `perf` label and before every release.

Manual measurement, for contributors and for pull-request descriptions:

1. Chrome DevTools, Performance panel, record three seconds with the loop
   running; the flame chart should show no `Paint` or `Rasterize` activity
   after the first frame.
2. Rendering panel, enable Paint flashing; a compositor-only loop never
   flashes.
3. Chrome Task Manager, CPU column for the tab, loop running versus paused.
4. Safari Web Inspector, Timelines, Rendering Frames; look for Paint in every
   frame.

Report before-and-after numbers as a table in the changelog entry.

## 4. Cross-browser evidence for the support table

`docs/reference/browser-support.mdx` names an exact fallback per feature per
engine. Nothing runs it. Add a Playwright matrix (Chromium, WebKit, Firefox)
that loads each `verify/*.html` page and asserts, per section:

- **the runtime counterpart of the static "no hiding" check**: after every
  animation settles, no element with a `tm-*` class has computed `opacity: 0`
  or `visibility: hidden` unless it is in a closed state;
- the same holds with `prefers-reduced-motion: reduce` emulated;
- the same holds with `dir="rtl"`, and inline-axis entrances have mirrored
  end positions;
- `element.getAnimations()` reports the expected count and play state for
  presence, native and stagger sections;
- screenshots at rest, diffed against committed baselines.

Playwright's WebKit is not Safari. Keep a short manual Safari checklist in
`verify/README.md` for the features the table marks "not yet" or version-
gated, and check real Safari before any release that touches a guarded
feature. That matches the existing project rule: check Safari explicitly for
every modern CSS feature and document the fallback.

## 5. One manifest, five consumers

The same facts about a class live today in five hand-maintained places:
`src/**/*.css`, `tailmotion.config.cjs`, `types/index.d.ts`,
`docs/reference/classes.mdx` and `demo/src/animations.js`. The 0.10 parity
script covers the first two. Extend that idea until nothing is transcribed by
hand:

- Have the build emit `dist/manifest.json` from the parsed CSS: class name,
  family, kind (keyframes / transition / recipe), default duration and easing,
  keyframes used, required markup, render tier (from section 2), and the
  module it ships in. `COMPILER_PLAN.md` already wants this manifest for the
  compiler; it is the same artifact.
- Checks against it: every class in the manifest appears in `classes.mdx`;
  every class in the demo catalogue and in the TypeScript union exists in the
  manifest; every manifest entry with `requires: markup` has a markup snippet
  in the demo.
- Generate the size table in `imports.mdx` and the two size lines in the
  README from the build, or fail the check when the documented gzip size
  drifts more than 2% from the measured one. The full bundle has drifted 6%
  across two minor releases, which is exactly the kind of claim the support
  page says is never estimated.
- Generate the `tm-*` class union in `types/index.d.ts` from the manifest.

## 6. Curate the catalogue as a product

`DIFFERENTIATION_PROMPT.md` says: curate instead of accumulating. With 255
selectors, 12 loops and four decorative families, the catalogue no longer
reads as a small set of excellent defaults.

- **Tier the catalogue** into Core (interaction, entrance and exit, presence,
  native, recipes, choreography, scroll) and Decorative (`tm-dark-veil`,
  `tm-wavy-*`, `tm-liquid-*`, `tm-swing-*`, `tm-flip-*`, sparkle and
  friends). Ship a `tailmotion/decorative.css` module, keep everything in the
  full bundle for compatibility, and stop featuring decorative classes on the
  landing page and in the README quick reference.
- **Label render cost everywhere a class is shown.** The demo catalogue
  already has `requires: css | markup | js`; add `cost: compositor | filter |
  paint | layout` from the manifest and show it as a badge. Add a
  `docs/reference/render-cost.mdx` page that lists every class by tier and
  explains when a paint-tier class is fine (one-shot, small, rare) and when it
  is not (looping, many instances, large surfaces).
- **Announce the removals for 1.0 now.** `tm-hold-delete` and `tm-liquid-btn`
  are documented as legacy with motion-only successors; give them a
  deprecation note in the changelog and a console-free path (a doc page, not
  a runtime warning, since there is no runtime).
- **Every new class answers a question the vocabulary cannot.** Keep that
  rule from `support.mdx`, and add the render tier to the pull-request
  template: a new loop that is not compositor-only needs a written reason.

## 7. Test the JavaScript helpers

`src/utils.js` is optional but public. It has no tests.

- Add `npm test` running `node --test` (no dependency) for the pure functions:
  `createCountSpans`, `formatNumber`, `getEasing`, `tm`, `cssVars`,
  `staggerStyle`, `animateValue` with fake timers.
- Cover the DOM helpers (`initTextFlipElement`, `initStreamTextElement`,
  `initCountRevealElement`, `initNumberSwapElement`) in the Playwright harness
  from section 4, where a real DOM and real animations exist. Assert what the
  0.10.1 changelog promises: the `flip` / `rotate` / `morph` variants set
  `[data-tm-count]` and start no interval, and `destroy()` leaves the DOM as it
  found it.
- Type-check `types/index.d.ts` against a small usage file with `tsc --noEmit`
  in the check, so a signature change in `utils.js` cannot ship without a
  declaration change.

## 8. Docs that cannot go stale

- Every number (sizes, class counts, keyframe counts, browser versions the
  guards target) comes from the manifest or the build, never from memory.
- Add the render-cost reference page and a "Performance" section to
  `zero-runtime.mdx` that states the guarantee from section 2 in one sentence:
  every continuous effect in TailMotion runs on the compositor, checked by the
  build.
- Add rows for `mask-image` and `:has()` to the browser-support table when
  section 1.1 lands.
- Keep the existing habit of a changelog entry with a migration note for
  every user-visible change; add before-and-after perf numbers whenever a
  change is motivated by render cost.

## 9. Release plan

| Release | Contents | Gate |
|---|---|---|
| 0.11 | `tm-shimmer-text` recipe, `tm-glow` and `tm-ripple` on pseudo-elements, `check-render-cost.mjs` in `npm run check`, render-cost reference page, regenerated size numbers | `npm run check` green, manual Chrome and Safari measurements in the changelog |
| 0.12 | Perf harness and Playwright matrix, `dist/manifest.json`, generated types and size tables, `npm test` for helpers | perf baseline committed, matrix green in CI |
| 0.13 | Catalogue tiering, `tailmotion/decorative.css`, cost badges in the demo, deprecation notes for the two legacy classes | manifest-driven docs and demo, no hand-transcribed lists left |
| 1.0 | Freeze the public class list, remove the two legacy classes with aliases, publish the compatibility promise as the release note | every guarantee in this document is a check, not a sentence |

Order of work inside 0.11, because each step de-risks the next: write the
render-cost check first and let it fail on `tm-shimmer-text`, `tm-glow` and
`tm-ripple`; rewrite the three classes until it passes; measure them by hand
and record the numbers; then update the docs from the measurements.

## References

- The rewrite pattern in 1.1 (mask on a container, transform on a child) is
  the same one used to recreate the iOS 16 image shimmer:
  https://www.sabatino.dev/recreating-the-ios-16-shimmer-effect/
- Why a "cheap" transform becomes expensive when the same element paints an
  animated gradient background: https://cr0x.net/en/css-animations-performance-rules/
- Animating a shadow through a pseudo-element's opacity instead of
  `box-shadow`: https://tobiasahlin.com/blog/how-to-animate-box-shadow/
- Project conventions this plan builds on: `docs/DIFFERENTIATION_PROMPT.md`,
  `docs/COMPILER_PLAN.md`, `.agents/skills/better-ui/performance.md`,
  `docs/reference/browser-support.mdx`.
