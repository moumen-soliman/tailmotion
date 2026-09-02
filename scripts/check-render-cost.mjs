/* --------------------------------------------------------------------------
   Render cost, as a checked property.

   The library's promise is that motion is cheap. Nothing verified that. This
   walks the built stylesheet, works out which properties each class actually
   animates, and sorts them into the four places a browser can do the work:

     compositor  transform / translate / scale / rotate / opacity.
                 GPU only. No style, layout or paint work per frame.
     filter      filter / backdrop-filter. Composited in Chromium and Firefox;
                 Safari rasterizes blur, so cost scales with element area.
                 Capped at 8px -- see docs/reference/browser-support.mdx.
     paint       background-position, box-shadow, color, border-radius,
                 clip-path... Re-rasterizes the element every frame, on the
                 main thread.
     layout      width, height, inset, grid-template-rows, font-size...
                 Layout plus paint, and layout can cascade to siblings.

   The rules enforced here:

     1. Every animation that loops forever is compositor-only. A loop that
        paints is main-thread work for as long as the page is open, on every
        element carrying the class. This is the rule that would have caught
        tm-shimmer-text, tm-glow and tm-ripple in 0.10.
     2. A one-shot animation or transition may leave the compositor only with
        an allowlist entry that names the reason. An entry without a reason
        fails; the reason is the point.
     3. No blur radius exceeds 8px, resolving var() fallbacks and simple
        calc() products.
     4. No `transition: all` and no `transition-property: all`.
     5. will-change names only properties the compositor can actually act on.
     6. Keyframes in the entrance, exit, presence and scroll families use the
        individual translate / scale / rotate properties, never the transform
        shorthand, so a Tailwind rotate-3 on the same element survives.

   Writes dist/render-cost.json for the docs and the demo to consume.

   Run with `npm run check`, or directly:
   node scripts/check-render-cost.mjs
   -------------------------------------------------------------------------- */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir =
  process.env.TM_CHECK_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const fail = (message) => failures.push(message);

const TARGET = 'tailmotion.css';
const BLUR_CAP_PX = 8;

/* --------------------------------------------------------------------------
   Property tiers.

   Only properties that are actually animated are classified -- a static
   `position: relative` costs nothing per frame. `discrete` covers properties
   that either do not interpolate (display, visibility, custom properties) or
   are keyframe controls rather than animated values.
   -------------------------------------------------------------------------- */
const TIERS = {
  compositor: [
    'transform',
    'translate',
    'scale',
    'rotate',
    'opacity',
    'transform-origin',
  ],
  filter: ['filter', 'backdrop-filter'],
  discrete: [
    'visibility',
    'display',
    'overlay',
    'content-visibility',
    'pointer-events',
    'content',
    'z-index',
    'animation-timing-function',
    'animation-play-state',
  ],
  paint: [
    'background',
    'background-color',
    'background-image',
    'background-position',
    'background-position-x',
    'background-position-y',
    'background-size',
    'border-color',
    'border-block-color',
    'border-inline-color',
    'border-bottom-color',
    'border-left-color',
    'border-right-color',
    'border-top-color',
    'border-radius',
    'border-end-end-radius',
    'border-end-start-radius',
    'border-start-end-radius',
    'border-start-start-radius',
    'box-shadow',
    'caret-color',
    'clip-path',
    'color',
    'fill',
    'mask-image',
    'mask-position',
    'mask-size',
    'outline',
    'outline-color',
    'outline-offset',
    'outline-width',
    'stroke',
    'stroke-dashoffset',
    'text-decoration-color',
    'text-shadow',
    '-webkit-mask-image',
    '-webkit-mask-position',
    '-webkit-mask-size',
    '-webkit-text-fill-color',
  ],
  layout: [
    'block-size',
    'border-width',
    'bottom',
    'column-gap',
    'flex-basis',
    'font-size',
    'font-weight',
    'gap',
    'grid-template-columns',
    'grid-template-rows',
    'height',
    'inline-size',
    'inset',
    'inset-block',
    'inset-block-end',
    'inset-block-start',
    'inset-inline',
    'inset-inline-end',
    'inset-inline-start',
    'left',
    'letter-spacing',
    'line-height',
    'margin',
    'margin-block',
    'margin-bottom',
    'margin-inline',
    'margin-left',
    'margin-right',
    'margin-top',
    'max-block-size',
    'max-height',
    'max-inline-size',
    'max-width',
    'min-block-size',
    'min-height',
    'min-inline-size',
    'min-width',
    'padding',
    'padding-block',
    'padding-bottom',
    'padding-inline',
    'padding-left',
    'padding-right',
    'padding-top',
    'right',
    'row-gap',
    'top',
    'width',
    'word-spacing',
  ],
};

