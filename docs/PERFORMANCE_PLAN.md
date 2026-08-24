# TailMotion Performance Improvement Plan

Improve TailMotion's loading, parsing, style-calculation, paint, layout, and
runtime animation performance without weakening its product capabilities or
breaking existing imports.

This plan applies to TailMotion 0.8.x.

## Current Baseline

Measured by the existing build and check scripts:

- `tailmotion.css`: approximately **202.8 KB raw / 29.5 KB gzipped**
- `modules/profiles.css`: approximately **3.6 KB gzipped**
- `modules/presence.css`: approximately **4.6 KB gzipped**
- `modules/native.css`: approximately **4.9 KB gzipped**
- `modules/recipes.css`: approximately **6.3 KB gzipped**
- `modules/scroll.css`: approximately **4.0 KB gzipped**
- `modules/choreography.css`: approximately **4.3 KB gzipped**
- optional JavaScript helpers: approximately **3.0 KB gzipped**
- full stylesheet: approximately 5,389 lines
- full stylesheet: roughly 1,000 selectors and 77 keyframe blocks

The full bundle is acceptable for a feature-rich motion library, but it is not
small enough to describe as a tiny stylesheet. Its gzip transfer cost is
reasonable; its raw parse and selector cost require continued attention.

## What Is Already Good

Preserve these existing properties:

- CSS imports do not pull in the optional JavaScript helpers.
- No `transition: all` is used.
- Core product interactions use explicit transition properties.
- Presence, native recipes, scroll motion, and newer interactions primarily use
  individual `translate`, `scale`, and `rotate` properties.
- Reduced-motion behavior covers full and modular stylesheets.
- Unsupported scroll and native CSS features leave content visible and usable.
- `will-change` is not applied globally.
- The full-bundle build deduplicates repeated source imports.
- CSS is organized into Tailwind-compatible cascade layers.
- Modular package exports already exist.

## Performance Goals

### Loading goals

- Keep `tailmotion/css` below **32 KB gzipped**.
- Create a recommended product-focused entry below **14 KB gzipped**.
- Keep individual capability modules below **7 KB gzipped** each.
- Keep optional JavaScript helpers below **4 KB gzipped**.
- Prevent duplicate CSS when consumers follow the documented import paths.

### Runtime goals

- Product interactions should animate compositor-friendly properties whenever
  possible.
- High-frequency interactions must not animate layout.
- Infinite effects must be easy to pause or limit.
- Unsupported progressive features must render static, visible content.
- Reduced motion must prevent continuous decorative work.
- No utility should create a permanent compositing layer without explicit user
  intent.

### Compatibility goals

- Preserve `tailmotion/css`.
- Preserve current per-animation imports.
- Preserve Tailwind CSS v3, Tailwind CSS v4, and standalone CSS support.
- Preserve current class names unless a compatibility alias is provided.
- Keep modules usable without requiring JavaScript.

## Phase 1: Establish Enforced Budgets

Extend `scripts/check.mjs` with explicit size limits.

Initial limits:

```text
tailmotion.css                 <= 32 KB gzip
modules/product.css            <= 14 KB gzip
modules/profiles.css           <= 5 KB gzip
modules/presence.css           <= 6 KB gzip
modules/native.css             <= 6 KB gzip
modules/recipes.css            <= 8 KB gzip
modules/scroll.css             <= 5 KB gzip
modules/choreography.css       <= 6 KB gzip
dist/tailmotion.js             <= 4 KB gzip
```

Fail the check when a file exceeds its budget. Print:

- raw bytes,
- minified bytes,
- gzip bytes,
- selector count,
- keyframe count.

Do not optimize only for gzip. A highly repetitive stylesheet can compress well
while still costing the browser time to parse and match selectors.

### Deliverables

- Size thresholds in `scripts/check.mjs`.
- Selector and keyframe reporting.
- A committed baseline report.
- Documentation explaining that budgets are regression limits, not performance
  guarantees.

## Phase 2: Add a Product-focused Entry

The full bundle currently combines product motion with every decorative effect
and every prebuilt variant.

Add a recommended entry:

```css
@import "tailmotion/product.css";
```

It should include:

- shared tokens,
- motion personalities,
- presence,
- native HTML motion,
- product recipes,
- choreography,
- interactions,
- essential entrances and exits.

It should not include by default:

- dark veil,
- wavy backgrounds,
- liquid effects,
- large decorative celebration effects,
- legacy decorative recipes,
- the complete prebuilt variant matrix.

Keep:

```css
@import "tailmotion/css";
```

as the complete batteries-included entry.

### Proposed exports

```json
{
  "./product.css": "./modules/product.css",
  "./effects.css": "./modules/effects.css"
}
```

`effects.css` may group optional decorative and ambient effects when that makes
imports simpler. Existing per-animation imports must remain available.

### Success criteria

