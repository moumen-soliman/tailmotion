import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Copy,
  RotateCcw,
  Sparkles,
  Github,
  Leaf,
  Terminal,
  FileCode,
  Code,
  Folder,
  Star,
} from 'lucide-react';
import { animations } from './animations';

// Import utilities from tailmotion package
import { initTextFlipElement } from 'tailmotion/utils';

const badgeColors = {
  hover: 'bg-blue-900/50 text-blue-300',
  js: 'bg-amber-900/50 text-amber-300',
  html: 'bg-purple-900/50 text-purple-300',
};

const badgeLabels = {
  hover: 'hover',
  js: 'JS',
  html: 'HTML',
};

const variants = ['hover', 'focus', 'active', 'group-hover', 'sm', 'md', 'lg', 'xl', '2xl', 'motion-safe', 'dark', 'md:hover'];

const baseClassName = (selected) => `tm-${selected}`;

function usageCode(anim, className, selectedAnimation) {
  if (anim?.badge === 'hover') {
    return `<button class="${className}">Hover me</button>`;
  }
  if (anim?.badge === 'js') {
    const variant = selectedAnimation === 'text-flip' ? 'flip' : 'morph';
    return `<!-- HTML -->\n<span id="my-text" class="${className}"></span>\n\n<!-- JS -->\nimport { initTextFlipElement } from 'tailmotion/utils';\n\ninitTextFlipElement(document.getElementById('my-text'), {\n  words: ['beautiful', 'amazing', 'powerful'],\n  variant: '${variant}',\n  interval: 2500,\n});`;
  }
  if (anim?.badge === 'html') {
    if (selectedAnimation === 'count-reveal') {
      return `<div class="${className}">\n  <span>1</span><span>2</span><span>,</span><span>3</span><span>4</span><span>5</span>\n</div>`;
    }
    if (selectedAnimation === 'stagger') {
      return `<ul class="${className}">\n  <li>Item 1</li>\n  <li>Item 2</li>\n  <li>Item 3</li>\n</ul>`;
    }
    if (selectedAnimation === 'avatar-group') {
      return `<div class="${className}">\n  <div class="tm-avatar tm-avatar-ring">A</div>\n  <div class="tm-avatar tm-avatar-ring">B</div>\n  <div class="tm-avatar">+3</div>\n</div>`;
    }
  }
  if (selectedAnimation === 'slide-digit') {
    return `<div class="flex items-center">\n  <span class="tm-slide-digit tm-delay-0">4</span>\n  <span class="tm-slide-digit tm-delay-75">2</span>\n</div>`;
  }
  return `<div class="${className}">Content</div>`;
}

function cssCode() {
  return `/* Import CSS */\n@import 'tailmotion/css';\n\n/* Or in JS */\nimport 'tailmotion/css';\n\n/* Or link directly */\n<link rel="stylesheet" href="/tailmotion.css">`;
}

function tailwindCode() {
  return `// tailwind.config.js\nmodule.exports = {\n  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],\n  plugins: [],\n}\n\n// In your CSS\n@import 'tailwindcss';\n@import 'tailmotion/css';`;
}

