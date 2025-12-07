// TailMotion TypeScript Definitions

export interface CountSpanData {
  char: string;
  index: number;
  style: { '--tm-stagger': number };
  delay: number;
}

export interface AnimateValueOptions {
  from?: number;
  to: number;
  duration?: number;
  easing?: 'linear' | 'easeOutExpo' | 'easeOutQuart' | 'easeOutCubic' | 'easeInOutQuad';
  onUpdate: (value: number, progress: number) => void;
  onComplete?: () => void;
}

export interface TextRotatorFlipData {
  word: string;
  index: number;
  prevWord: string | null;
  prevIndex: number | null;
}

export interface TextRotatorOptions {
  words: string[];
  interval?: number;
  loop?: boolean;
  onFlip: (data: TextRotatorFlipData) => void;
}

export interface TextRotator {
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  destroy: () => void;
  readonly currentWord: string;
  readonly currentIndex: number;
  readonly isRunning: boolean;
}

export interface TmModifiers {
  duration?: string | number;
  delay?: string | number;
  repeat?: string | number;
  ease?: string;
}

export interface InitTextFlipOptions {
  words: string[];
  variant?: 'flip' | 'morph' | 'rotate' | 'chars';
  duration?: number;
  interval?: number;
  loop?: boolean;
}

export interface InitCountRevealOptions {
  stagger?: number;
}

/**
 * Wraps text content into animated spans for count reveal
 */
export function createCountSpans(text: string, options?: { stagger?: number }): CountSpanData[];

/**
 * Formats a number with separators
 */
export function formatNumber(num: number, separator?: string): string;

/**
 * Creates an easing function for count animations
 */
export function getEasing(easing?: string): (t: number) => number;

/**
 * Animates a count from one value to another (framework-agnostic)
 * @returns Cancel function
 */
export function animateValue(options: AnimateValueOptions): () => void;

/**
 * Text flip word rotator (framework-agnostic)
 */
export function createTextRotator(options: TextRotatorOptions): TextRotator | null;

/**
 * Replay animation by toggling class
 */
export function replayAnimation(element: HTMLElement, className: string): void;

/**
 * CSS variable helper - generates style object for CSS custom properties
 */
export function cssVars(vars: Record<string, string | number>): Record<string, string | number>;

/**
 * Generates stagger delay styles for children
 */
export function staggerStyle(index: number, stagger?: number): {
  '--tm-stagger': number;
  '--tm-delay': string;
};

/**
 * Animation class builder - helps construct TailMotion class strings
 */
export function tm(animation: string, modifiers?: TmModifiers): string;

/**
 * Vanilla JS: Initialize count reveal on a DOM element
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 */
export function initCountRevealElement(element: HTMLElement, options?: InitCountRevealOptions): void;

/**
 * Vanilla JS: Initialize text flip on a DOM element
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 */
export function initTextFlipElement(element: HTMLElement, options: InitTextFlipOptions): TextRotator | null;

/**
 * Default export containing all utilities
 */
declare const TailMotion: {
  createCountSpans: typeof createCountSpans;
  formatNumber: typeof formatNumber;
  getEasing: typeof getEasing;
  animateValue: typeof animateValue;
  createTextRotator: typeof createTextRotator;
  replayAnimation: typeof replayAnimation;
  cssVars: typeof cssVars;
  staggerStyle: typeof staggerStyle;
  tm: typeof tm;
  initCountRevealElement: typeof initCountRevealElement;
  initTextFlipElement: typeof initTextFlipElement;
};

export default TailMotion;

// Plugin types
declare module 'tailmotion/plugin' {
  import { PluginCreator } from 'tailwindcss/types/config';
  
  interface TailMotionPluginOptions {
    durations?: Record<string | number, string>;
    delays?: Record<string | number, string>;
    easing?: Record<string, string>;
    repeat?: Record<string | number, string>;
  }
  
  const plugin: PluginCreator & {
    (options?: TailMotionPluginOptions): ReturnType<PluginCreator>;
  };
  
  export default plugin;
}

// Utils module types
declare module 'tailmotion/utils' {
  export * from 'tailmotion';
  export { default } from 'tailmotion';
}