const TIER_OF = new Map();
for (const [tier, props] of Object.entries(TIERS)) {
  for (const prop of props) TIER_OF.set(prop, tier);
}
const TIER_RANK = { discrete: 0, compositor: 1, filter: 2, paint: 3, layout: 4 };

const tierOf = (property) => {
  if (property.startsWith('--')) return 'discrete';
  return TIER_OF.get(property) ?? null;
};

/* --------------------------------------------------------------------------
   The allowlist. Every entry names the reason, because the reason is the
   only thing that makes leaving the compositor a decision rather than an
   accident. `id` matches a @keyframes name or a selector fragment.
   -------------------------------------------------------------------------- */
const ALLOWLIST = [
  {
    id: 'tm-accordion-panel',
    properties: ['grid-template-rows'],
    reason:
      'The height tween is the behaviour being sold. One-shot, user-triggered, on one panel at a time.',
  },
  {
    id: 'tm-native-disclosure',
    properties: ['block-size', 'content-visibility'],
    reason:
      'Same as tm-accordion-panel, on the native <details> element. One-shot and user-triggered.',
  },
  {
    id: 'tm-tab-indicator',
    properties: ['inline-size'],
    reason:
      'The indicator has to match the width of the active tab. A scale would distort its border radius and its end caps.',
  },
  {
    id: 'tm-view-morph',
    properties: ['clip-path', 'inline-size', 'block-size'],
    reason:
      'A shared-element morph is a size change by definition. One-shot, one element, and the live blur is already dropped on coarse-pointer devices.',
  },
  {
    id: 'tm-reveal',
    properties: ['clip-path'],
    reason:
      'A wipe reveal is a clip by definition. One-shot; clip-path is composited in Chromium and paints elsewhere for roughly 500ms.',
  },
  {
    id: 'tm-unfold',
    properties: ['clip-path'],
    reason: 'As tm-reveal: the clip is the effect. One-shot.',
  },
  {
    id: 'tm-count-reveal',
    properties: ['clip-path'],
    reason: 'As tm-reveal: the clip is the effect. One-shot, on a digit-sized box.',
  },
  {
    id: 'tm-hold-delete',
    properties: ['color', 'background-color', 'border-radius', 'background', 'width', 'height'],
    reason:
      'Legacy. Pre-dates the rule that a motion class owns no appearance; kept for compatibility and scheduled for removal in 1.0. Use tm-hold-confirm.',
  },
  {
    id: 'tm-liquid',
    properties: [
      'height',
      'width',
      'left',
      'color',
      'background-color',
      'border-radius',
      'background',
    ],
    reason:
      'Legacy. Same as tm-hold-delete: appearance inside a motion class, kept for compatibility, scheduled for removal in 1.0.',
  },
  {
    id: 'tm-shimmer-text',
    properties: ['background-position'],
    reason:
      'The zero-markup path, superseded by the tm-shimmer-text-sweep recipe which runs on the compositor. Kept so 0.9 markup keeps working; scheduled for removal in 1.0. See docs/reference/render-cost.',
    loopExempt: true,
  },
  {
    id: 'tm-dark-veil',
    properties: ['filter', 'background-position', 'border-radius'],
    reason:
      'Decorative background, not product motion. A full-surface animated gradient cannot be composited; it is documented as expensive and excluded from the core tier.',
    loopExempt: true,
  },
  {
    id: 'tm-wavy',
    properties: ['background-position', 'filter'],
    reason:
      'Decorative background, as tm-dark-veil. Animating gradient stops is the effect; there is no compositor equivalent.',
    loopExempt: true,
  },
  {
    id: 'tm-fill-up',
    properties: ['clip-path'],
    reason:
      'A bottom-to-top fill is a clip by definition, the same case as tm-reveal. One-shot, on an icon-sized box.',
  },
  {
    id: 'tm-avatar',
    properties: ['box-shadow'],
    reason:
      'One-shot hover ring on a single avatar. Short, pointer-driven, and never more than one at a time.',
  },
  {
    id: 'tm-hover-lift',
    properties: ['box-shadow'],
    reason:
      'One-shot hover elevation. 200ms, pointer-driven, one element at a time. Measured before shipping: a card-sized repaint stays inside one frame.',
  },
  {
    id: 'tm-lift',
    properties: ['box-shadow'],
    reason: 'As tm-hover-lift.',
  },
];

