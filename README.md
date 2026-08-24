<p align="center">
  <a href="https://tailmotion.moumen.dev/">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./docs/logo/dark.svg">
      <source media="(prefers-color-scheme: light)" srcset="./docs/logo/light.svg">
      <img width="240" height="72" alt="TailMotion" src="./docs/logo/light.svg">
    </picture>
  </a>
</p>

<h1 align="center">TailMotion</h1>

<p align="center">
  <strong>Purposeful CSS motion that speaks Tailwind.</strong>
  <br>
  Add tuned keyframes and interruptible transitions with composable classes and no runtime in the core stylesheet.
</p>

<p align="center">
  <a href="https://docs.tailmotion.moumen.dev/docs">Documentation</a> ·
  <a href="https://docs.tailmotion.moumen.dev/docs/quickstart">Quickstart</a> ·
  <a href="https://docs.tailmotion.moumen.dev/docs/reference/classes">Class reference</a> ·
  <a href="https://tailmotion.moumen.dev/capabilities/">Live demo</a> ·
  <a href="https://tailmotion.moumen.dev/#explorer">Animation explorer</a> ·
  <a href="https://github.com/moumen-soliman/tailmotion/issues/new">Feedback</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/tailmotion"><img src="https://img.shields.io/npm/v/tailmotion.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/tailmotion"><img src="https://img.shields.io/npm/dm/tailmotion.svg" alt="npm downloads"></a>
  <a href="LICENSE.md"><img src="https://img.shields.io/github/license/moumen-soliman/tailmotion?label=license" alt="MIT license"></a>
</p>

<p align="center">
  <a href="https://tailmotion.moumen.dev/">
    <img width="1200" alt="TailMotion — Motion that speaks Tailwind" src="./demo/public/og.png">
  </a>
</p>

## Add motion without adding a runtime

```bash
npm install tailmotion
```

```css
@import "tailmotion/css";
```

```html
<button class="tm-press rounded-lg bg-blue-600 px-4 py-2 text-white">
  Save changes
</button>
```

TailMotion gives product interfaces a tested motion language with good decisions
already made. Tailwind owns layout, color, spacing, radius, shadows and
typography; TailMotion owns how an element enters, exits, responds, repeats and
reacts to state.

**A keyframe collection answers "how do I fade this in?" TailMotion answers "how
should this whole product move, and what happens when the state changes?"**