function Preview({ anim, baseClass, trigger, selected }) {
  const textRef = useRef(null);
  const rotatorRef = useRef(null);
  const boxRef = useRef(null);
  const prevClassRef = useRef(null);

  // Handle animation class application based on trigger
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;

    // Remove any previously applied animation class
    if (prevClassRef.current) {
      el.classList.remove(prevClassRef.current);
    }
    prevClassRef.current = baseClass;

    // For 'load' trigger, add the class immediately
    if (trigger === 'load') {
      el.classList.add(baseClass);
    }
  }, [selected, trigger, baseClass]);

  // Initialize JS-driven text animations when needed
  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    // Clean up previous rotator to avoid duplicates
    if (rotatorRef.current && rotatorRef.current.destroy) {
      rotatorRef.current.destroy();
      rotatorRef.current = null;
    }

    if (selected === 'text-flip' || selected === 'text-morph') {
      const words = selected === 'text-flip' ? ['beautiful', 'amazing', 'powerful'] : ['developers', 'designers', 'creators'];
      // Clear any existing children before initializing
      el.innerHTML = '';
      const rotator = initTextFlipElement(el, {
        words,
        variant: selected === 'text-flip' ? 'flip' : 'morph',
        interval: 2000,
      });
      rotatorRef.current = rotator;
    }

    return () => {
      if (rotatorRef.current && rotatorRef.current.destroy) {
        rotatorRef.current.destroy();
        rotatorRef.current = null;
      }
    };
  }, [selected]);

  // Hover-only demos - use actual class names with CSS variables (not hover: prefix)
  if (anim?.badge === 'hover') {
    const liquidStyle = { '--tm-liquid-color': 'white' };

    // Specific hover previews matching static demo
    if (selected === 'liquid-btn') {
      return (
        <div className="flex flex-col gap-3">
          <button className="tm-liquid-btn rounded-lg border border-zinc-600 px-6 py-2.5 text-zinc-300 text-sm hover:text-black" style={liquidStyle}>
            Hover me (bottom)
          </button>
          <button className="tm-liquid-btn tm-liquid-btn-left rounded-lg border border-zinc-600 px-6 py-2.5 text-zinc-300 text-sm hover:text-black" style={liquidStyle}>
            Hover me (left)
          </button>
        </div>
      );
    }
    if (selected === 'liquid-wave') {
      return (
        <button className="tm-liquid-wave rounded-lg border border-zinc-600 px-6 py-2.5 text-zinc-300 text-sm hover:text-black" style={liquidStyle}>
          Hover for wave
        </button>
      );
    }
    if (selected === 'liquid-underline') {
      return (
        <button className="tm-liquid-underline rounded-lg border border-zinc-600 px-6 py-2.5 text-zinc-300 text-sm hover:text-black" style={liquidStyle}>
          Hover for underline fill
        </button>
      );
    }
    if (selected === 'shimmer-hover') {
      return (
        <div className="flex flex-col gap-3">
          <button className="tm-shimmer-hover rounded-lg bg-white px-6 py-2.5 text-zinc-950 text-sm font-medium">
            Hover for shimmer
          </button>
          <div className="tm-shimmer-hover rounded-lg bg-zinc-800 border border-zinc-700 p-4 cursor-pointer">
            <div className="text-white text-sm font-medium">Premium Card</div>
            <div className="text-zinc-500 text-xs">Hover for shine</div>
          </div>
        </div>
      );
    }
    if (selected === 'lift-hover') {
      return (
        <div className="tm-lift-hover cursor-pointer rounded-lg bg-zinc-800 border border-zinc-700 p-4 w-40" style={{ '--tm-lift-shadow-to': '0 20px 40px rgba(255,255,255,0.05)' }}>
          <div className="text-white text-sm font-medium">Hover Card</div>
          <div className="text-zinc-500 text-xs">Lifts up on hover</div>
        </div>
      );
    }
    if (selected === 'rotate-hover') {
      return (
        <div className="tm-rotate-hover cursor-pointer rounded-lg bg-zinc-800 border border-zinc-700 p-4 w-40">
          <div className="text-white text-sm font-medium">Tilt Card</div>
          <div className="text-zinc-500 text-xs">Rotates on hover</div>
        </div>
      );
    }
    if (selected === 'flip-hover') {
      return (
        <div className="tm-flip-hover cursor-pointer rounded-xl bg-white h-16 w-16 flex items-center justify-center">
          <span className="text-zinc-950 text-xl font-bold">TM</span>
        </div>
      );
    }

    // Default fallback for other hover animations
    return (
      <button className={`${baseClass} rounded-lg border border-zinc-600 px-6 py-2.5 text-zinc-300 text-sm`} style={liquidStyle}>
        Hover to see effect
      </button>
    );
  }

  // Container / text specific previews
  if (selected === 'count-reveal') {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-zinc-800 border border-zinc-700 px-5 py-3">
        <div className="tm-count-reveal text-2xl font-bold text-white font-mono">
          <span>1</span>
          <span>2</span>
          <span>,</span>
          <span>3</span>
          <span>4</span>
          <span>5</span>
        </div>
      </div>
    );
  }

  if (selected === 'stagger') {
    return (
      <ul className="tm-stagger space-y-2 w-40">
        <li className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white text-xs">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          Item 1
        </li>
        <li className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white text-xs">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          Item 2
        </li>
        <li className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white text-xs">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          Item 3
        </li>
      </ul>
    );
  }

  if (selected === 'avatar-group') {
    return (
      <div className="tm-avatar-group">
        <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-zinc-900">
          <span className="tm-avatar-tooltip">Alice</span>A
        </div>
        <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium border-2 border-zinc-900">
          <span className="tm-avatar-tooltip">Bob</span>B
        </div>
        <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-medium border-2 border-zinc-900">
          <span className="tm-avatar-tooltip">Carol</span>C
        </div>
        <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-medium border-2 border-zinc-900">
          +5
        </div>
      </div>
    );
  }

  if (selected === 'slide-digit') {
    return (
      <div className="flex items-center gap-1 rounded-xl bg-zinc-800 border border-zinc-700 px-5 py-3">
        <span className="tm-slide-digit text-2xl font-bold text-white font-mono tm-delay-0">4</span>
        <span className="tm-slide-digit text-2xl font-bold text-white font-mono tm-delay-75">2</span>
      </div>
    );
  }

  if (selected === 'text-flip') {
    return (
      <div className="text-center">
        <span className="text-zinc-500 text-lg">Build </span>
        <span ref={textRef} className="tm-text-flip text-lg font-semibold text-white"></span>
        <span className="text-zinc-500 text-lg"> apps</span>
      </div>
    );
  }

  if (selected === 'text-morph') {
    return (
      <div className="text-center">
        <span className="text-zinc-500 text-lg">We are </span>
        <span ref={textRef} className="tm-text-morph text-lg font-semibold text-emerald-400"></span>
      </div>
    );
  }

  // Standard animations - use refs and direct DOM manipulation like vanilla demo
  const classNames = ['h-16 w-16 rounded-xl bg-white flex items-center justify-center transition-all'];
  
  if (trigger === 'click') {
    classNames.push('cursor-pointer');
  }
  // For 'load' trigger, always apply the class
  if (trigger === 'load') {
    classNames.push(baseClass);
  }

  return (
    <div
      ref={boxRef}
      className={classNames.join(' ')}
      onMouseEnter={() => {
        if (trigger === 'hover' && boxRef.current) {
          boxRef.current.classList.add(baseClass);
        }
      }}
      onMouseLeave={() => {
        if (trigger === 'hover' && boxRef.current) {
          boxRef.current.classList.remove(baseClass);
        }
      }}
      onClick={() => {
        if (trigger === 'click' && boxRef.current) {
          const el = boxRef.current;
          el.classList.remove(baseClass);
          void el.offsetWidth; // Force reflow
          el.classList.add(baseClass);
        }
      }}
    >
      <Sparkles className="w-6 h-6 text-zinc-950" />
    </div>
  );
}