/* Blur radii that exceed the 8px cap, each with the reason it is allowed to.
   Every entry here weakens the claim in browser-support.mdx, so keep the list
   short and keep the doc in step with it. */
const BLUR_EXCEPTIONS = [
  {
    id: 'tm-text-rotate',
    px: 10,
    reason:
      'The blur is the transition between two words, not decoration. It runs for 400ms on one inline element and never loops.',
  },
  {
    id: 'tm-text-morph',
    px: 12,
    reason:
      'As tm-text-rotate, and the heavier radius is what separates morph from rotate. 400ms, one inline element, never loops.',
  },
];

/* Keyframes whose transform-safety is a public promise: a Tailwind rotate-3
   or scale-95 on the same element has to survive the animation, which it only
   does when the keyframe uses the individual properties.

   This is not every keyframe that moves something. The exclusions are listed
   and reasoned about in docs/concepts/transform-safety.mdx -- 3D flips need
   perspective() inside a function list, and tm-sway, tm-morph and tm-unfold
   scale or rotate before they translate, which the individual properties
   cannot express because they always apply translate -> rotate -> scale.
   Adding one of those here and "fixing" the keyframe changes the motion. */
const TRANSFORM_SAFE_KEYFRAMES = [
  'tm-fade-in',
  'tm-fade-out',
  'tm-pop',
  'tm-drop-in',
  'tm-elastic',
  'tm-blur-in',
  'tm-blur-out',
  'tm-rotate-in',
  'tm-scale-in',
  'tm-scale-out',
  'tm-zoom-in',
  'tm-zoom-out',
  'tm-slide-block-start',
  'tm-slide-block-end',
  'tm-slide-inline-start',
  'tm-slide-inline-end',
  'tm-slide-block-out',
  'tm-slide-inline-out',
  'tm-glide',
  'tm-glide-right',
  'tm-scale-fade',
  'tm-rise',
  'tm-reveal',
  'tm-stagger-item',
  'tm-stagger-item-exit',
];

/* --------------------------------------------------------------------------
   A structural CSS reader.

   Brace-balanced, string- and comment-aware. Not a regex over the source:
   nesting has to be tracked to tell a keyframe step from a style rule, and to
   know which @supports or @media a rule sits inside.
   -------------------------------------------------------------------------- */
const parseCss = (css) => {
  const root = { type: 'root', header: '', children: [], decls: [] };
  const stack = [root];
  let buffer = '';
  let i = 0;

  const flushDeclaration = () => {
    const text = buffer.trim();
    buffer = '';
    if (!text || text.startsWith('@')) return;
    const colon = text.indexOf(':');
    if (colon === -1) return;
    const property = text.slice(0, colon).trim().toLowerCase();
    const value = text.slice(colon + 1).trim();
    if (property) stack[stack.length - 1].decls.push({ property, value });
  };

  while (i < css.length) {
    const ch = css[i];

    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2);
      i = end === -1 ? css.length : end + 2;
      continue;
    }

    if (ch === '"' || ch === "'") {
      let j = i + 1;
      while (j < css.length && css[j] !== ch) {
        if (css[j] === '\\') j += 1;
        j += 1;
      }
      buffer += css.slice(i, Math.min(j + 1, css.length));
      i = j + 1;
      continue;
    }

    if (ch === '{') {
      const header = buffer.replace(/\s+/g, ' ').trim();
      buffer = '';
      const node = {
        type: header.startsWith('@') ? 'atrule' : 'rule',
        header,
        name: header.startsWith('@') ? header.slice(1).split(/[\s(]/)[0] : '',
        children: [],
        decls: [],
      };
      stack[stack.length - 1].children.push(node);
      stack.push(node);
      i += 1;
      continue;
    }

    if (ch === '}') {
      flushDeclaration();
      if (stack.length > 1) stack.pop();
      i += 1;
      continue;
    }

    if (ch === ';') {
      flushDeclaration();
      i += 1;
      continue;
    }

    buffer += ch;
    i += 1;
  }

  return root;
};

