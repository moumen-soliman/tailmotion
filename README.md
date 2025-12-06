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

## Installation

```bash
npm install tailmotion
```

## Quick Start

### 1. Import the CSS

```css
/* In your global CSS */
@import 'tailmotion/css';
```

Or in your framework:

```jsx
// React/Next.js
import 'tailmotion/css';

// Vue
<style>
@import 'tailmotion/css';
</style>
```

### 2. Use the Classes

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

### Number/Count Animations
| Class | Description |
|-------|-------------|
| `tm-count-reveal` | Slot-machine style digits (wrap in spans) |
| `tm-slide-digit` | Single digit slide up |
| `tm-confetti` | Falling celebration |

### Text Animations
| Class | Description |
|-------|-------------|
| `tm-text-flip` | Container for text flip |
| `tm-text-flip-word` | Word with 3D flip + blur |
| `tm-text-rotate` | Container for text rotate |
| `tm-text-rotate-word` | Word with vertical blur |
| `tm-text-morph` | Container for text morph |
| `tm-text-morph-word` | Word with blur morph |
| `tm-text-flip-chars` | Character-by-character flip |

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

## Text Flip

For rotating text with blur effect:

```html
<span class="tm-text-flip">
  <span class="tm-text-flip-word">Hello</span>
</span>
```

Use JavaScript utilities for dynamic word rotation:

```js
import { createTextRotator } from 'tailmotion/utils';

const rotator = createTextRotator({
  words: ['Hello', 'World'],
  interval: 2000,
  onFlip: ({ word }) => setWord(word)
});
rotator.start();
```

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
  createCountSpans 
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

// Create span data for count reveal
const spans = createCountSpans('12,345');
// Returns: [{ char: '1', style: {...} }, ...]
```

## Tailwind Plugin

For extended customization, use the Tailwind plugin:

```js
// tailwind.config.js
module.exports = {
  plugins: [
    require('tailmotion')({
      durations: { 750: '750ms' },
      easing: { springy: 'cubic-bezier(0.22, 1, 0.36, 1)' }
    })
  ]
};
```

## Browser Support

Works in all modern browsers that support CSS animations and custom properties.

## License

MIT © [Moumen Soliman](https://github.com/moumensoliman)
