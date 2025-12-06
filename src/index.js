/**
 * TailMotion
 * A tiny motion utility pack for Tailwind CSS
 * Framework-agnostic - works with React, Vue, Svelte, Angular, vanilla JS
 */

export {
  // Framework-agnostic utilities
  createCountSpans,
  formatNumber,
  getEasing,
  animateValue,
  createTextRotator,
  replayAnimation,
  cssVars,
  staggerStyle,
  tm,
  
  // Vanilla JS DOM helpers (only for non-framework usage)
  initCountRevealElement,
  initTextFlipElement
} from './utils.js';

export { default as TailMotion } from './utils.js';
