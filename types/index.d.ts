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
  /** Travel distance for slide entrances and exits, e.g. 12 -> tm-distance-12 */
  distance?: string | number;
  /** Delay between staggered children, e.g. 150 -> tm-stagger-step-150 */
  staggerStep?: string | number;
}

/** The three shipped motion personalities, plus the reset. */
export type TailMotionProfile =
  | 'tm-motion-calm'
  | 'tm-motion-productive'
  | 'tm-motion-expressive'
  | 'tm-motion-default';

/**
 * The state contracts every tm-presence-* class and product recipe reads.
 * An element carrying none of these is treated as open.
 */
export type TailMotionState =
  | 'open'
  | 'closed'
  | 'active'
  | 'inactive'
  | 'checked'
  | 'unchecked'
  | 'on'
  | 'off';

/** States tm-feedback-button reads from its own data-state. */
export type TailMotionFeedbackState = 'idle' | 'loading' | 'success' | 'error';

/**
 * The CSS custom properties TailMotion reads. Timing tokens are intentionally
 * unset by default so each motion class can carry its own tuned value.
 */
export interface TailMotionVars {
  /* --- Explicit overrides. Always win over an inherited profile. --- */
  '--tm-duration'?: string;
  '--tm-delay'?: string;
  '--tm-easing'?: string;
  '--tm-iteration-count'?: string | number;
  '--tm-exit-duration'?: string;

  /* --- Profile factors. Inherited multipliers, not replacements. --- */
  /** Multiplies every animation's own default duration. 1 is the library default. */
  '--tm-duration-scale'?: string | number;
  /** Scales how far a keyframe departs from its resting value. */
  '--tm-emphasis'?: string | number;
  /** Scales only the frames that travel past the resting value. 0 removes overshoot. */
  '--tm-overshoot'?: string | number;

  /* --- Role easings. A profile retunes these; classes opt into a role. --- */
  '--tm-ease-entrance'?: string;
  '--tm-ease-exit'?: string;
  '--tm-ease-interaction'?: string;
  /** For something already on screen that moves or reshapes. */
  '--tm-ease-morph'?: string;
  /** The only role allowed to overshoot. */
  '--tm-ease-emphasis'?: string;

  /* --- Shared scalars --- */
  '--tm-stagger-step'?: string;
  /** Off (0px) by default. tm-stagger-blur sets it to 8px. */
  '--tm-stagger-blur'?: string;
  '--tm-stagger-index'?: number;
  '--tm-distance'?: string;
  /** Defaults to 70% of --tm-distance, resolved on the element. */
  '--tm-exit-distance'?: string;
  /** 1 in left-to-right contexts, -1 in right-to-left. Set by TailMotion. */
  '--tm-inline-flip'?: 1 | -1;

  /* --- Presence and recipes --- */
  /** Ratio of the closed transition to the open one. Defaults to 0.7. */
  '--tm-presence-exit-scale'?: string | number;
  /** -1 starts from the block-start / inline-start edge, 1 from the other. */
  '--tm-presence-direction'?: 1 | -1;
  /** transform-origin for presence, menu, tooltip, popover and dialog motion. */
  '--tm-origin'?: string;
  '--tm-toast-distance'?: string;
  /** Set from your component's measurement of the active tab. */
  '--tm-tab-offset'?: string;
  '--tm-tab-size'?: string;
  /** How long tm-hold-confirm must be held. Defaults to 1200ms. */
  '--tm-hold-duration'?: string;
  '--tm-hold-release-duration'?: string;
  '--tm-hold-fill'?: string;
  '--tm-hold-fill-opacity'?: string | number;
  /** Backdrop timing for tm-native-dialog. */
  '--tm-backdrop-duration'?: string;
  '--tm-marker-rotate'?: string;

