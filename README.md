# TailMotion

TailMotion is a zero-runtime motion kit for Tailwind CSS. It ships production-ready keyframes plus utility classes so you can drop animations into any project without writing custom CSS.

## Highlights
- 12+ handcrafted animations for hover, load, focus and error states
- Works as standalone CSS (`tailmotion.css`) or Tailwind plugin (`tailmotion.config.js`)
- Duration, delay, easing and repeat helpers powered by CSS variables
- Respects `prefers-reduced-motion` and exposes motion safety utilities
- Demo-ready examples for buttons, cards and icons

## Installation
```
npm install tailmotion
```

### 1. Register the Tailwind plugin
```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx,html}'],
  theme: {
    extend: {},
  },
  plugins: [
    require('tailmotion')({
      // optional overrides (see Customizing section)
    }),
  ],
};
```

### 2. Import the CSS once
```css
/* src/styles/tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@import 'tailmotion';
```

### 3. Use the utilities
```html
<button class="tm-flip-hover tm-duration-500 tm-delay-200 px-4 py-2 rounded-md bg-blue-600 text-white">
  Flip Me
</button>
```

## Animation catalog

| Class | Behavior |
| --- | --- |
| `.tm-flip-hover` | 3D card flip on hover |
| `.tm-rotate-hover` / `.tm-rotate-press` | Gentle hover tilt or press feedback |
| `.tm-bounce` | Elastic bounce on load |
| `.tm-pulse` | Soft breathing scale loop |
| `.tm-pop` | Entrance pop with overshoot |
| `.tm-float` | Slow floating loop (great for icons) |
| `.tm-spin` | Continuous spin |
| `.tm-slide-up` | Entrance slide with fade |
| `.tm-fade-in` | Subtle fade from below |
| `.tm-shake` | Horizontal shake for errors |
| `.tm-wiggle` | Quick attention grab wiggle |
| `.tm-glow` | Pulsing glow/shadow |
| `.tm-zoom-in` / `.tm-zoom-in-slow` | Premium zoom entrance with overshoot |
| `.tm-drop-in` | Drop + settle animation for modals |
| `.tm-drift` | Ambient horizontal drift loop |
| `.tm-lift-hover` | Elevated hover lift with soft shadow |
| `.tm-shimmer-hover` | Sheen sweep for CTAs and cards |

All classes are defined in `tailmotion.css`, so they work even outside Tailwind builds.

## Motion variants

TailMotion exposes CSS custom-property helpers so you can retime animations without rewriting keyframes.

- `tm-duration-*`: 150, 200, 300, 400, 500, 700, 900, 1000, 1200, 1400, 1600, 2000, 3000
- `tm-delay-*`: 0, 75, 150, 200, 300, 400, 500, 700, 1000
- `tm-ease-*`: linear, in, out, in-out, soft, snappy, bouncy
- `tm-repeat-*`: 1, 2, 3, infinite
- `tm-motion-paused`, `tm-motion-running`, `tm-motion-reset` for fine control

Because everything relies on CSS variables you can also author bespoke timings inline:
```html
<div class="tm-bounce" style="--tm-duration: 1800ms; --tm-delay: 120ms;"></div>
```

Prefer Tailwind-only syntax? Arbitrary values are supported, so you can write:
```html
<div class="tm-pulse tm-duration-[1350ms]"></div>
<div class="tm-slide-up [--tm-delay:420ms]"></div>
```

## Customizing tokens

You can extend or override any timing token via the Tailwind plugin or directly when requiring TailMotion:

```js
// tailwind.config.js
const tailmotion = require('tailmotion');

module.exports = {
  theme: {
    extend: {
      tailmotion: {
        durations: {
          750: '750ms', // enables tm-duration-750
        },
        easing: {
          springy: 'cubic-bezier(0.22, 1, 0.36, 1)',
        },
      },
    },
  },
  plugins: [
    tailmotion({
      delays: { whisper: '1200ms' }, // adds tm-delay-whisper
    }),
  ],
};
```

Need something ad-hoc? Use arbitrary values:
```html
<span class="tm-spin tm-duration-[850ms] tm-delay-[1.4s] tm-ease-[cubic-bezier(.22,1,.36,1)]"></span>
```

## Demo

Run the static preview inside `demo/`:
```
npm run build
npx serve demo
```

The demo uses CDN Tailwind plus `tailmotion.css` to showcase buttons, cards and icon avatars.

## Development
- `npm run build` – bundle `src` into `tailmotion.css`
- `npm run demo` – serve the demo folder locally

Before publishing, bump the package version and rebuild so the banner in `tailmotion.css` reflects the release.

## License

MIT © TailMotion contributors


