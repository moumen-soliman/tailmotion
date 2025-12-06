/**
 * TailMotion Utilities
 * Framework-agnostic helper functions for animations
 * Works with React, Vue, Svelte, Angular, vanilla JS, etc.
 */

/**
 * Wraps text content into animated spans for count reveal
 * @param {string} text - The text to wrap
 * @param {Object} options - Animation options
 * @param {number} [options.stagger=50] - Delay between characters in ms
 * @returns {Array} Array of span data objects for rendering
 */
export function createCountSpans(text, options = {}) {
  const { stagger = 50 } = options;
  
  return text.split('').map((char, i) => ({
    char,
    index: i,
    style: { '--tm-stagger': i },
    delay: i * stagger
  }));
}

/**
 * Formats a number with separators
 * @param {number} num - Number to format
 * @param {string} [separator=','] - Thousands separator
 * @returns {string} Formatted number string
 */
export function formatNumber(num, separator = ',') {
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
}

/**
 * Creates an easing function for count animations
 * @param {string} [easing='easeOutExpo'] - Easing name
 * @returns {Function} Easing function
 */
export function getEasing(easing = 'easeOutExpo') {
  const easings = {
    linear: t => t,
    easeOutExpo: t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
    easeOutQuart: t => 1 - Math.pow(1 - t, 4),
    easeOutCubic: t => 1 - Math.pow(1 - t, 3),
    easeInOutQuad: t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  };
  return easings[easing] || easings.easeOutExpo;
}

/**
 * Animates a count from one value to another (framework-agnostic)
 * @param {Object} options - Animation options
 * @param {number} [options.from=0] - Starting number
 * @param {number} options.to - Target number
 * @param {number} [options.duration=1500] - Animation duration in ms
 * @param {string} [options.easing='easeOutExpo'] - Easing function name
 * @param {Function} options.onUpdate - Callback with current value
 * @param {Function} [options.onComplete] - Callback when complete
 * @returns {Function} Cancel function
 */
export function animateValue(options) {
  const {
    from = 0,
    to,
    duration = 1500,
    easing = 'easeOutExpo',
    onUpdate,
    onComplete
  } = options;

  if (typeof onUpdate !== 'function') {
    console.warn('animateValue requires an onUpdate callback');
    return () => {};
  }

  const easeFn = getEasing(easing);
  const startTime = performance.now();
  const range = to - from;
  let animationId = null;
  let cancelled = false;

  function update(currentTime) {
    if (cancelled) return;
    
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeFn(progress);
    const currentValue = from + (range * easedProgress);

    onUpdate(currentValue, progress);

    if (progress < 1) {
      animationId = requestAnimationFrame(update);
    } else {
      onComplete?.();
    }
  }

  animationId = requestAnimationFrame(update);

  // Return cancel function
  return () => {
    cancelled = true;
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
  };
}

/**
 * Text flip word rotator (framework-agnostic)
 * Returns controller object for managing word rotation
 * @param {Object} options - Options
 * @param {string[]} options.words - Array of words to cycle through
 * @param {number} [options.interval=2500] - Time between word changes in ms
 * @param {boolean} [options.loop=true] - Whether to loop infinitely
 * @param {Function} options.onFlip - Callback when word changes (receives { word, index, prevWord, prevIndex })
 * @returns {Object} Controller with start, stop, next, prev, goTo methods
 */
