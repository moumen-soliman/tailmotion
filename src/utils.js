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
 * Generates stagger delay styles for children.
 * Emits --tm-stagger-index for .tm-stagger containers and --tm-stagger for
 * .tm-count-reveal, so one call drives either.
 * @param {number} index - Child index
 * @param {number} [stagger=100] - Delay between items in ms
 * @returns {Object} Style object with delay
 */
export function staggerStyle(index, stagger = 100) {
  return {
    '--tm-stagger': index,
    '--tm-stagger-index': index,
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
  if (modifiers.distance) classes.push(`tm-distance-${modifiers.distance}`);
  if (modifiers.staggerStep) classes.push(`tm-stagger-step-${modifiers.staggerStep}`);
  
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
 * Vanilla JS: Initialize a number that pops its digits in on every change
 * Reads the element's own text for the first render unless `value` is given,
 * so it also works with an element whose children are owned by a framework.
 * @param {HTMLElement} element - DOM element
 * @param {Object} [options] - Options
 * @param {string|number} [options.value] - Initial value; defaults to the element's text
 * @param {number} [options.stagger=40] - Delay between digits in ms
 * @returns {{ update: (value: string|number) => void }} Controller
 */
export function initNumberSwapElement(element, options = {}) {
  if (!element) return null;

  const { value = element.textContent || '', stagger = 40 } = options;

  function render(next) {
    element.classList.add('tm-number-swap');
    element.innerHTML = '';

    String(next).split('').forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.setProperty('--tm-stagger', i);
      span.style.setProperty('--tm-number-stagger-step', `${stagger}ms`);
      element.appendChild(span);
    });
  }

  render(value);

  return { update: render };
}

/**
 * Vanilla JS: Initialize text that resolves in word by word
 * Reads the element's own text for the first render unless `text` is given.
 * Whitespace between words is preserved as plain text nodes, so the
 * paragraph still wraps normally -- only the words themselves are spans.
 * @param {HTMLElement} element - DOM element
 * @param {Object} [options] - Options
 * @param {string} [options.text] - Text to stream; defaults to the element's text
 * @param {number} [options.stagger=60] - Delay between words in ms
 * @returns {{ update: (text: string) => void }} Controller
 */
export function initStreamTextElement(element, options = {}) {
  if (!element) return null;

  const { text = element.textContent || '', stagger = 60 } = options;

  function render(nextText) {
    element.classList.add('tm-stream-text');
    element.textContent = '';

    let wordIndex = 0;
    nextText.split(/(\s+)/).forEach((token) => {
      if (token === '') return;

      if (/^\s+$/.test(token)) {
        element.appendChild(document.createTextNode(token));
        return;
      }

      const span = document.createElement('span');
      span.textContent = token;
      span.style.setProperty('--tm-stagger', wordIndex);
      span.style.setProperty('--tm-stream-text-stagger-step', `${stagger}ms`);
      element.appendChild(span);
      wordIndex += 1;
    });
  }

  render(text);

  return { update: render };
}

/**
 * Vanilla JS: Read a words array off an element's `data-tm-words` attribute
 * (a JSON array, e.g. `data-tm-words='["beautiful","amazing","powerful"]'`).
 * @param {HTMLElement} element - DOM element
 * @returns {string[]} Parsed words, or an empty array if absent/invalid
 */
function readWordsAttribute(element) {
  const raw = element.dataset.tmWords;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn('initTextFlipElement: data-tm-words is not valid JSON', raw);
    return [];
  }
}

/**
 * Vanilla JS: Initialize text flip on a DOM element
 * Only use this for vanilla JS projects, not with React/Vue/etc.
 *
 * For "flip", "morph" and "rotate" this renders every word as a sibling
 * span once and hands the cycle to CSS ([data-tm-count] in
 * src/animations/text-flip.css) -- there is no interval, nothing ticks, and
 * the returned controller only tears the markup back down. "chars" still
 * needs JS to drive it: each word change re-splits fresh characters rather
 * than swapping between two fixed states, which CSS keyframes cannot do.
 * @param {HTMLElement} element - DOM element
 * @param {Object} [options] - Options
 * @param {string[]} [options.words] - Words to cycle through; defaults to
 *   parsing the element's `data-tm-words='["a","b","c"]'` attribute
 * @param {'flip'|'morph'|'rotate'|'chars'} [options.variant='flip'] - Effect
 * @param {number} [options.duration=500] - "chars" only: entrance duration in ms
 * @param {number} [options.interval=2500] - Time each word is shown, in ms
 * @param {boolean} [options.loop=true] - "chars" only: whether to loop
 * @returns {{ destroy: () => void }|Object|null} Controller
 */
export function initTextFlipElement(element, options = {}) {
  if (!element) return null;

  const {
    words = readWordsAttribute(element),
    variant = 'flip',
    duration = 500,
    interval = 2500,
    loop = true
  } = options;

  if (words.length < 2) return null;

  if (variant === 'chars') {
    element.classList.add('tm-text-flip-chars');
    element.style.setProperty('--tm-duration', `${duration}ms`);

    function renderChars(word) {
      element.innerHTML = '';
      word.split('').forEach((char, i) => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.setProperty('--tm-char-index', i);
        element.appendChild(span);
      });
    }

    const rotator = createTextRotator({
      words,
      interval,
      loop,
      onFlip: ({ word }) => renderChars(word)
    });

    rotator.start();
    return rotator;
  }

  const containerClass = variant === 'morph' ? 'tm-text-morph' :
                         variant === 'rotate' ? 'tm-text-rotate' : 'tm-text-flip';

  const wordClass = variant === 'morph' ? 'tm-text-morph-word' :
                    variant === 'rotate' ? 'tm-text-rotate-word' : 'tm-text-flip-word';

  element.classList.add(containerClass);
  element.style.setProperty('--tm-interval', `${interval}ms`);
  element.setAttribute('data-tm-count', String(words.length));
  element.innerHTML = '';

  words.forEach((word) => {
    const span = document.createElement('span');
    span.textContent = word;
    span.className = wordClass;
    element.appendChild(span);
  });

  return {
    destroy() {
      element.removeAttribute('data-tm-count');
      element.innerHTML = '';
    }
  };
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
  initNumberSwapElement,
  initStreamTextElement,
  initTextFlipElement
};
