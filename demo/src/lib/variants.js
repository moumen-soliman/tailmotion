/* --------------------------------------------------------------------------
   Which variants the shipped CSS actually contains.

   TailMotion's standalone stylesheet hand-writes variant selectors, so the set
   is a curated subset rather than "every Tailwind variant". Reading it out of
   the loaded stylesheet keeps this page honest: the UI only ever offers a
   trigger that really exists, and the numbers quoted on the page are counted,
   not estimated.
   -------------------------------------------------------------------------- */

const VARIANT_SELECTOR = /\.(?:\\3([0-9])\s*)?([a-z0-9-]+)\\:(tm-[a-z0-9-]+)/g;

const EMPTY = () => ({
  hover: new Set(),
  active: new Set(),
  focus: new Set(),
  'focus-visible': new Set(),
  'focus-within': new Set(),
  'group-hover': new Set(),
  'motion-safe': new Set(),
  breakpoints: new Set(),
});

const BREAKPOINTS = new Set(['sm', 'md', 'lg', 'xl', '2xl']);

let cached = null;

export function detectVariants() {
  if (cached) return cached;

  const found = EMPTY();
  if (typeof document === 'undefined') return found;

  const walk = (rules) => {
    for (const rule of rules) {
      // A style rule can carry both a selector and nested rules, so check for
      // each independently rather than treating them as alternatives.
      const selector = rule.selectorText;
      if (selector && selector.includes('\\:')) {
        for (const match of selector.matchAll(VARIANT_SELECTOR)) {
          const [, escapedDigit, word, className] = match;
          const variant = `${escapedDigit || ''}${word}`;
          const name = className.slice(3);
          if (BREAKPOINTS.has(variant)) {
            found.breakpoints.add(variant);
          } else if (found[variant]) {
            found[variant].add(name);
          }
        }
      }
      if (rule.cssRules && rule.cssRules.length) walk(rule.cssRules);
    }
  };

  for (const sheet of document.styleSheets) {
    try {
      walk(sheet.cssRules);
    } catch {
      // Cross-origin stylesheet (fonts, CDN). Nothing to read, nothing to do.
    }
  }

  cached = found;
  return found;
}

/** Triggers the explorer and Motion Lab may offer for a given class. */
export function triggersFor(name, variants) {
  const triggers = [{ id: 'load', label: 'Load' }];
  if (variants.hover.has(name)) triggers.push({ id: 'hover', label: 'Hover' });
  if (variants.active.has(name)) triggers.push({ id: 'press', label: 'Press' });
  return triggers;
}

export function classForTrigger(name, trigger) {
  if (trigger === 'hover') return `hover:tm-${name}`;
  if (trigger === 'press') return `active:tm-${name}`;
  return `tm-${name}`;
}