const walk = (node, visit, ancestors = []) => {
  for (const child of node.children) {
    visit(child, ancestors);
    walk(child, visit, [...ancestors, child]);
  }
};

/* --------------------------------------------------------------------------
   Length resolution, enough for the blur cap.

   Resolves var() to its fallback and evaluates a single calc() product, which
   covers every blur in the library. Anything else is reported as dynamic and
   listed in the JSON rather than guessed at.
   -------------------------------------------------------------------------- */
const resolveLengthPx = (input) => {
  let expr = input.trim();

  for (let pass = 0; pass < 8 && expr.includes('var('); pass += 1) {
    const start = expr.indexOf('var(');
    let depth = 0;
    let end = -1;
    for (let i = start + 3; i < expr.length; i += 1) {
      if (expr[i] === '(') depth += 1;
      else if (expr[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) return null;
    const inner = expr.slice(start + 4, end);
    const comma = inner.indexOf(',');
    if (comma === -1) return null;
    expr = expr.slice(0, start) + inner.slice(comma + 1).trim() + expr.slice(end + 1);
  }

  expr = expr.replace(/calc\(/g, '(').trim();
  while (expr.startsWith('(') && expr.endsWith(')')) expr = expr.slice(1, -1).trim();

  if (/^0$/.test(expr)) return 0;
  const single = expr.match(/^([\d.]+)px$/);
  if (single) return Number(single[1]);
  const product = expr.match(/^\(?([\d.]+)(px)?\)?\s*\*\s*\(?([\d.]+)(px)?\)?$/);
  if (product && (product[2] || product[4])) return Number(product[1]) * Number(product[3]);
  return null;
};

const extractBlurs = (value) => {
  const out = [];
  let index = value.indexOf('blur(');
  while (index !== -1) {
    let depth = 0;
    let end = -1;
    for (let i = index + 4; i < value.length; i += 1) {
      if (value[i] === '(') depth += 1;
      else if (value[i] === ')') {
        depth -= 1;
        if (depth === 0) {
          end = i;
          break;
        }
      }
    }
    if (end === -1) break;
    out.push(value.slice(index + 5, end));
    index = value.indexOf('blur(', end);
  }
  return out;
};

/* --------------------------------------------------------------------------
   Collection.
   -------------------------------------------------------------------------- */
/* Splits a comma-separated CSS list, ignoring commas nested in var() or
   calc(). A naive split turns "var(--tm-ease-exit, ease-out)" into two
   entries, the second of which is not a property at all. */
const splitTopLevel = (value) => {
  const out = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth += 1;
    else if (ch === ')') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  out.push(current);
  return out.map((part) => part.trim()).filter(Boolean);
};

const classesIn = (selector) => [
  ...new Set([...selector.matchAll(/\.(tm-[\w-]+)/g)].map((m) => m[1])),
];

const allowlistFor = (id) =>
  ALLOWLIST.filter((entry) => id === entry.id || id.includes(entry.id));

const isAllowed = (id, property, { looping }) => {
  for (const entry of allowlistFor(id)) {
    if (!entry.properties.includes(property)) continue;
    if (looping && !entry.loopExempt) continue;
    if (!entry.reason || !entry.reason.trim()) {
      fail(`Allowlist entry "${entry.id}" has no reason. The reason is the point of the entry.`);
      return true;
    }
    return true;
  }
  return false;
};

const run = async () => {
  const source = await readFile(path.join(rootDir, TARGET), 'utf8');
  const root = parseCss(source);

  const keyframes = new Map(); // name -> { properties:Set, values:[] }
  const animated = []; // { selector, classes, keyframes, looping }
  const transitions = []; // { selector, classes, properties, looping:false }
  const willChange = []; // { selector, properties }
  const blurs = []; // { owner, raw, px }

  walk(root, (node, ancestors) => {
    const insideKeyframes = ancestors.some(
      (a) => a.type === 'atrule' && a.name === 'keyframes'
    );

    if (node.type === 'atrule' && node.name === 'keyframes') {
      const name = node.header.replace(/^@keyframes\s+/, '').trim();
      const entry = keyframes.get(name) ?? { properties: new Set(), owner: name };
      for (const frame of node.children) {
        for (const decl of frame.decls) {
          if (decl.property === 'animation-timing-function') continue;
          entry.properties.add(decl.property);
          for (const raw of extractBlurs(decl.value)) {
            blurs.push({ owner: name, raw, px: resolveLengthPx(raw) });
          }
        }
      }
      keyframes.set(name, entry);
      return;
    }

    if (node.type !== 'rule' || insideKeyframes) return;

    const decls = new Map(node.decls.map((d) => [d.property, d.value]));

    for (const [property, value] of decls) {
      if (property === 'filter' || property === 'backdrop-filter') {
        for (const raw of extractBlurs(value)) {
          blurs.push({ owner: node.header, raw, px: resolveLengthPx(raw) });
        }
      }
    }

    const names = new Set();
    let looping = false;

    const nameDecl = decls.get('animation-name');
    if (nameDecl) {
      for (const part of splitTopLevel(nameDecl.replace(/!important/g, ''))) {
        if (part !== 'none' && !part.startsWith('var(')) names.add(part);
      }
    }

    const shorthand = decls.get('animation');
    if (shorthand) {
      for (const match of shorthand.matchAll(/\b(tm-[\w-]+)\b/g)) names.add(match[1]);
      if (/\binfinite\b/.test(shorthand)) looping = true;
    }

    const count = decls.get('animation-iteration-count');
    if (count && /\binfinite\b/.test(count)) looping = true;

    if (names.size) {
      animated.push({
        selector: node.header,
        classes: classesIn(node.header),
        keyframes: [...names],
        looping,
      });
    }

    const transitionProperty = decls.get('transition-property');
    const transitionShorthand = decls.get('transition');
    const properties = [];
    if (transitionProperty) {
      for (const part of splitTopLevel(transitionProperty)) {
        const trimmed = part.toLowerCase();
        if (trimmed !== 'none') properties.push(trimmed);
      }
    }
    if (transitionShorthand) {
      for (const part of splitTopLevel(transitionShorthand)) {
        const first = part.split(/\s+/)[0]?.toLowerCase();
        if (first && first !== 'none' && !/^\d/.test(first) && !first.startsWith('var('))
          properties.push(first);
      }
    }
    if (properties.length) {
      transitions.push({
        selector: node.header,
        classes: classesIn(node.header),
        properties: [...new Set(properties)],
      });
    }

    const wc = decls.get('will-change');
    if (wc) {
      willChange.push({
        selector: node.header,
        properties: splitTopLevel(wc).map((p) => p.toLowerCase()),
      });
    }
  });

  /* ---------------------------------------------------------------- rule 4 */
  for (const entry of transitions) {
    if (entry.properties.includes('all')) {
      fail(
        `${entry.selector}: transitions "all". Name the properties that change -- ` +
          '"all" makes the browser watch every property and defeats every optimisation.'
      );
    }
  }

  /* ------------------------------------------------------- rules 1 and 2 */
  const records = [];
  const unclassified = new Set();

  const classify = (properties, id) => {
    let tier = 'discrete';
    const offenders = [];
    for (const property of properties) {
      const propertyTier = tierOf(property);
      if (!propertyTier) {
        unclassified.add(`${property} (in ${id})`);
        continue;
      }
      if (TIER_RANK[propertyTier] > TIER_RANK[tier]) tier = propertyTier;
      if (propertyTier === 'paint' || propertyTier === 'layout') {
        offenders.push({ property, tier: propertyTier });
      }
    }
    return { tier, offenders };
  };

  for (const entry of animated) {
    const properties = new Set();
    for (const name of entry.keyframes) {
      const frame = keyframes.get(name);
      if (!frame) continue; // check.mjs already fails on a missing @keyframes
      for (const property of frame.properties) properties.add(property);
    }

    const id = entry.classes[0] ?? entry.selector;
    const { tier, offenders } = classify(properties, id);

    const record = {
      id,
      selector: entry.selector,
      kind: 'keyframes',
      keyframes: entry.keyframes,
      loops: entry.looping,
      properties: [...properties].sort(),
      tier,
      allowlisted: false,
    };

    for (const { property, tier: propertyTier } of offenders) {
      const matchIds = [...entry.classes, ...entry.keyframes, entry.selector];
      const allowed = matchIds.some((candidate) =>
        isAllowed(candidate, property, { looping: entry.looping })
      );
      if (allowed) {
        record.allowlisted = true;
        continue;
      }
      if (entry.looping) {
        fail(
          `${entry.selector}: loops forever and animates ${property} (${propertyTier} tier). ` +
            'A loop that leaves the compositor is main-thread work for as long as the page is ' +
            'open. Move the effect to a transform or an opacity on a pseudo-element, or add an ' +
            'allowlist entry in scripts/check-render-cost.mjs that names the reason.'
        );
      } else {
        fail(
          `${entry.selector}: animates ${property} (${propertyTier} tier) with no allowlist ` +
            'entry. One-shot paint and layout work is allowed, but it has to be a decision: ' +
            'add an entry in scripts/check-render-cost.mjs naming the reason.'
        );
      }
    }

    records.push(record);
  }

  for (const entry of transitions) {
    const id = entry.classes[0] ?? entry.selector;
    const { tier, offenders } = classify(entry.properties, id);
    const record = {
      id,
      selector: entry.selector,
      kind: 'transition',
      keyframes: [],
      loops: false,
      properties: [...entry.properties].sort(),
      tier,
      allowlisted: false,
    };

    for (const { property, tier: propertyTier } of offenders) {
      const matchIds = [...entry.classes, entry.selector];
      if (matchIds.some((candidate) => isAllowed(candidate, property, { looping: false }))) {
        record.allowlisted = true;
        continue;
      }
      fail(
        `${entry.selector}: transitions ${property} (${propertyTier} tier) with no allowlist ` +
          'entry. Add one in scripts/check-render-cost.mjs naming the reason.'
      );
    }

    records.push(record);
  }

  if (unclassified.size) {
    fail(
      'Properties with no render tier. Classify each one in scripts/check-render-cost.mjs ' +
        'so its cost is a decision rather than an oversight:\n    ' +
        [...unclassified].sort().join('\n    ')
    );
  }

  /* ---------------------------------------------------------------- rule 3 */
  const seenBlur = new Set();
  for (const blur of blurs) {
    if (blur.px === null) continue; // dynamic; reported in the JSON
    if (blur.px <= BLUR_CAP_PX) continue;
    const exception = BLUR_EXCEPTIONS.find((entry) => blur.owner.includes(entry.id));
    const key = `${blur.owner}|${blur.raw}`;
    if (seenBlur.has(key)) continue;
    seenBlur.add(key);
    if (exception) {
      if (blur.px > exception.px) {
        fail(
          `${blur.owner}: blur(${blur.raw}) resolves to ${blur.px}px, above the ${exception.px}px ` +
            `its exception allows.`
        );
      }
      continue;
    }
    fail(
      `${blur.owner}: blur(${blur.raw}) resolves to ${blur.px}px, above the ${BLUR_CAP_PX}px cap. ` +
        'A rasterized blur is the most expensive part of an animation and Safari pays for it ' +
        'even on elements that are not visible yet. Lower it, or add a BLUR_EXCEPTIONS entry ' +
        'and update docs/reference/browser-support.mdx.'
    );
  }

  /* ---------------------------------------------------------------- rule 5 */
  for (const entry of willChange) {
    for (const property of entry.properties) {
      const tier = tierOf(property);
      if (tier === 'compositor' || tier === 'filter') continue;
      fail(
        `${entry.selector}: will-change: ${property}. The browser cannot composite that ` +
          'property, so the hint only costs a layer. Name only transform, opacity or filter.'
      );
    }
  }

  /* ---------------------------------------------------------------- rule 6 */
  let transformSafe = 0;
  let transformSafeTotal = 0;
  for (const [name, frame] of keyframes) {
    const individual = ['translate', 'scale', 'rotate'].some((p) => frame.properties.has(p));
    if (individual && !frame.properties.has('transform')) transformSafeTotal += 1;
  }
  for (const name of TRANSFORM_SAFE_KEYFRAMES) {
    const frame = keyframes.get(name);
    if (!frame) {
      fail(
        `@keyframes ${name} is listed as transform-safe but is not in ${TARGET}. ` +
          'Remove it from TRANSFORM_SAFE_KEYFRAMES or restore the keyframe.'
      );
      continue;
    }
    if (frame.properties.has('transform')) {
      fail(
        `@keyframes ${name}: uses the transform shorthand. Every entrance, exit, presence and ` +
          'scroll keyframe uses the individual translate / scale / rotate properties so a ' +
          'Tailwind rotate-3 on the same element survives the animation.'
      );
      continue;
    }
    transformSafe += 1;
  }

  /* ------------------------------------------------------- documented counts */
  /* transform-safety.mdx is built around three counts. A number in prose that
     nothing recounts is the same problem as a stale bundle size. */
  const shorthandTotal = [...keyframes.values()].filter((f) =>
    f.properties.has('transform')
  ).length;
  const staticTotal = keyframes.size - transformSafeTotal - shorthandTotal;

  const transformDoc = await readFile(
    path.join(rootDir, 'docs/concepts/transform-safety.mdx'),
    'utf8'
  );
  const documented = [
    ['keyframes in total', keyframes.size, /ships (\d+) keyframes/],
    ['keyframes with no transform', staticTotal, /(\d+) of them touch only opacity/],
    ['keyframes that move an element', transformSafeTotal + shorthandTotal, /Of the (\d+) that move an/],
    ['keyframes using individual properties', transformSafeTotal, /\*\*(\d+) now animate the individual properties\*\*/],
    ['keyframes keeping the transform shorthand', shorthandTotal, /## The (\d+) that did not move/],
  ];
  for (const [label, actual, pattern] of documented) {
    const match = transformDoc.match(pattern);
    if (!match) {
      fail(
        `docs/concepts/transform-safety.mdx: could not find the sentence stating ${label}. ` +
          'Update the pattern in scripts/check-render-cost.mjs if the wording changed.'
      );
      continue;
    }
    if (Number(match[1]) !== actual) {
      fail(
        `docs/concepts/transform-safety.mdx: says ${match[1]} ${label}, the stylesheet has ${actual}.`
      );
    }
  }

  /* render-cost.mdx states two counts in prose and lists every class that
     leaves the compositor. All three have to come from the same analysis. */
  const offCompositor = records.filter(
    (r) => r.id.startsWith('tm-') && r.tier !== 'compositor' && r.tier !== 'discrete'
  );
  const offIds = [...new Set(offCompositor.map((r) => r.id))];
  const loopingOffIds = [...new Set(offCompositor.filter((r) => r.loops).map((r) => r.id))];

  let costDoc = '';
  try {
    costDoc = await readFile(path.join(rootDir, 'docs/reference/render-cost.mdx'), 'utf8');
  } catch {
    costDoc = '';
  }
  if (costDoc) {
    const stated = costDoc.match(/^(\d+) of them\./m);
    if (!stated) {
      fail('docs/reference/render-cost.mdx: could not find the "N of them." count.');
    } else if (Number(stated[1]) !== offIds.length) {
      fail(
        `docs/reference/render-cost.mdx: says ${stated[1]} classes leave the compositor, ` +
          `the stylesheet has ${offIds.length}. Regenerate the listing.`
      );
    }
    const statedLoops = costDoc.match(/The (\d+) marked \*\*\(loops\)\*\*/);
    if (!statedLoops) {
      fail('docs/reference/render-cost.mdx: could not find the "(loops)" count.');
    } else if (Number(statedLoops[1]) !== loopingOffIds.length) {
      fail(
        `docs/reference/render-cost.mdx: says ${statedLoops[1]} of them loop, the stylesheet ` +
          `has ${loopingOffIds.length}.`
      );
    }
    /* Scoped to the listing section, not the whole page: most of these classes
       are also discussed in the prose above, so an unscoped search would pass
       while the table itself was missing a row. */
    const section = costDoc.split('## Every class that leaves the compositor')[1] ?? '';
    const listing = section.split('\n## ')[0];
    for (const id of offIds) {
      if (!listing.includes(`\`${id}\``)) {
        fail(
          `docs/reference/render-cost.mdx: ${id} leaves the compositor but is missing from the ` +
            'listing table. Every class that pays a per-frame cost has to be in it.'
        );
      }
    }
  }

  /* ------------------------------------------------------------------ output */
  const loops = records.filter((r) => r.loops);
  const compositorLoops = loops.filter((r) => r.tier === 'compositor' || r.tier === 'discrete');
  const byTier = {};
  for (const record of records) byTier[record.tier] = (byTier[record.tier] ?? 0) + 1;

  const summary = {
    animatedRules: records.length,
    loops: loops.length,
    compositorOnlyLoops: compositorLoops.length,
    allowlistedLoops: loops.length - compositorLoops.length,
    transformSafeKeyframes: transformSafe,
    transformSafeKeyframesTotal: transformSafeTotal,
    keyframes: keyframes.size,
    byTier,
  };

  const json = {
    source: TARGET,
    blurCapPx: BLUR_CAP_PX,
    summary,
    classes: records.sort((a, b) => a.id.localeCompare(b.id) || a.selector.localeCompare(b.selector)),
    dynamicBlurs: blurs
      .filter((b) => b.px === null)
      .map((b) => ({ owner: b.owner, value: b.raw })),
    allowlist: ALLOWLIST,
    blurExceptions: BLUR_EXCEPTIONS,
  };

  await mkdir(path.join(rootDir, 'dist'), { recursive: true });
  await writeFile(
    path.join(rootDir, 'dist', 'render-cost.json'),
    `${JSON.stringify(json, null, 2)}\n`,
    'utf8'
  );

  /* The demo labels each class with where it does its work. Generated rather
     than typed, so a class that changes tier cannot keep an old badge: the
     explorer, this check and the docs all read the same analysis. Skipped when
     running against a mutated copy of the output. */
  const demoTiers = {};
  for (const record of records) {
    if (!record.id.startsWith('tm-')) continue;
    const existing = demoTiers[record.id];
    /* One class can own several rules -- an element and its pseudo-element.
       Report the most expensive of them. */
    if (!existing || TIER_RANK[record.tier] > TIER_RANK[existing.tier]) {
      demoTiers[record.id] = { tier: record.tier, loops: record.loops };
    } else if (record.loops) {
      existing.loops = true;
    }
  }
  try {
    await writeFile(
      path.join(rootDir, 'demo', 'src', 'render-cost.js'),
      '/* Generated by scripts/check-render-cost.mjs. Do not edit by hand.\n' +
        '   Where each class does its per-frame work: compositor, filter, paint or\n' +
        '   layout. See docs/reference/render-cost.mdx. */\n' +
        `export const renderCost = ${JSON.stringify(demoTiers, null, 2)};\n`,
      'utf8'
    );
  } catch {
    /* No demo directory (a negative-test root). Not a failure. */
  }

  console.log('render cost');
  console.log(`  animated rules              ${String(summary.animatedRules).padStart(4)}`);
  console.log(`  keyframes                   ${String(summary.keyframes).padStart(4)}`);
  console.log(
    `  loops                       ${String(summary.loops).padStart(4)}  ` +
      `(${summary.compositorOnlyLoops} compositor-only, ${summary.allowlistedLoops} allowlisted)`
  );
  console.log(
    `  transform-safe keyframes    ${String(summary.transformSafeKeyframes).padStart(4)}  ` +
      `(promised) · ${summary.transformSafeKeyframesTotal} in the bundle`
  );
  for (const [tier, count] of Object.entries(byTier).sort()) {
    console.log(`  ${tier.padEnd(28)}${String(count).padStart(4)}`);
  }

  if (failures.length) {
    console.error(`\n${failures.length} render cost check(s) failed:\n`);
    for (const message of failures) console.error(`  - ${message}`);
    process.exitCode = 1;
    return;
  }
  console.log('\nRender cost check passed.');
};

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