  /* --- Scroll-driven --- */
  /** An animation-range value, e.g. "entry 15% entry 65%". */
  '--tm-scroll-range'?: string;
  '--tm-color'?: string;
  '--tm-shadow-color'?: string;
  '--tm-glow-color'?: string;
  '--tm-outline-color'?: string;
  '--tm-shimmer-color'?: string;
  '--tm-shimmer-opacity'?: string | number;
  '--tm-shimmer-text-color'?: string;
  '--tm-shimmer-text-resting'?: string;
  '--tm-shimmer-text-angle'?: string;
  '--tm-shimmer-text-band'?: string;
  '--tm-number-stagger-step'?: string;
  '--tm-stream-text-stagger-step'?: string;
  '--tm-stream-text-blur'?: string;
  '--tm-avatar-more-bg'?: string;
  '--tm-view-width'?: string;
  '--tm-view-height'?: string;
  '--tm-view-stage-width'?: string;
  '--tm-view-stage-height'?: string;
  '--tm-view-radius'?: string;
  '--tm-view-exit-y'?: string;
  '--tm-view-exit-scale'?: string | number;
  '--tm-view-exit-scale-x'?: string | number;
  '--tm-view-blur'?: string;
  '--tm-view-content-duration'?: string;
  '--tm-view-content-easing'?: string;
  '--tm-view-enter-delay'?: string;
}

export interface InitTextFlipOptions {
  /** Words to cycle through; defaults to parsing the element's `data-tm-words='["a","b"]'` attribute. */
  words?: string[];
  variant?: 'flip' | 'morph' | 'rotate' | 'chars';
  /** "chars" only: entrance duration in ms. */
  duration?: number;
  interval?: number;
  /** "chars" only: whether to loop. */
  loop?: boolean;
}

/**
 * Controller for the "flip" | "morph" | "rotate" variants: the words are
 * rendered once as siblings and CSS drives the cycle from there, so there is
 * nothing to start/stop/advance -- only markup to tear down.
 */
export interface TextFlipController {
  destroy: () => void;
}

export interface InitCountRevealOptions {
  stagger?: number;
}

export interface InitNumberSwapOptions {
  /** Initial value; defaults to the element's own text content. */
  value?: string | number;
  stagger?: number;
}

export interface NumberSwapController {
  update: (value: string | number) => void;
}

export interface InitStreamTextOptions {
  /** Text to stream; defaults to the element's own text content. */
  text?: string;
  stagger?: number;
}

export interface StreamTextController {
  update: (text: string) => void;
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
  '--tm-stagger-index': number;
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
 * Vanilla JS: Initialize a number that pops its digits in on every change
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 */
export function initNumberSwapElement(element: HTMLElement, options?: InitNumberSwapOptions): NumberSwapController | null;

/**
 * Vanilla JS: Initialize text that resolves in word by word
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 */
export function initStreamTextElement(element: HTMLElement, options?: InitStreamTextOptions): StreamTextController | null;

/**
 * Vanilla JS: Initialize text flip on a DOM element
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 *
 * "flip" | "morph" | "rotate" render once and hand the cycle to CSS
 * ([data-tm-count] in tailmotion.css), returning a TextFlipController.
 * "chars" still needs a running JS loop and returns a TextRotator.
 */
export function initTextFlipElement(element: HTMLElement, options?: InitTextFlipOptions): TextRotator | TextFlipController | null;

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
  initNumberSwapElement: typeof initNumberSwapElement;
  initStreamTextElement: typeof initStreamTextElement;
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
    /** Values for tm-stagger-* and its longer tm-stagger-step-* spelling. */
    stagger?: Record<string | number, string>;
    distance?: Record<string | number, string>;
    /** Values for tm-speed-*, the --tm-duration-scale factor. */
    speed?: Record<string | number, string>;
    /** Values for tm-emphasis-* and tm-overshoot-*. */
    emphasis?: Record<string | number, string>;
    /** Values for tm-hold-*, the tm-hold-confirm duration. */
    hold?: Record<string | number, string>;
    /**
     * Opt in to usage-generated CSS for the simple animation/interaction
     * catalogue (Tailwind v3 only -- see docs/install.mdx). Registers those
     * classes and their keyframes so Tailwind's JIT emits only what your
     * content uses. Off by default: the plugin is commonly loaded alongside
     * the complete `tailmotion/css` import, which already ships every class.
     */
    usageGenerated?: boolean;
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
