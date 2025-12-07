/**
 * TailMotion v0.1.0
 * Tiny motion utility pack for Tailwind CSS
 * Framework-agnostic - works with React, Vue, Svelte, Angular, vanilla JS
 * https://github.com/moumen-soliman/tailmotion
 */
(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.TailMotion = {}));
})(this, function(exports) {
  'use strict';

  /**
   * Wraps text content into animated spans for count reveal
   */
  function createCountSpans(text, options) {
    if (options === void 0) options = {};
    var stagger = options.stagger !== undefined ? options.stagger : 50;
    
    return text.split('').map(function(char, i) {
      return {
        char: char,
        index: i,
        style: { '--tm-stagger': i },
        delay: i * stagger
      };
    });
  }

  /**
   * Formats a number with separators
   */
  function formatNumber(num, separator) {
    if (separator === void 0) separator = ',';
    return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  }

  /**
   * Creates an easing function
   */
  function getEasing(easing) {
    if (easing === void 0) easing = 'easeOutExpo';
    var easings = {
      linear: function(t) { return t; },
      easeOutExpo: function(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); },
      easeOutQuart: function(t) { return 1 - Math.pow(1 - t, 4); },
      easeOutCubic: function(t) { return 1 - Math.pow(1 - t, 3); },
      easeInOutQuad: function(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    };
    return easings[easing] || easings.easeOutExpo;
  }

  /**
   * Animates a count from one value to another (framework-agnostic)
   */
  function animateValue(options) {
    var from = options.from !== undefined ? options.from : 0;
    var to = options.to;
    var duration = options.duration !== undefined ? options.duration : 1500;
    var easing = options.easing || 'easeOutExpo';
    var onUpdate = options.onUpdate;
    var onComplete = options.onComplete;

    if (typeof onUpdate !== 'function') {
      console.warn('animateValue requires an onUpdate callback');
      return function() {};
    }

    var easeFn = getEasing(easing);
    var startTime = performance.now();
    var range = to - from;
    var animationId = null;
    var cancelled = false;

    function update(currentTime) {
      if (cancelled) return;
      
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var easedProgress = easeFn(progress);
      var currentValue = from + (range * easedProgress);

      onUpdate(currentValue, progress);

      if (progress < 1) {
        animationId = requestAnimationFrame(update);
      } else if (onComplete) {
        onComplete();
      }
    }

    animationId = requestAnimationFrame(update);

    return function() {
      cancelled = true;
      if (animationId) cancelAnimationFrame(animationId);
    };
  }

  /**
   * Text flip word rotator (framework-agnostic)
   */
  function createTextRotator(options) {
    var words = options.words || [];
    var interval = options.interval !== undefined ? options.interval : 2500;
    var loop = options.loop !== undefined ? options.loop : true;
    var onFlip = options.onFlip;

    if (words.length < 2 || typeof onFlip !== 'function') {
      console.warn('createTextRotator requires words array and onFlip callback');
      return null;
    }

    var currentIndex = 0;
    var intervalId = null;
    var isRunning = false;

    function flip(newIndex) {
      var prevIndex = currentIndex;
      var prevWord = words[prevIndex];
      currentIndex = ((newIndex % words.length) + words.length) % words.length;
      
      onFlip({
        word: words[currentIndex],
        index: currentIndex,
        prevWord: prevWord,
        prevIndex: prevIndex
      });
    }

    function next() {
      var nextIndex = currentIndex + 1;
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
      start: start,
      stop: stop,
      next: next,
      prev: prev,
      goTo: goTo,
      destroy: destroy,
      get currentWord() { return words[currentIndex]; },
      get currentIndex() { return currentIndex; },
      get isRunning() { return isRunning; }
    };
  }

  /**
   * Replay animation by toggling class
   */
  function replayAnimation(element, className) {
    if (!element || !className) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
  }

  /**
   * CSS variable helper
   */
  function cssVars(vars) {
    var style = {};
    for (var key in vars) {
      if (vars.hasOwnProperty(key)) {
        var varName = key.startsWith('--') ? key : '--tm-' + key;
        style[varName] = vars[key];
      }
    }
    return style;
  }

  /**
   * Generates stagger delay styles
   */
  function staggerStyle(index, stagger) {
    if (stagger === void 0) stagger = 50;
    return {
      '--tm-stagger': index,
      '--tm-delay': index * stagger + 'ms'
    };
  }

  /**
   * Animation class builder
   */
  function tm(animation, modifiers) {
    if (modifiers === void 0) modifiers = {};
    var classes = ['tm-' + animation];
    
    if (modifiers.duration) classes.push('tm-duration-' + modifiers.duration);
    if (modifiers.delay) classes.push('tm-delay-' + modifiers.delay);
    if (modifiers.repeat) classes.push('tm-repeat-' + modifiers.repeat);
    if (modifiers.ease) classes.push('tm-ease-' + modifiers.ease);
    
    return classes.join(' ');
  }

  // ============================================
  // Vanilla JS DOM helpers
  // ============================================

  /**
   * Vanilla JS: Initialize count reveal on a DOM element
   */
  function initCountRevealElement(element, options) {
    if (options === void 0) options = {};
    if (!element) return;
    
    var text = element.textContent || '';
    var spans = createCountSpans(text, options);
    
    element.innerHTML = '';
    element.classList.add('tm-count-reveal');
    
    spans.forEach(function(span) {
      var el = document.createElement('span');
      el.textContent = span.char;
      for (var key in span.style) {
        el.style.setProperty(key, span.style[key]);
      }
      element.appendChild(el);
    });
  }

  /**
   * Vanilla JS: Initialize text flip on a DOM element
   */
  function initTextFlipElement(element, options) {
    if (options === void 0) options = {};
    if (!element) return null;
    
    var words = options.words || [];
    var variant = options.variant || 'flip';
    var duration = options.duration !== undefined ? options.duration : 500;
    var interval = options.interval !== undefined ? options.interval : 2500;
    var loop = options.loop !== undefined ? options.loop : true;

    if (words.length < 2) return null;

    var containerClass = variant === 'chars' ? 'tm-text-flip-chars' : 
                         variant === 'morph' ? 'tm-text-morph' :
                         variant === 'rotate' ? 'tm-text-rotate' : 'tm-text-flip';
    
    var wordClass = variant === 'chars' ? '' :
                    variant === 'morph' ? 'tm-text-morph-word' :
                    variant === 'rotate' ? 'tm-text-rotate-word' : 'tm-text-flip-word';
    
    var outClass = variant === 'morph' ? 'tm-morph-out' :
                   variant === 'rotate' ? 'tm-rotate-out' : 'tm-flip-out';

    element.classList.add(containerClass);
    element.style.setProperty('--tm-duration', duration + 'ms');

    function createWordSpan(word, isOut) {
      if (variant === 'chars') {
        var fragment = document.createDocumentFragment();
        word.split('').forEach(function(char, i) {
          var span = document.createElement('span');
          span.textContent = char === ' ' ? '\u00A0' : char;
          span.style.setProperty('--tm-char-index', i);
          fragment.appendChild(span);
        });
        return fragment;
      } else {
        var span = document.createElement('span');
        span.textContent = word;
        span.className = wordClass;
        if (isOut) span.classList.add(outClass);
        return span;
      }
    }

    var rotator = createTextRotator({
      words: words,
      interval: interval,
      loop: loop,
      onFlip: function(data) {
        if (variant === 'chars') {
          element.innerHTML = '';
          element.appendChild(createWordSpan(data.word));
        } else {
          element.appendChild(createWordSpan(data.word));
          
          if (data.prevWord !== null) {
            var oldSpan = element.querySelector('.' + wordClass + ':not(:last-child)');
            if (oldSpan) {
              oldSpan.classList.add(outClass);
              setTimeout(function() { oldSpan.remove(); }, duration);
            }
          }
        }
      }
    });

    rotator.start();
    return rotator;
  }

  // Exports
  exports.createCountSpans = createCountSpans;
  exports.formatNumber = formatNumber;
  exports.getEasing = getEasing;
  exports.animateValue = animateValue;
  exports.createTextRotator = createTextRotator;
  exports.replayAnimation = replayAnimation;
  exports.cssVars = cssVars;
  exports.staggerStyle = staggerStyle;
  exports.tm = tm;
  exports.initCountRevealElement = initCountRevealElement;
  exports.initTextFlipElement = initTextFlipElement;

  Object.defineProperty(exports, '__esModule', { value: true });
});