export function createTextRotator(options) {
  const {
    words = [],
    interval = 2500,
    loop = true,
    onFlip
  } = options;

  if (words.length < 2 || typeof onFlip !== 'function') {
    console.warn('createTextRotator requires words array and onFlip callback');
    return null;
  }

  let currentIndex = 0;
  let intervalId = null;
  let isRunning = false;

  function flip(newIndex) {
    const prevIndex = currentIndex;
    const prevWord = words[prevIndex];
    currentIndex = ((newIndex % words.length) + words.length) % words.length;
    
    onFlip({
      word: words[currentIndex],
      index: currentIndex,
      prevWord,
      prevIndex
    });
  }

  function next() {
    const nextIndex = currentIndex + 1;
    if (!loop && nextIndex >= words.length) {
      stop();
      return;
    }
    flip(nextIndex);
  }

  function prev() {
    flip(currentIndex - 1);
  }

  function goTo(index) {
    flip(index);
  }

  function start() {
    if (isRunning) return;
    isRunning = true;
    intervalId = setInterval(next, interval);
  }

  function stop() {
    isRunning = false;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function destroy() {
    stop();
  }

  // Initialize with first word
  onFlip({
    word: words[0],
    index: 0,
    prevWord: null,
    prevIndex: null
  });

  return {
    start,
    stop,
    next,
    prev,
    goTo,
    destroy,
    get currentWord() { return words[currentIndex]; },
    get currentIndex() { return currentIndex; },
    get isRunning() { return isRunning; }
  };
}

/**
 * Replay animation by toggling class
 * Works with any framework's ref system
 * @param {HTMLElement} element - DOM element reference
 * @param {string} className - Animation class name
 */
export function replayAnimation(element, className) {
  if (!element || !className) return;
  
  element.classList.remove(className);
  // Force reflow
  void element.offsetWidth;
  element.classList.add(className);
}

/**
 * CSS variable helper - generates style object for CSS custom properties
 * @param {Object} vars - Object of variable names and values
 * @returns {Object} Style object for use with React/Vue/Svelte
 */
export function cssVars(vars) {
  const style = {};
  for (const [key, value] of Object.entries(vars)) {
    const varName = key.startsWith('--') ? key : `--tm-${key}`;
    style[varName] = value;
  }
  return style;
}

/**
 * Generates stagger delay styles for children
 * @param {number} index - Child index
 * @param {number} [stagger=50] - Delay between items in ms
 * @returns {Object} Style object with delay
 */
export function staggerStyle(index, stagger = 50) {
  return {
    '--tm-stagger': index,
    '--tm-delay': `${index * stagger}ms`
  };
}

/**
 * Animation class builder - helps construct TailMotion class strings
 * @param {string} animation - Base animation name (e.g., 'bounce', 'fade-in')
 * @param {Object} [modifiers] - Optional modifiers
 * @returns {string} Complete class string
 */
export function tm(animation, modifiers = {}) {
  const classes = [`tm-${animation}`];
  
  if (modifiers.duration) classes.push(`tm-duration-${modifiers.duration}`);
  if (modifiers.delay) classes.push(`tm-delay-${modifiers.delay}`);
  if (modifiers.repeat) classes.push(`tm-repeat-${modifiers.repeat}`);
  if (modifiers.ease) classes.push(`tm-ease-${modifiers.ease}`);
  
  return classes.join(' ');
}

// ============================================
// Vanilla JS DOM helpers (optional, for non-framework usage)
// These are separate and won't interfere with frameworks
// ============================================

/**
 * Vanilla JS: Initialize count reveal on a DOM element
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 * @param {HTMLElement} element - DOM element
 * @param {Object} [options] - Options
 */
export function initCountRevealElement(element, options = {}) {
  if (!element) return;
  
  const text = element.textContent || '';
  const spans = createCountSpans(text, options);
  
  element.innerHTML = '';
  element.classList.add('tm-count-reveal');
  
  spans.forEach(({ char, style }) => {
    const span = document.createElement('span');
    span.textContent = char;
    Object.entries(style).forEach(([key, val]) => {
      span.style.setProperty(key, val);
    });
    element.appendChild(span);
  });
}

/**
 * Vanilla JS: Initialize text flip on a DOM element
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 * @param {HTMLElement} element - DOM element
 * @param {Object} options - Options
 */
export function initTextFlipElement(element, options = {}) {
  if (!element) return null;
  
  const {
    words = [],
    variant = 'flip',
    duration = 500,
    interval = 2500,
    loop = true
  } = options;

  if (words.length < 2) return null;

  const containerClass = variant === 'chars' ? 'tm-text-flip-chars' : 
                         variant === 'morph' ? 'tm-text-morph' :
                         variant === 'rotate' ? 'tm-text-rotate' : 'tm-text-flip';
  
  const wordClass = variant === 'chars' ? '' :
                    variant === 'morph' ? 'tm-text-morph-word' :
                    variant === 'rotate' ? 'tm-text-rotate-word' : 'tm-text-flip-word';
  
  const outClass = variant === 'morph' ? 'tm-morph-out' :
                   variant === 'rotate' ? 'tm-rotate-out' : 'tm-flip-out';

  element.classList.add(containerClass);
  element.style.setProperty('--tm-duration', `${duration}ms`);

  function createWordSpan(word, isOut = false) {
    if (variant === 'chars') {
      const fragment = document.createDocumentFragment();
      word.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--tm-char-index', i);
        fragment.appendChild(span);
      });
      return fragment;
    } else {
      const span = document.createElement('span');
      span.textContent = word;
      span.className = wordClass;
      if (isOut) span.classList.add(outClass);
      return span;
    }
  }

  const rotator = createTextRotator({
    words,
    interval,
    loop,
    onFlip: ({ word, prevWord }) => {
      if (variant === 'chars') {
        element.innerHTML = '';
        element.appendChild(createWordSpan(word));
      } else {
        // Add new word first
        element.appendChild(createWordSpan(word));
        
        // Animate out old word
        if (prevWord !== null) {
          const oldSpan = element.querySelector(`.${wordClass}:not(:last-child)`);
          if (oldSpan) {
            oldSpan.classList.add(outClass);
            setTimeout(() => oldSpan.remove(), duration);
          }
        }
      }
    }
  });

  rotator.start();
  return rotator;
}

// Default export with all utilities
export default {
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
  
  // Vanilla JS DOM helpers
  initCountRevealElement,
  initTextFlipElement
};
