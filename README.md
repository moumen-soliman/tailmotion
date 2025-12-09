# TailMotion

Motion utilities for Tailwind CSS. Zero runtime, tree-shakable, framework-agnostic.

[![npm version](https://img.shields.io/npm/v/tailmotion.svg)](https://www.npmjs.com/package/tailmotion)
[![bundle size](https://img.shields.io/bundlephobia/minzip/tailmotion)](https://bundlephobia.com/package/tailmotion)
[![license](https://img.shields.io/npm/l/tailmotion.svg)](https://github.com/moumen-soliman/tailmotion/blob/main/LICENSE)

## Features

- **40+ animations** - Entrances, loops, attention-grabbers, text effects, and more
- **All Tailwind variants** - `hover:`, `focus:`, `sm:`, `md:hover:`, etc.
- **Zero runtime** - Pure CSS keyframes, no JavaScript required
- **Tree-shakable** - Import only what you use
- **Framework-agnostic** - Works with React, Vue, Svelte, vanilla HTML
- **Accessible** - Respects `prefers-reduced-motion`
- **Tailwind optional** - Full CSS works standalone without Tailwind

## Installation

```bash
npm install tailmotion
# or
yarn add tailmotion
# or
pnpm add tailmotion
```

## Quick Start

### Option 1: CSS Import (Recommended)

Import the CSS file in your project:

**In CSS file:**
```css
@import 'tailmotion/css';
```

- This path requires **no Tailwind setup**. The shipped CSS already includes the variant-style selectors (e.g., `hover:tm-bounce`, `sm:tm-pop`) so you can use them directly in any framework or plain HTML.

**In JavaScript/TypeScript:**
```js
// React, Next.js, Vue, Svelte, etc.
import 'tailmotion/css';
```

**In HTML:**
```html
<link rel="stylesheet" href="node_modules/tailmotion/tailmotion.css">
```

### Option 2: Tailwind CSS Plugin

Add the plugin to your `tailwind.config.js` for extended customization:

```js
// tailwind.config.js (CommonJS)
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  plugins: [
    require('tailmotion/plugin')
  ]
};

// tailwind.config.ts (ESM)
import type { Config } from 'tailwindcss';
import tailmotion from 'tailmotion/plugin';

export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  plugins: [tailmotion]
} satisfies Config;
```

Then import the CSS:
```css
@import 'tailwindcss';
@import 'tailmotion/css';
```

### Use the Classes

```html
<!-- Basic animation -->
<div class="tm-fade-in">Hello</div>

<!-- With hover -->
<button class="hover:tm-bounce">Click me</button>

<!-- With timing -->
<div class="tm-slide-up tm-duration-500 tm-delay-200">Delayed</div>

<!-- Responsive -->
<div class="md:tm-pop lg:hover:tm-wiggle">Responsive</div>
```

## Framework Examples

### React / Next.js

```jsx
// app/layout.jsx or _app.jsx
import 'tailmotion/css';

export default function Button() {
  return (
    <button className="hover:tm-bounce tm-duration-300">
      Click me
    </button>
  );
}
```

### Vue

```vue
<script setup>
import 'tailmotion/css';
</script>

<template>
  <button class="hover:tm-shake">Click me</button>
</template>
```

### Svelte

```svelte
<script>
  import 'tailmotion/css';
</script>

<button class="hover:tm-wiggle">Click me</button>
```

### Vanilla HTML

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="node_modules/tailmotion/tailmotion.css">
</head>
<body>
  <div class="tm-fade-in">Hello World</div>
</body>
</html>
```

## All Animations

### Loop Animations
| Class | Description |
|-------|-------------|
| `tm-bounce` | Bouncing animation |
| `tm-pulse` | Breathing scale effect |
| `tm-spin` | 360° rotation |
| `tm-float` | Gentle floating |
| `tm-drift` | Ambient horizontal drift |
| `tm-glow` | Pulsing glow/shadow |
| `tm-morph` | Subtle breathing morph |
| `tm-sway` | Pendulum sway |
| `tm-sparkle` | Twinkling star effect |

### Attention Animations
| Class | Description |
|-------|-------------|
| `tm-shake` | Horizontal shake |
| `tm-wiggle` | Quick wiggle |
| `tm-elastic` | Elastic bounce |
| `tm-ripple` | Ripple pulse effect |
| `tm-burst` | Explosion outward |

### Entrance Animations
| Class | Description |
|-------|-------------|
| `tm-fade-in` | Fade in with subtle lift |
| `tm-slide-up` | Slide up from below |
| `tm-slide-down` | Slide down from above |
| `tm-slide-left` | Slide in from left |
| `tm-slide-right` | Slide in from right |
| `tm-pop` | Scale up with overshoot |
| `tm-drop` | Drop in with bounce |
| `tm-blur-in` | Blur to focus entrance |
| `tm-zoom-in` | Zoom in with fade |
| `tm-zoom-out` | Zoom out entrance |
| `tm-rotate-in` | Rotate in entrance |

### Professional Animations
| Class | Description |
|-------|-------------|
| `tm-reveal` | Clip-path reveal from bottom |
| `tm-unfold` | Elegant unfold from top |
| `tm-glide` | Smooth slide from left |
| `tm-glide-right` | Smooth slide from right |
| `tm-scale-fade` | Subtle scale with fade |
| `tm-rise` | Rise up with slight rotation |
| `tm-fill-up` | Bottom to top fill reveal |
| `tm-stagger` | Auto-stagger children |

### Transform Animations
| Class | Description |
|-------|-------------|
| `tm-flip-x` | 3D flip on X axis |
| `tm-flip-y` | 3D flip on Y axis |

### Interactive (Hover) Animations
| Class | Description |
|-------|-------------|
| `tm-lift-hover` | Lift with shadow on hover |
| `tm-shimmer-hover` | Sheen sweep on hover |
| `tm-liquid-btn` | Liquid fill button |
| `tm-liquid-btn-top` | Liquid fill from top |
| `tm-liquid-btn-left` | Liquid fill from left |
| `tm-liquid-btn-right` | Liquid fill from right |
| `tm-liquid-btn-center` | Liquid fill from center |
| `tm-liquid-wave` | Wave fill effect |
| `tm-liquid-underline` | Underline fill effect |
| `tm-rotate-hover` | Rotate on hover |
| `tm-flip-hover` | 3D flip on hover |

### Number/Count Animations
| Class | Description |
|-------|-------------|
| `tm-count-reveal` | Slot-machine style digits (wrap in spans) |
| `tm-slide-digit` | Single digit slide up |
| `tm-confetti` | Falling celebration |

### Text Animations
| Class | Description |
|-------|-------------|
| `tm-text-flip` | Container for text flip (requires JS) |
| `tm-text-morph` | Container for text morph (requires JS) |
| `tm-text-rotate` | Container for text rotate |

### Component Animations
| Class | Description |
|-------|-------------|
| `tm-avatar-group` | Animated avatar stack |
| `tm-avatar` | Individual avatar in group |
| `tm-avatar-ring` | Avatar with ring effect |
| `tm-avatar-tooltip` | Tooltip for avatar |

## Variants

All animations support Tailwind CSS variants:

```html
<!-- State variants -->
<div class="hover:tm-bounce">Hover me</div>
<input class="focus:tm-glow" />
<button class="active:tm-shake">Press me</button>

<!-- Group hover -->
<div class="group">
  <div class="group-hover:tm-spin">Icon</div>
</div>

<!-- Responsive -->
<div class="sm:tm-fade-in md:tm-slide-up lg:tm-pop">
  Different animation per breakpoint
</div>

<!-- Combined -->
<div class="md:hover:tm-bounce">
  Hover effect on medium screens+
</div>

<!-- Motion safe -->
<div class="motion-safe:tm-bounce">
  Only animates if user prefers motion
</div>
```

## Timing Utilities

### Duration
```html
<div class="tm-bounce tm-duration-300">Fast</div>
<div class="tm-bounce tm-duration-700">Slow</div>
```

Available: `150`, `200`, `300`, `400`, `500`, `700`, `900`, `1000`, `1200`, `1400`, `1600`, `2000`, `3000`

### Delay
```html
<div class="tm-fade-in tm-delay-0">First</div>
<div class="tm-fade-in tm-delay-150">Second</div>
<div class="tm-fade-in tm-delay-300">Third</div>
```

Available: `0`, `75`, `150`, `200`, `300`, `400`, `500`, `700`, `1000`

### Easing
```html
<div class="tm-pop tm-ease-bouncy">Bouncy</div>
<div class="tm-pop tm-ease-snappy">Snappy</div>
```

Available: `linear`, `in`, `out`, `in-out`, `soft`, `snappy`, `bouncy`

### Repeat
```html
<div class="tm-bounce tm-repeat-3">3 times</div>
<div class="tm-bounce tm-repeat-infinite">Forever</div>
```

## Stagger Animation

Auto-stagger children with delay:

```html
<ul class="tm-stagger">
  <li>Item 1</li>  <!-- delay: 0ms -->
  <li>Item 2</li>  <!-- delay: 80ms -->
  <li>Item 3</li>  <!-- delay: 160ms -->
</ul>
```

## Count Reveal

For slot-machine style number reveal:

```html
<div class="tm-count-reveal">
  <span>1</span>
  <span>2</span>
  <span>,</span>
  <span>3</span>
  <span>4</span>
  <span>5</span>
</div>
```

## Text Flip (Requires JavaScript)

For rotating text with blur effect:

```html
<span id="text-container" class="tm-text-flip"></span>
```

```js
import { initTextFlipElement } from 'tailmotion/utils';

initTextFlipElement(document.getElementById('text-container'), {
  words: ['beautiful', 'amazing', 'powerful'],
  variant: 'flip', // 'flip', 'morph', 'rotate', 'chars'
  interval: 2500
});
```

## Liquid Button

Interactive button with liquid fill effect:

```html
<button 
  class="tm-liquid-btn px-6 py-3 border rounded-lg text-gray-300 hover:text-black"
  style="--tm-liquid-color: white;"
>
  Hover me
</button>
```

CSS Variables:
- `--tm-liquid-color`: Fill color (default: currentColor)
- `--tm-liquid-bg`: Background color (default: transparent)
- `--tm-liquid-duration`: Animation duration (default: varies by variant)
- `--tm-liquid-line-height`: Line height for underline variant (default: 2px)

## Custom Timing

Use CSS variables for custom values:

```html
<div class="tm-bounce" style="--tm-duration: 1800ms; --tm-delay: 120ms;">
  Custom timing
</div>
```

Or Tailwind arbitrary values:

```html
<div class="tm-pulse tm-duration-[1350ms]">Custom duration</div>
<div class="tm-slide-up [--tm-delay:420ms]">Custom delay</div>
```

## JavaScript Utilities

Optional utilities for dynamic animations:

```js
import { 
  animateValue, 
  createTextRotator, 
  formatNumber,
  createCountSpans,
  replayAnimation,
  cssVars,
  staggerStyle,
  tm
} from 'tailmotion/utils';

// Animate a count
animateValue({
  from: 0,
  to: 1000,
  duration: 2000,
  onUpdate: (value) => {
    element.textContent = formatNumber(value);
  }
});

// Create span data for count reveal (React/Vue friendly)
const spans = createCountSpans('12,345');
// Returns: [{ char: '1', style: { '--tm-stagger': 0 }, delay: 0 }, ...]

// Replay an animation
replayAnimation(element, 'tm-bounce');

// Generate CSS variables
const style = cssVars({ duration: '500ms', delay: '100ms' });
// Returns: { '--tm-duration': '500ms', '--tm-delay': '100ms' }

// Build animation class
const className = tm('bounce', { duration: 500, delay: 200 });
// Returns: 'tm-bounce tm-duration-500 tm-delay-200'
```

## Tailwind Plugin Configuration

Extend or customize tokens via the plugin:

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('tailmotion/plugin')({
      durations: { 
        750: '750ms',
        1500: '1500ms' 
      },
      easing: { 
        springy: 'cubic-bezier(0.22, 1, 0.36, 1)' 
      },
      delays: {
        600: '600ms'
      }
    })
  ]
};
```

Or via theme:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      tailmotion: {
        durations: { 750: '750ms' },
        easing: { springy: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      }
    }
  },
  plugins: [require('tailmotion/plugin')]
};
```

## Browser Support

Works in all modern browsers that support CSS animations and custom properties.

## License

MIT © [Moumen Soliman](https://github.com/moumensoliman)