- A normal product can use profiles, presence, dialog, popover, menus, toasts,
  interactions, and choreography through one import.
- `product.css` is below 14 KB gzipped.
- `product.css` contains no large ambient background effects.
- The full bundle remains backward compatible.

## Phase 3: Clarify Import Strategy

Document three supported strategies.

### Complete

```css
@import "tailmotion/css";
```

Use when the application needs the full catalogue and prebuilt variants.

### Product

```css
@import "tailmotion/product.css";
```

Use for most product interfaces.

### Focused

```css
@import "tailmotion/presence.css";
@import "tailmotion/native.css";
```

Or:

```css
@import "tailmotion/animations/base.css";
@import "tailmotion/animations/fade.css";
@import "tailmotion/animations/interactions.css";
```

### Rules

- Import TailMotion once from the global stylesheet.
- Do not import `tailmotion/css` together with capability modules.
- Do not import the same module from multiple component files.
- Explain that per-animation imports omit the complete variant matrix.
- Explain when repeated module token layers create duplicate CSS.
- Recommend `product.css` when several product modules are required.

## Phase 4: Investigate Tailwind v4 Usage Generation

Run a focused technical spike for a Tailwind CSS v4-native entry.

Goal:

```css
@import "tailwindcss";
@import "tailmotion/tailwind.css";
```

Only classes used in the project's content should be emitted where Tailwind's
CSS-first APIs can reliably support that behavior.

Evaluate:

- `@utility`,
- `@theme`,
- custom variants,
- arbitrary duration and distance values,
- dynamic state selectors,
- keyframe inclusion,
- modular recipe selectors,
- compatibility with Tailwind's transform utilities.

### Requirements

- Do not replace the standalone full CSS entry.
- Do not weaken Tailwind v3 support.
- Do not claim usage generation until output has been measured in real fixture
  projects.
- Keep product recipes intact when their child selectors are required.
- Verify that dynamic class construction is not silently omitted.

### Decision gate

Ship this entry only if:

- generated output is materially smaller,
- stateful recipes remain correct,
- Tailwind v4 integration is stable,
- documentation can explain content detection clearly.

Otherwise, publish the experiment results and retain modular imports as the
official size strategy.

## Phase 5: Separate Expensive Decorative Effects

Audit effects that use:

- multiple infinite animations,
- gradients across large surfaces,
- blur and filter,
- animated box shadows,
- large pseudo-elements,
- background-position animation,
- clip paths over large regions.

Priority classes:

- `tm-dark-veil`,
- `tm-wavy`,
- `tm-wavy-subtle`,
- `tm-glow`,
- `tm-ripple`,
- `tm-shimmer`,
- `tm-morph`,
- `tm-view-morph`,
- text blur transitions.

### Actions

- Keep heavy backgrounds outside `product.css`.
- Document whether each effect is compositor-only, paint-heavy, or
  layout-affecting.
- Add usage guidance for surface area and instance count.
- Avoid live blur on coarse-pointer devices where it causes expensive
  rasterization.
- Keep decorative effects visible but static under reduced motion.
- Do not add `will-change` unless an effect continuously animates and profiling
  proves layer promotion helps.

## Phase 6: Control Infinite Animations

Infinite effects are the largest sustained runtime cost.

Affected categories include:

- spin,
- pulse,
- float,
- drift,
- sway,
- ripple,
- glow,
- shimmer,
- morph,
- wavy and dark-veil backgrounds.

### Add control utilities

Evaluate:

```css
.tm-running
.tm-paused
.tm-repeat-1
.tm-repeat-2
.tm-repeat-3
.tm-repeat-infinite
```

Preserve existing repeat utilities where they already cover the API.

Add a scoped pause mechanism:

```html
<section class="tm-motion-paused">
  <div class="tm-float">...</div>
</section>
```

Requirements:

- Pause must inherit predictably.
- An element-level running override may resume one descendant.
- Reduced motion must continue to win.
- Do not add an Intersection Observer to the CSS core.
- If an optional observer helper is considered, keep it outside the default
  runtime and document its cost.

### Usage guidance

- Use infinite decorative backgrounds once per region.
- Avoid infinite animations in long lists.
- Stop or pause effects in hidden tabs, inactive panels, and closed dialogs.
- Prefer finite feedback for actions that happen once.

## Phase 7: Remove Avoidable Layout Animation

Not every layout transition is incorrect. Accordion height and disclosure size
are inherently layout-affecting. The goal is to remove avoidable layout work
from high-frequency interactions.

### Avatar group

Current concern:

- spreading avatars animates `margin-inline-start`,
- margin animation triggers layout on every frame.

Investigate:

- fixed overlap layout plus per-avatar `translate`,
- generated index variables for positional offsets,
- a capped visible avatar count,
- preserving pointer hit areas and RTL behavior.

Do not change the implementation until hover, focus, keyboard, RTL, and
interrupted transitions have been compared in the browser.

