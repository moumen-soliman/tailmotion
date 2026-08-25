# Contributing to TailMotion

Thanks for helping make TailMotion smaller, clearer, and more useful. Bug fixes,
documentation improvements, new motion utilities, and accessibility feedback
are all welcome.

Participation in this project is governed by the
[TailMotion Code of Conduct](CODE_OF_CONDUCT.md).

## Before opening a change

- Search the [existing issues](https://github.com/moumen-soliman/tailmotion/issues)
  before filing a duplicate.
- Use an issue to discuss breaking API changes or a large new family of
  animations before investing in an implementation.
- Keep pull requests focused. Unrelated cleanup makes motion changes harder to
  review visually.
- Do not commit generated dependency directories or local build output.

## Development setup

Requirements:

- Node.js 16 or newer (the package's own published requirement)
- **Node.js 20 or newer to run `npm run check`.** It builds a real Tailwind
  v4 fixture, and `@tailwindcss/cli`'s native engine
  (`@tailwindcss/oxide`) requires Node 20+. This is a devDependency-only
  requirement — declared as `devEngines` in `package.json`, not the
  package's own `engines.node` — so it does not affect consumers.
- npm

Install and build the package:

```bash
npm install
npm run build
```

Set up the playground:

```bash
cd demo
npm install
npm run dev
```

The demo uses the local package through `file:..`. When testing a CSS change,
run `npm run build` from the repository root before refreshing the playground.

## Repository map

- `src/animations/` — source CSS grouped by motion family
- `src/animations/base.css` — shared tokens, modifiers, RTL, and reduced motion
- `src/animations/variants.css` — prebuilt standalone variant selectors
- `src/index.css` — full CSS entry point
- `src/utils.js` — optional JavaScript helpers
- `tailmotion.config.cjs` — optional Tailwind plugin
- `types/` — public TypeScript declarations
- `scripts/build.mjs` — generates `tailmotion.css`
- `demo/` — interactive playground and documentation site

## Motion design rules

Tailwind owns the interface design. TailMotion owns only the movement.

### Choose the right mechanism

- Use keyframes for entrances, exits, loading, celebrations, and staged
  sequences.
- Use transitions for hover, press, toggle, and other interactive states so
  they remain interruptible.
- Keep high-frequency interactions at `150ms` or less.
- Use `ease-out` for entrances and exits, `ease-in-out` for movement already on
  screen, and `linear` only for constant-speed motion.

### Keep utilities composable

- Give each public class one motion responsibility.
- Do not impose layout, typography, component dimensions, or border radius.
- Prefer `currentColor` and focused `--tm-*` custom properties over fixed
  presentation values.
- Name directional motion on logical axes when it should mirror in RTL.
- Specify the exact transition properties; never use `transition: all`.
- Prefer `transform`, individual transform properties, and `opacity`.
- Add `will-change` only after verifying first-frame stutter.

### Design for reduced motion

- New animated elements, pseudo-elements, and generated children must be
  covered by the shared reduced-motion rule.
- Motion cannot be the only way a state is communicated.
- Verify both `prefers-reduced-motion: no-preference` and `reduce`.

## Adding an animation

1. Add or update the appropriate file under `src/animations/`.
2. Use the `tm-` prefix for every public class and keyframe.
3. Expose tunable values through existing shared variables where possible.
4. Import a new source file from `src/index.css`.
5. Add only useful, verified combinations to `variants.css`.
6. Add the animation to the demo catalog and provide a representative preview.
7. Document the class, defaults, required markup, and accessibility behavior.
8. Run the verification commands below.

Avoid adding two names for the same motion unless one is an explicitly
documented compatibility alias.

## Documentation

Documentation must distinguish:

- the full `tailmotion/css` bundle from per-animation imports
- CSS-only utilities from optional JavaScript helpers
- base classes available everywhere from curated prebuilt variant selectors
- generic motion utilities from structured recipes that require specific markup

Do not publish estimated sizes as measured facts. If a size is documented,
generate it from the current build and state whether it is raw, minified, or
compressed.

## Verification

Before opening a pull request:

```bash
npm run build
npm --prefix demo run build
```

Then verify the affected motion in the playground:

- initial, hover, focus-visible, active, disabled, and state-driven behavior
- interruption and reversal for interactive transitions
- light and dark surfaces when color is involved
- LTR and RTL for logical directions
- narrow mobile and desktop layouts
- reduced motion

Describe checks you could not perform in the pull request.

## Pull requests

Include:

- what changed and why
- the classes or exports affected
- before and after behavior for motion changes
- screenshots or a short recording when visual behavior changes
- migration notes for any observable default or API change

By contributing, you agree that your contributions will be licensed under the
project's [MIT License](LICENSE.md).