📖 **[Full documentation →](https://docs.tailmotion.moumen.dev/docs)** ·
🎛️ **[Live capability demo →](https://tailmotion.moumen.dev/capabilities/)**

## What it does that a keyframe collection cannot

### One class changes the motion personality of a whole interface

```html
<main class="tm-motion-calm">
  <button class="tm-press">Save</button>
  <div class="tm-slide-block-start">Saved</div>
</main>
```

`tm-motion-calm`, `tm-motion-productive` and `tm-motion-expressive` retune every
TailMotion descendant. Duration is a *factor*, not a value, so each animation
keeps its own relative character — `tm-pop` stays livelier than `tm-fade-in` in
all three. Element-level utilities like `tm-duration-300` still win.

→ [Motion personalities](https://docs.tailmotion.moumen.dev/docs/concepts/personalities)

### Your existing `data-state` animates, with no runtime

```html
<div class="tm-presence-slide-block" data-state="open">Product menu</div>
```

Reads `data-state`, `aria-expanded`, `aria-pressed`, `aria-checked` or
`.tm-open` / `.tm-closed`. Built from transitions, so reversing mid-flight
retargets from the current position instead of restarting. Radix UI, Base UI,
Ark and Melt work with no adapter — the class *is* the integration.

→ [State-driven presence](https://docs.tailmotion.moumen.dev/docs/concepts/presence)

### Native dialog, popover and disclosure get real exits

```html
<dialog class="tm-native-dialog">…</dialog>
<div popover class="tm-native-popover">…</div>
<details class="tm-native-disclosure">…</details>
```

The browser keeps focus management, the top layer, light dismiss, Escape and
every native semantic. TailMotion adds the movement, picks no color or size, and
adds no JavaScript.

→ [Native elements](https://docs.tailmotion.moumen.dev/docs/guides/native-elements)

### Product patterns as motion only

```html
<div role="status" data-state="open" class="tm-toast">Changes saved</div>

<button data-state="loading" class="tm-feedback-button">
  <span class="tm-feedback-idle">Save</span>
  <span class="tm-feedback-loading">Saving</span>
  <span class="tm-feedback-success">Saved</span>
</button>
```

Menu, dialog, toast, tooltip, accordion, tabs, loading-to-success and
hold-to-confirm. State selectors, timing, easing and transform origin — no
colors, no dimensions, no components.

→ [Product recipes](https://docs.tailmotion.moumen.dev/docs/guides/recipes)

### Scroll reveals with no observer, that fail safely

```html
<section class="tm-scroll-reveal">Content</section>
```

CSS view timelines, driven by the browser on the compositor. Entirely inside
`@supports (animation-timeline: view())`, so a browser without support renders
ordinary, fully visible content — a fallback an `IntersectionObserver` cannot
offer.

→ [Scroll-driven motion](https://docs.tailmotion.moumen.dev/docs/guides/scroll)

### Stagger that can also leave

```html
<ul data-state="open" class="tm-stagger tm-stagger-75 tm-stagger-from-end">
  <li>Profile</li><li>Settings</li><li>Sign out</li>
</ul>
```

Enter in document order, exit last-item-first, replay from a state change — with
nothing reordered in the DOM, so reading order, tab order and the accessibility
tree are untouched.

→ [Choreography](https://docs.tailmotion.moumen.dev/docs/concepts/choreography)

## What is guaranteed

Every one of these is verified by `npm run check`, which fails the build if it
stops being true.

- **Zero runtime in the CSS core.** No JavaScript, no observer, no frame loop.
- **Nothing modern can hide content.** A hidden base state is only ever declared
  inside the `@supports` block that also says how it comes back.
- **Reduced motion preserves the state.** Animations collapse to 1ms rather than
  being removed, with two deliberate, documented exceptions.
- **Direction is logical.** Inline-axis motion mirrors in RTL; block-axis motion
  does not.
- **Transform-safe.** 32 keyframes — every entrance, exit, presence and scroll
  class — animate `translate` / `scale` / `rotate`, so a Tailwind `rotate-3` on
  the same element survives.
- **Tailwind v3, Tailwind v4, or no Tailwind at all.**

## Documentation

| | |
|---|---|
| [Quickstart](https://docs.tailmotion.moumen.dev/docs/quickstart) | Install and ship the first four behaviours |
| [Installation](https://docs.tailmotion.moumen.dev/docs/install) | Tailwind v3, v4, the CDN, the optional plugin |
| [The motion model](https://docs.tailmotion.moumen.dev/docs/concepts/motion-model) | Four token groups and one override order |
| [Class reference](https://docs.tailmotion.moumen.dev/docs/reference/classes) | Every class, trigger, state, duration and contract |
| [CSS variables](https://docs.tailmotion.moumen.dev/docs/reference/variables) | Every `--tm-*` property and its default |
| [Browser support](https://docs.tailmotion.moumen.dev/docs/reference/browser-support) | Every guarded feature and its exact fallback |
| [Accessibility](https://docs.tailmotion.moumen.dev/docs/guides/accessibility) | Reduced motion, RTL, focus, and what motion must never be alone |
| [Framework integration](https://docs.tailmotion.moumen.dev/docs/guides/frameworks) | React, Vue, Svelte, HTML, headless UI |
| [Migration](https://docs.tailmotion.moumen.dev/docs/migration) | Upgrading to 0.8 |
| [Support and non-goals](https://docs.tailmotion.moumen.dev/docs/support) | What is supported, and what will never be built |

The `docs/` folder in this repository is the source for all of the above.

## Quick reference

<details>
<summary><strong>Motion personalities</strong></summary>

| Profile | Use for | Duration | Travel | Overshoot |
|---|---|---|---|---|
| `tm-motion-calm` | Settings, finance, long-form reading | ×1.1 | 8px | none |
| `tm-motion-productive` | The recommended default for product UI | ×0.85 | 10px | ×0.6 |
| `tm-motion-expressive` | Onboarding, marketing, celebration | ×1.2 | 22px | ×1.3 |

Plus `tm-speed-*`, `tm-emphasis-*` and `tm-no-overshoot` for one axis at a time.
</details>

<details>
<summary><strong>Presence and recipes</strong></summary>

`tm-presence-fade` · `tm-presence-scale` · `tm-presence-pop` ·
`tm-presence-slide-block` · `tm-presence-slide-inline`

`tm-menu` · `tm-dialog` · `tm-dialog-backdrop` · `tm-toast` · `tm-tooltip` ·
`tm-accordion-panel` · `tm-tab-panel` · `tm-tab-indicator` ·
`tm-feedback-button` · `tm-hold-confirm`

`tm-native-popover` · `tm-native-dialog` · `tm-native-disclosure`
</details>

<details>
<summary><strong>Entrances, exits and interactions</strong></summary>

**Entrances** `tm-fade-in` · `tm-scale-in` · `tm-slide-block-start` ·
`tm-slide-block-end` · `tm-slide-inline-start` · `tm-slide-inline-end` ·
`tm-blur-in` · `tm-pop` · `tm-drop` · `tm-zoom-in` · `tm-zoom-out` ·
`tm-rotate-in` · `tm-elastic` · `tm-reveal` · `tm-unfold` · `tm-glide` ·
`tm-scale-fade` · `tm-rise` · `tm-flip-x` · `tm-flip-y` · `tm-swing-in`

**Exits** `tm-fade-out` · `tm-scale-out` · `tm-slide-block-out` ·
`tm-slide-inline-out` · `tm-blur-out`

**Interactions** `tm-press` · `tm-hover-lift` · `tm-hover-scale` ·
`tm-rotate-hover` · `tm-rotate-press` · `tm-icon-swap`

**Continuous** `tm-spin` · `tm-pulse` · `tm-bounce` · `tm-float` · `tm-drift` ·
`tm-sway` · `tm-glow` · `tm-morph` · `tm-ripple` · `tm-shimmer` · `tm-sparkle`

**Timing** `tm-duration-*` · `tm-delay-*` · `tm-ease-*` · `tm-repeat-*` ·
`tm-distance-*` · `tm-stagger-*`

Full details, including every duration and easing role, in the
[class reference](https://docs.tailmotion.moumen.dev/docs/reference/classes).
</details>

<details>
<summary><strong>Modular imports</strong></summary>

```css
@import "tailmotion/css";            /* everything — 31.6 KB gzipped */

@import "tailmotion/profiles.css";   /* 3.7 KB */
@import "tailmotion/presence.css";   /* 4.7 KB */
@import "tailmotion/native.css";     /* 5.0 KB */
@import "tailmotion/recipes.css";    /* 6.4 KB */
@import "tailmotion/scroll.css";     /* 4.1 KB */
@import "tailmotion/choreography.css"; /* 4.8 KB */

@import "tailmotion/animations/base.css";  /* or one family at a time */
@import "tailmotion/animations/fade.css";
```

The full bundle is **not** tree-shaken, and each module repeats the shared token
layer — so if you need more than one, import `tailmotion/css` instead.

→ [Imports and bundle size](https://docs.tailmotion.moumen.dev/docs/reference/imports)
</details>

## React Native

Not supported. TailMotion is CSS and DOM selectors. **React Native Web** can use
it for its browser target only, where the output is real DOM and real CSS.

## Community

- Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a substantial change.
- Participation is governed by the
  [TailMotion Code of Conduct](CODE_OF_CONDUCT.md).
- Report bugs and propose features through
  [GitHub Issues](https://github.com/moumen-soliman/tailmotion/issues).

## License

[MIT](LICENSE.md) © [Moumen Soliman](https://github.com/moumen-soliman)