### Tab indicator

Current concern:

- `inline-size` transition triggers layout.

Investigate:

- fixed base size with `scaleX`,
- translate plus scale driven by custom properties,
- transform-origin based on logical direction,
- retaining exact alignment at different zoom levels.

Keep the existing width approach as a compatibility fallback if a transform
implementation cannot match variable tab widths.

### Accordion and disclosure

These intentionally animate content size.

Actions:

- Keep them out of hot repeated interactions.
- Prefer browser-native intrinsic size interpolation when available.
- Ensure only the affected subtree relayouts.
- Consider `contain: layout` only where it does not clip content or break
  intrinsic sizing.
- Never replace accessible native disclosure semantics to avoid layout work.

### View morph

Preserve the fixed-stage `clip-path` path that avoids changing width and height
every frame. Keep dimension interpolation as a documented fallback.

## Phase 8: Reduce Paint-heavy Interaction Work

Review high-frequency classes that animate:

- `box-shadow`,
- `filter`,
- blur,
- large opacity layers.

Rules:

- Press, hover, focus, toggle, and presence should prefer opacity and individual
  transform properties.
- Box-shadow changes should be subtle and limited to one element.
- Blur should not run continuously on interactive text.
- Touch and coarse-pointer environments may receive a simpler effect.
- Avoid animating large translucent layers over the entire viewport.

Add documentation labels:

```text
compositor-friendly
paint-heavy
layout-affecting
progressive
```

These labels should appear in the class reference and demo Explorer.

## Phase 9: Module Token Deduplication

Current modules are self-contained, which is convenient, but importing several
modules repeats the shared token layer.

Preserve self-contained entries, then evaluate an advanced composition path:

```css
@import "tailmotion/tokens.css";
@import "tailmotion/modules/presence-core.css";
@import "tailmotion/modules/recipes-core.css";
```

Only add this path if the byte savings justify the added documentation and
export complexity.

Preferred solution:

- use `product.css` for common multi-module combinations,
- use self-contained modules for one or two capabilities,
- use full CSS for the complete catalogue.

Do not force every consumer to manually manage token ordering.

## Phase 10: Caching and Distribution

### Bundled applications

- Keep TailMotion in the application's fingerprinted CSS output.
- Import it once globally.
- Confirm production bundlers do not emit duplicate copies.

### CDN

- Pin versions:

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/tailmotion@0.9.0/tailmotion.css"
>
```

- Use immutable version URLs.
- Update every README CDN example together during a release.
- Consider documenting Subresource Integrity hashes.
- Do not point production instructions at `@latest`.

### Release consistency

- Synchronize package version, CSS banner, optional JS banner, README, and
  changelog.
- Remove stale `0.6.0` references.
- Ensure a generated timestamp does not prevent deterministic artifact hashes
  when the CSS source has not changed.

## Phase 11: Browser Performance Verification

Create representative pages:

1. 100 static TailMotion elements.
2. 20 simultaneously entering presence elements.
3. A long list containing staggered children.
4. One dark-veil hero.
5. Several infinite loading indicators.
6. Avatar group hover and focus.
7. Rapid tab indicator updates.
8. Accordion open and close.
9. View morph with and without a fixed stage.
10. Scroll-driven reveals.

Measure:

- stylesheet transfer size,
- CSS parse time,
- style recalculation,
- layout count and duration,
- paint count and duration,
- compositor layer count,
- main-thread animation work,
- memory after prolonged infinite animation,
- behavior under CPU throttling,
- behavior at 200% zoom,
- behavior with reduced motion.

Test Chromium, Firefox, and WebKit. Report unsupported progressive features
separately rather than treating their safe fallback as a failure.

## Implementation Order

1. Add enforced budgets and reporting.
2. Add `product.css`.
3. Document complete, product, and focused import paths.
4. Separate heavy decorative effects from the recommended entry.
5. Add inherited pause controls for infinite effects.
6. Prototype transform-based avatar spreading.
7. Prototype transform-based tab indicators.
8. Audit and label paint-heavy classes.
9. Run the Tailwind v4 usage-generation spike.
10. Evaluate advanced token-deduplicated module imports.
11. Add browser performance fixtures and publish measured results.

## Success Criteria

The plan is complete when:

- most product users can import less than 14 KB gzipped,
- the complete bundle remains under 32 KB gzipped,
- CSS imports never pull in optional JavaScript,
- heavy decorative effects are not in the recommended product entry,
- high-frequency interactions avoid layout animation,
- infinite effects can be paused at element and scope level,
- reduced motion stops continuous decorative work,
- unsupported modern CSS leaves visible content,
- package documentation gives a clear import decision,
- size and selector regressions fail automated checks,
- performance claims are based on measured browser traces.

Do not report success only because gzip size decreased. The real target is less
work across network transfer, CSS parsing, selector matching, layout, paint, and
continuous animation.