// Quick example cards (static)
function QuickExamples() {
  const liquidStyle = { '--tm-liquid-color': 'white', '--tm-liquid-background-color': '#09090b' };

  return (
    <section className="mb-20">
      <h2 className="text-xl font-semibold text-white mb-6">Quick Examples</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Liquid Buttons */}
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-4">Liquid Buttons</div>
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {['', 'tm-liquid-btn-top', 'tm-liquid-btn-left', 'tm-liquid-btn-right', 'tm-liquid-btn-center'].map((cls, idx) => (
              <button
                key={idx}
                className={`tm-liquid-btn ${cls} rounded-lg border border-zinc-600 px-4 py-2 text-zinc-200 text-xs hover:text-zinc-950`}
                style={liquidStyle}
              >
                {cls.includes('top') ? 'Top' : cls.includes('left') ? 'Left' : cls.includes('right') ? 'Right' : cls.includes('center') ? 'Center' : 'Bottom'}
              </button>
            ))}
            <button className="tm-liquid-wave rounded-lg border border-zinc-600 px-4 py-2 text-zinc-200 text-xs hover:text-zinc-950" style={liquidStyle}>
              Wave
            </button>
            <button className="tm-liquid-underline rounded-lg border border-zinc-600 px-4 py-2 text-zinc-200 text-xs hover:text-zinc-950" style={liquidStyle}>
              Underline
            </button>
          </div>
          <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 rounded-lg p-2 overflow-x-auto">
            <code>tm-liquid-btn{'\n'}tm-liquid-btn-top{'\n'}tm-liquid-btn-left{'\n'}tm-liquid-btn-center{'\n'}tm-liquid-wave{'\n'}tm-liquid-underline</code>
          </pre>
        </div>

        {/* Counter / GitHub Stars */}
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-4">Counter with Stars</div>
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-3 rounded-xl bg-zinc-800 border border-zinc-700 px-5 py-3">
              <Github className="w-5 h-5 text-zinc-400" />
              <div className="text-2xl font-bold text-white font-mono tabular-nums">
                <span className="tm-count-reveal">
                  <span>1</span>
                  <span>2</span>
                  <span>,</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5</span>
                </span>
              </div>
              <Star className="w-4 h-4 text-yellow-500 tm-sparkle tm-repeat-infinite" />
            </div>
          </div>
          <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 rounded-lg p-2 overflow-x-auto">
            <code>{'<div class="tm-count-reveal"> <span>1</span>...</div>'}</code>
          </pre>
        </div>

        {/* Shimmer */}
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-4">Shimmer Effect</div>
          <div className="flex flex-col items-center gap-3 mb-6">
            <button className="tm-shimmer-hover rounded-lg bg-white px-6 py-2.5 text-zinc-950 text-sm font-medium">Hover for shimmer</button>
            <div className="tm-shimmer-hover rounded-lg bg-zinc-800 border border-zinc-700 p-4 w-full cursor-pointer">
              <div className="text-white text-sm font-medium">Premium Card</div>
              <div className="text-zinc-500 text-xs">Hover for shine effect</div>
            </div>
          </div>
          <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 rounded-lg p-2 overflow-x-auto">
            <code>{'<button class="tm-shimmer-hover">Hover for shimmer</button>'}</code>
          </pre>
        </div>

        {/* Avatar Group */}
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-4">Avatar Group</div>
          <div className="flex justify-center mb-6">
            <div className="tm-avatar-group">
              <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium border-2 border-zinc-900">
                <span className="tm-avatar-tooltip">Alice</span>A
              </div>
              <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-medium border-2 border-zinc-900">
                <span className="tm-avatar-tooltip">Bob</span>B
              </div>
              <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xs font-medium border-2 border-zinc-900">
                <span className="tm-avatar-tooltip">Carol</span>C
              </div>
              <div className="tm-avatar tm-avatar-ring w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-300 text-xs font-medium border-2 border-zinc-900">
                +5
              </div>
            </div>
          </div>
          <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 rounded-lg p-2 overflow-x-auto">
            <code>{'<div class="tm-avatar-group"><div class="tm-avatar">A</div>...</div>'}</code>
          </pre>
        </div>

        {/* Loading States */}
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-4">Loading States</div>
          <div className="flex justify-center gap-6 mb-6">
            <div className="tm-spin tm-repeat-infinite h-8 w-8 rounded-full border-2 border-zinc-700 border-t-white" />
            <div className="flex gap-1 items-center">
              <div className="tm-bounce tm-repeat-infinite tm-delay-0 h-2 w-2 rounded-full bg-zinc-400" />
              <div className="tm-bounce tm-repeat-infinite tm-delay-150 h-2 w-2 rounded-full bg-zinc-400" />
              <div className="tm-bounce tm-repeat-infinite tm-delay-300 h-2 w-2 rounded-full bg-zinc-400" />
            </div>
            <div className="tm-pulse tm-repeat-infinite h-8 w-8 rounded-lg bg-zinc-700" />
          </div>
          <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 rounded-lg p-2 overflow-x-auto">
            <code>{'tm-spin tm-repeat-infinite\ntm-bounce tm-repeat-infinite\ntm-pulse tm-repeat-infinite'}</code>
          </pre>
        </div>

        {/* Lift Card */}
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-4">Lift & Hover Card</div>
          <div className="flex justify-center mb-6">
            <div
              className="group tm-lift-hover cursor-pointer rounded-lg bg-zinc-800 border border-zinc-700 p-4 w-48"
              style={{ '--tm-lift-shadow-to': '0 20px 40px rgba(255,255,255,0.03)' }}
            >
              <div className="group-hover:tm-wiggle inline-block mb-2">
                <Folder className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-white text-sm font-medium">Project</div>
              <div className="text-zinc-500 text-xs">12 files</div>
            </div>
          </div>
          <pre className="text-[10px] font-mono text-zinc-500 bg-zinc-900/50 rounded-lg p-2 overflow-x-auto">
            <code>{'<div class="tm-lift-hover"><i class="group-hover:tm-wiggle"></i></div>'}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function VariantsGrid() {
  return (
    <section className="mb-20">
      <h2 className="text-xl font-semibold text-white mb-6">All Variants Supported</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {variants.map((v) => (
          <div key={v} className="card rounded-lg p-4 text-center bg-zinc-900/50 border border-zinc-800/50">
            <code className="text-xs text-zinc-300">{v}:</code>
            <div className="text-[10px] text-zinc-600 mt-1">
              {v.includes('hover')
                ? 'On hover'
                : v === 'dark'
                ? 'Dark mode'
                : v === 'motion-safe'
                ? 'Prefers motion'
                : v.includes(':')
                ? 'Combined'
                : 'Breakpoint'}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Installation() {
  return (
    <section className="mb-20">
      <h2 className="text-xl font-semibold text-white mb-6">Installation</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center">
              <Terminal className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-sm text-white font-medium">1. Install</span>
          </div>
          <pre className="text-sm font-mono bg-zinc-900/50 rounded-lg p-4 text-zinc-300">npm install tailmotion</pre>
        </div>
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center">
              <FileCode className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-sm text-white font-medium">2. Import CSS</span>
          </div>
          <pre className="text-sm font-mono bg-zinc-900/50 rounded-lg p-4 text-zinc-300">@import 'tailmotion/css';</pre>
        </div>
        <div className="card rounded-xl p-6 md:col-span-2 bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-6 w-6 rounded bg-zinc-800 flex items-center justify-center">
              <Code className="w-3 h-3 text-zinc-400" />
            </div>
            <span className="text-sm text-white font-medium">3. Use Classes</span>
          </div>
          <pre className="text-sm font-mono bg-zinc-900/50 rounded-lg p-4 text-zinc-400 overflow-x-auto">
            <code>
              <span className="text-zinc-600">// Basic animation</span>
              {'\n'}
              {'<div class="tm-fade-in">Hello</div>'}
              {'\n\n'}
              <span className="text-zinc-600">// With delay</span>
              {'\n'}
              {'<div class="tm-rise tm-delay-300">Card</div>'}
              {'\n\n'}
              <span className="text-zinc-600">// Hover</span>
              {'\n'}
              {'<button class="hover:tm-bounce">Click</button>'}
              {'\n\n'}
              <span className="text-zinc-600">// Responsive</span>
              {'\n'}
              {'<div class="md:tm-pop lg:hover:tm-wiggle">Responsive</div>'}
            </code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function FrameworkUsage() {
  return (
    <section className="mb-20">
      <h2 className="text-xl font-semibold text-white mb-6">Framework Usage</h2>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-5 h-5 text-zinc-400" />
            <span className="text-sm text-white font-medium">React</span>
          </div>
          <pre className="text-[11px] font-mono bg-zinc-900/50 rounded-lg p-3 text-zinc-400 overflow-x-auto">
            <code>{`import 'tailmotion/css';\n\n<button className="hover:tm-bounce">Click</button>`}</code>
          </pre>
        </div>
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-white font-medium">Vue</span>
          </div>
          <pre className="text-[11px] font-mono bg-zinc-900/50 rounded-lg p-3 text-zinc-400 overflow-x-auto">
            <code>{`<style>\n@import 'tailmotion/css';\n</style>\n\n<button class="hover:tm-shake">Click</button>`}</code>
          </pre>
        </div>
        <div className="card rounded-xl p-6 bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-white font-medium">Svelte</span>
          </div>
          <pre className="text-[11px] font-mono bg-zinc-900/50 rounded-lg p-3 text-zinc-400 overflow-x-auto">
            <code>{`<script>\n  import 'tailmotion/css';\n</script>\n\n<button class="hover:tm-pop">Click</button>`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [selected, setSelected] = useState('fade-in');
  const [trigger, setTrigger] = useState('load');
  const [codeTab, setCodeTab] = useState('usage');

  const anim = useMemo(() => animations.find((a) => a.name === selected), [selected]);
  const baseClass = useMemo(() => baseClassName(selected), [selected]);
  const displayClassName = useMemo(() => {
    if (!anim?.badge && anim?.category !== 'text') {
      if (trigger === 'hover') return `hover:${baseClass}`;
      if (trigger === 'click') return `active:${baseClass}`;
    }
    return baseClass;
  }, [anim, baseClass, trigger]);

  const code = useMemo(() => {
    if (codeTab === 'css') return cssCode();
    if (codeTab === 'tailwind') return tailwindCode();
    return usageCode(anim, displayClassName, selected);
  }, [codeTab, anim, displayClassName, selected]);

  const categories = useMemo(() => {
    const grouped = {};
    animations.forEach((a) => {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });
    return grouped;
  }, []);

  const bundleSize = anim ? `~${anim.size.toFixed(1)}KB for selected` : '~0.2KB for selected';

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-400">
      <header className="border-b border-zinc-800/50 sticky top-0 z-50 backdrop-blur-xl bg-zinc-950/80">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-zinc-950 text-xs font-semibold">TM</div>
            <span className="font-medium text-white text-sm">TailMotion</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">React</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/moumen-soliman/tailmotion"
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <button
              onClick={() => navigator.clipboard.writeText('npm install tailmotion')}
              className="copy-btn flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
            >
              <span>npm i tailmotion</span>
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-white tracking-tight mb-4">
            Motion utilities for
            <br />
            Tailwind CSS
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto mb-8">
            Zero runtime. Tree-shakable. Framework-agnostic.
            <br />
            Pure CSS keyframes that just work.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="https://github.com/moumen-soliman/tailmotion"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-white text-zinc-950 text-sm font-medium"
            >
              View on GitHub
            </a>
            <button
              onClick={() => navigator.clipboard.writeText('@import "tailmotion/css";')}
              className="px-4 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800"
            >
              Copy Import
            </button>
          </div>
        </section>

        {/* Stats */}
        <section className="grid md:grid-cols-3 gap-3 mb-12">
          <div className="card rounded-xl p-4 bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500">Animations</div>
            <div className="text-2xl font-semibold text-white">30+</div>
            <div className="text-[11px] text-zinc-600">Loop, entrance, hover, text, celebrate</div>
          </div>
          <div className="card rounded-xl p-4 bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500">Tailwind Variants</div>
            <div className="text-2xl font-semibold text-white">All</div>
            <div className="text-[11px] text-zinc-600">hover, focus, active, responsive, motion-safe</div>
          </div>
          <div className="card rounded-xl p-4 bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500">Tree-shakable</div>
            <div className="text-2xl font-semibold text-white">Yes</div>
            <div className="text-[11px] text-zinc-600">Import only what you use</div>
          </div>
        </section>

        {/* Playground */}
        <section className="mb-20">
          <div className="grid lg:grid-cols-[280px_1fr_320px] gap-4">
            {/* Animation Selector */}
            <div className="card rounded-xl p-4 h-[500px] overflow-hidden flex flex-col bg-zinc-900/50 border border-zinc-800/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Animations</span>
                <span id="selected-count" className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                  1 selected
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-1 -mr-2 pr-2" id="animation-list">
                {Object.entries(categories).map(([cat, items]) => (
                  <div key={cat} className="mb-3">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1 px-2">{cat}</div>
                    {items.map((a) => (
                      <div
                        key={a.name}
                        className={`animation-item flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer ${
                          selected === a.name ? 'bg-zinc-800 border border-zinc-700 text-white' : 'hover:bg-zinc-900'
                        }`}
                        onClick={() => setSelected(a.name)}
                      >
                        <div
                          className={`w-3 h-3 rounded-full border flex-shrink-0 ${
                            selected === a.name ? 'bg-white border-white' : 'border-zinc-600'
                          }`}
                        >
                          {selected === a.name ? <div className="w-1.5 h-1.5 rounded-full bg-zinc-950 m-[2px]" /> : null}
                        </div>
                        <span className={`text-xs flex-1 truncate ${selected === a.name ? 'text-white' : 'text-zinc-400'}`}>tm-{a.name}</span>
                        {a.badge && <span className={`text-[9px] px-1 py-0.5 rounded ${badgeColors[a.badge]}`}>{badgeLabels[a.badge]}</span>}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="card rounded-xl p-6 h-[500px] flex flex-col bg-zinc-900/50 border border-zinc-800/50">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Preview</span>
                <button
                  onClick={() => {
                    // force re-render by toggling trigger state quickly
                    setTrigger((t) => (t === 'load' ? 'hover' : 'load'));
                    setTimeout(() => setTrigger((t) => (t === 'load' ? 'hover' : 'load')), 10);
                  }}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            <div className="flex-1 flex items-center justify-center bg-zinc-900/50 rounded-lg border border-zinc-800/50" id="preview-area">
                <Preview anim={anim} baseClass={baseClass} trigger={trigger} selected={selected} />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs text-zinc-600">Trigger:</span>
                {['load', 'hover', 'click'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTrigger(t)}
                    className={`text-xs px-2 py-1 rounded ${trigger === t ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}
                    data-trigger={t}
                  >
                    {t === 'load' ? 'On Load' : t === 'hover' ? 'On Hover' : 'On Click'}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Output */}
            <div className="card rounded-xl p-4 h-[500px] flex flex-col bg-zinc-900/50 border border-zinc-800/50">
              {/* Class name copy */}
              <div className="mb-3">
                <div className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1.5">Class</div>
                <div className="flex items-center gap-2">
                  <code id="class-name" className="flex-1 text-sm font-mono text-white bg-zinc-800 rounded-lg px-3 py-2 truncate">
                    {displayClassName}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(displayClassName)}
                    className="copy-btn p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                    title="Copy class name"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Code tabs */}
              <div className="flex items-center gap-1 mb-2">
                {['usage', 'css', 'tailwind'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCodeTab(tab)}
                    className={`code-tab text-[10px] px-2 py-1 rounded ${
                      codeTab === tab ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-500 hover:text-white'
                    }`}
                    data-tab={tab}
                  >
                    {tab === 'usage' ? 'Usage' : tab === 'css' ? 'CSS' : 'Tailwind'}
                  </button>
                ))}
                <div className="flex-1"></div>
                <button
                  onClick={() => navigator.clipboard.writeText(code)}
                  className="copy-btn p-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
                  title="Copy code"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto bg-zinc-900/50 rounded-lg border border-zinc-800/50 p-3">
                <pre id="code-output" className="text-xs font-mono text-zinc-400 whitespace-pre-wrap">
                  {code}
                </pre>
              </div>

              <div className="mt-3 p-3 rounded-lg bg-emerald-950/30 border border-emerald-900/30">
                <div className="flex items-center gap-2 text-emerald-400 text-xs">
                  <Leaf className="w-3 h-3" />
                  <span>Tree-shakable</span>
                </div>
                <div id="bundle-size" className="text-[10px] text-emerald-600 mt-1">
                  {bundleSize}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Examples */}
        <QuickExamples />

        {/* Variants Grid */}
        <VariantsGrid />

        {/* Installation */}
        <Installation />

        {/* Framework Usage */}
        <FrameworkUsage />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between text-sm text-zinc-600">
          <span>MIT License</span>
          <div className="flex items-center gap-4">
            <a href="https://github.com/moumen-soliman/tailmotion" className="hover:text-white transition-colors">
              GitHub
            </a>
            <a href="https://npmjs.com/package/tailmotion" className="hover:text-white transition-colors">
              npm
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

