// TailMotion TypeScript Definitions

export interface AnimateValueOptions {
  from?: number;
  to: number;
  duration?: number;
  easing?: (t: number) => number;
  onUpdate: (value: number) => void;
  onComplete?: () => void;
}

export interface TextRotatorOptions {
  words: string[];
  interval?: number;
  onFlip: (data: { word: string; index: number; prevWord: string | null }) => void;
}

export interface TextRotator {
  start: () => void;
  stop: () => void;
  next: () => void;
  destroy: () => void;
  getCurrentWord: () => string;
  getCurrentIndex: () => number;
}

export interface CountSpan {
  char: string;
  index: number;
  style: { animationDelay: string };
}

export interface CSSVarsOptions {
  duration?: string | number;
  delay?: string | number;
  easing?: string;
  iterationCount?: string | number;
}

export interface StaggerStyleResult {
  animationDelay: string;
}

/**
 * Animate a numeric value with easing
 */
export function animateValue(options: AnimateValueOptions): void;

/**
 * Create a text rotator for cycling through words
 */
export function createTextRotator(options: TextRotatorOptions): TextRotator;

/**
 * Create span data array for count reveal animations
 */
export function createCountSpans(text: string, staggerMs?: number): CountSpan[];

/**
 * Format a number with locale-aware separators
 */
export function formatNumber(num: number, locale?: string): string;

/**
 * Generate CSS custom properties for animation configuration
 */
export function cssVars(options: CSSVarsOptions): Record<string, string>;

/**
 * Generate stagger delay style for an index
 */
export function staggerStyle(index: number, baseDelayMs?: number): StaggerStyleResult;

/**
 * Build class string for TailMotion animation
 */
export function tm(animation: string, options?: CSSVarsOptions): string;

// DOM Helpers (vanilla JS only)
export function initTextFlipElement(
  element: HTMLElement,
  options: {
    words: string[];
    variant?: 'flip' | 'morph' | 'chars';
    interval?: number;
  }
): TextRotator;

export function initCountRevealElement(
  element: HTMLElement,
  options?: { stagger?: number }
): void;

