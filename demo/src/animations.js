/* --------------------------------------------------------------------------
   The catalogue behind the explorer.

   Fields, and what they are allowed to claim:

   group     'keyframes' | 'transitions' | 'recipes' -- how the class works.
   category  Filter bucket shown in the UI.
   requires  'css'    the class alone is enough
             'markup' the class needs a specific child structure
             'js'     the effect does not run without JavaScript
   popular   Hand-picked shortlist, not a usage measurement.
   alias     True when the class is a compatibility name for another class.
   preview   Key for a custom preview renderer; omitted means the default box.
   markup    Copyable snippet. Omitted means `<div class="tm-NAME">` is enough.
   -------------------------------------------------------------------------- */

const entry = (name, group, category, extra = {}) => ({
  name,
  group,
  category,
  requires: 'css',
  popular: false,
  alias: false,
  ...extra,
});

export const catalog = [
  // ---------------------------------------------------------------- entrance
  entry('fade-in', 'keyframes', 'entrance', {
    popular: true,
    description: 'Opacity only. Compose it with a Tailwind transform for anything else.',
  }),
  entry('scale-in', 'keyframes', 'entrance', {
    popular: true,
    description: 'Scale up from --tm-scale-from with a fade. No overshoot.',
  }),
  entry('pop', 'keyframes', 'entrance', {
    popular: true,
    description: 'Scale up past 1 and settle back.',
  }),
  entry('blur-in', 'keyframes', 'entrance', {
    popular: true,
    description: 'Resolves from blurred to sharp.',
  }),
  entry('slide-block-start', 'keyframes', 'entrance', {
    popular: true,
    description: 'Travels toward the block-start edge, so it enters from below.',
  }),
  entry('slide-block-end', 'keyframes', 'entrance', {
    description: 'Travels toward the block-end edge, so it enters from above.',
  }),
  entry('slide-inline-start', 'keyframes', 'entrance', {
    popular: true,
    description: 'Travels toward the inline-start edge. Mirrors itself in RTL.',
  }),
  entry('slide-inline-end', 'keyframes', 'entrance', {
    description: 'Travels toward the inline-end edge. Mirrors itself in RTL.',
  }),
  entry('slide-up', 'keyframes', 'entrance', { alias: true, description: 'Alias of tm-slide-block-start.' }),
  entry('slide-down', 'keyframes', 'entrance', { alias: true, description: 'Alias of tm-slide-block-end.' }),
  entry('slide-left', 'keyframes', 'entrance', { alias: true, description: 'Alias of tm-slide-inline-start.' }),
  entry('slide-right', 'keyframes', 'entrance', { alias: true, description: 'Alias of tm-slide-inline-end.' }),
  entry('rotate-in', 'keyframes', 'entrance', { description: 'Rotates and scales into place.' }),
  entry('drop-in', 'keyframes', 'entrance', { description: 'Drops from above and squashes on landing.' }),
  entry('drop', 'keyframes', 'entrance', { alias: true, description: 'Alias of tm-drop-in.' }),
  entry('zoom-in', 'keyframes', 'entrance', { description: 'Zooms in with a small overshoot.' }),
  entry('zoom-in-slow', 'keyframes', 'entrance', { description: 'The same, at a slower default.' }),
  entry('zoom-out', 'keyframes', 'entrance', {
    description: 'Settles in from a larger scale. An entrance, despite the name.',
  }),
  entry('elastic', 'keyframes', 'entrance', { description: 'Squash-and-stretch arrival.' }),
  entry('swing-in', 'keyframes', 'entrance', { description: 'Swings down from the top edge.' }),
  entry('swing-in-left', 'keyframes', 'entrance', { description: 'Swings in from the start edge.' }),
  entry('swing-in-right', 'keyframes', 'entrance', { description: 'Swings in from the end edge.' }),
  entry('reveal', 'keyframes', 'entrance', { description: 'Clip-path wipe from the bottom up.' }),
  entry('unfold', 'keyframes', 'entrance', { description: 'Unfolds downward from its top edge.' }),
  entry('glide', 'keyframes', 'entrance', { description: 'Long, smooth slide from the left.' }),
  entry('glide-right', 'keyframes', 'entrance', { description: 'Long, smooth slide from the right.' }),
  entry('scale-fade', 'keyframes', 'entrance', { description: 'Restrained scale with a fade. Good for cards.' }),
  entry('rise', 'keyframes', 'entrance', { description: 'Rises with a hint of rotation.' }),
  entry('fill-up', 'keyframes', 'entrance', { description: 'Fills in from the bottom edge.' }),
  entry('burst', 'keyframes', 'entrance', { description: 'Expands outward and settles. Reads as success.' }),

  // -------------------------------------------------------------------- exit
  entry('fade-out', 'keyframes', 'exit', { popular: true, description: 'Opacity only.' }),
  entry('scale-out', 'keyframes', 'exit', { popular: true, description: 'Shrinks to --tm-exit-scale with a fade.' }),
  entry('slide-block-out', 'keyframes', 'exit', { description: 'Leaves toward the block-start edge.' }),
  entry('slide-inline-out', 'keyframes', 'exit', { description: 'Leaves toward the inline-end edge. Mirrors in RTL.' }),
  entry('blur-out', 'keyframes', 'exit', { description: 'Dissolves out of focus.' }),
  entry('swing-out', 'keyframes', 'exit', { description: 'Swings up and out through the top edge.' }),
  entry('swing-out-left', 'keyframes', 'exit', { description: 'Swings out toward the start edge.' }),
  entry('swing-out-right', 'keyframes', 'exit', { description: 'Swings out toward the end edge.' }),

  // ------------------------------------------------------------------ looping
  entry('spin', 'keyframes', 'loop', { popular: true, description: 'Continuous rotation. The loading default.' }),
  entry('pulse', 'keyframes', 'loop', { popular: true, description: 'Breathing scale and opacity.' }),
  entry('shimmer', 'keyframes', 'loop', {
    popular: true,
    description: 'Sweeping highlight for skeletons. Colour comes from currentColor.',
    preview: 'shimmer',
  }),
  entry('sparkle', 'keyframes', 'loop', { popular: true, description: 'Twinkling scale and rotation.' }),
  entry('glow', 'keyframes', 'loop', {
    popular: true,
    description: 'Pulsing halo, tinted by --tm-glow-color.',
    preview: 'glow',
  }),
  entry('float', 'keyframes', 'loop', { description: 'Gentle vertical drift.' }),
  entry('drift', 'keyframes', 'loop', { description: 'Ambient horizontal drift.' }),
  entry('sway', 'keyframes', 'loop', { description: 'Pendulum sway from the top edge.' }),
  entry('bounce', 'keyframes', 'loop', { description: 'Repeating vertical bounce.' }),
  entry('morph', 'keyframes', 'loop', { description: 'Slow breathing distortion.' }),
  entry('ripple', 'keyframes', 'loop', {
    description: 'Expanding ring, tinted by --tm-outline-color.',
    preview: 'glow',
  }),

  // ---------------------------------------------------------------- attention
  entry('shake', 'keyframes', 'attention', { popular: true, description: 'Sharp horizontal shake. Reads as error.' }),
  entry('wiggle', 'keyframes', 'attention', { popular: true, description: 'Quick, softer wiggle.' }),
  entry('confetti', 'keyframes', 'attention', { description: 'Falls and tumbles. Position the particles yourself.' }),
  entry('flip-x', 'keyframes', 'attention', { description: '3D flip around the X axis.' }),
  entry('flip-y', 'keyframes', 'attention', { description: '3D flip around the Y axis.' }),

  // --------------------------------------------------------------- background
  entry('wavy-bg', 'keyframes', 'background', {
    description: 'Drifting gradient field. Set --tm-wavy-color1..3 to theme it.',
    preview: 'surface',
  }),
  entry('wavy-bg-subtle', 'keyframes', 'background', {
    description: 'The same field at lower contrast.',
    preview: 'surface',
  }),
  entry('dark-veil', 'keyframes', 'background', {
    description: 'Layered hue-rotating veil. Driven by --tm-dark-veil-hue.',
    preview: 'surface',
  }),

  // -------------------------------------------------------------- interaction
  entry('press', 'transitions', 'interaction', {
    popular: true,
    description: 'Scales to 0.96 while pressed. Skips :disabled and [aria-disabled].',
    preview: 'press',
    markup: '<button class="tm-press">Save</button>',
  }),
  entry('hover-lift', 'transitions', 'interaction', {
    popular: true,
    description: 'Rises with a shadow on hover or keyboard focus.',
    preview: 'card',
  }),
  entry('hover-scale', 'transitions', 'interaction', {
    description: 'Grows to --tm-hover-scale on hover or keyboard focus.',
    preview: 'card',
  }),
  entry('icon-swap', 'transitions', 'interaction', {
    popular: true,
    requires: 'markup',
    description: 'Cross-fades two children, driven by aria-pressed and friends.',
    preview: 'icon-swap',
    markup:
      '<button class="tm-icon-swap" aria-pressed="false">\n' +
      '  <svg><!-- shown while aria-pressed is false --></svg>\n' +
      '  <svg><!-- shown while aria-pressed is true --></svg>\n' +
      '</button>',
  }),
  entry('rotate-hover', 'transitions', 'interaction', {
    description: 'Tilts by --tm-rotate on hover or keyboard focus.',
    preview: 'card',
  }),
  entry('rotate-press', 'transitions', 'interaction', {
    description: 'Scales and tilts while pressed.',
    preview: 'press',
    markup: '<button class="tm-rotate-press">Press</button>',
  }),
  entry('lift-hover', 'transitions', 'interaction', {
    alias: true,
    description: 'Alias of tm-hover-lift.',
    preview: 'card',
  }),
  entry('shimmer-hover', 'keyframes', 'interaction', {
    popular: true,
    replay: false,
    description: 'One sheen sweep per hover. A keyframe, so it restarts rather than reversing.',
    preview: 'shimmer-hover',
  }),
  entry('liquid-btn', 'transitions', 'interaction', {
    description: 'Fills from the bottom on hover. --tm-liquid-btn-* change the origin.',
    preview: 'liquid',
    markup: '<button class="tm-liquid-btn">Hover me</button>',
  }),
  entry('liquid-wave', 'transitions', 'interaction', {
    description: 'Wave-shaped fill on hover.',
    preview: 'liquid',
    markup: '<button class="tm-liquid-wave">Hover me</button>',
  }),
  entry('liquid-underline', 'transitions', 'interaction', {
    description: 'Underline that grows on hover.',
    preview: 'liquid',
    markup: '<button class="tm-liquid-underline">Hover me</button>',
  }),
  entry('hold-delete', 'transitions', 'interaction', {
    description: 'Press-and-hold confirmation. Colours come from --tm-hold-*.',
    preview: 'hold-delete',
    markup: '<button class="tm-hold-delete">Hold to delete</button>',
  }),

  // ------------------------------------------------------------------ recipes
  entry('stagger', 'recipes', 'choreography', {
    popular: true,
    requires: 'markup',
    description: 'Children enter --tm-stagger-step apart, for up to 20 children.',
    preview: 'stagger',
    markup: '<ul class="tm-stagger">\n  <li>One</li>\n  <li>Two</li>\n  <li>Three</li>\n</ul>',
  }),
  entry('view-morph', 'recipes', 'component', {
    popular: true,
    requires: 'markup',
    description: 'Cross-fades mounted views while the container transitions to new dimensions.',
    preview: 'view-morph',
    markup:
      '<div class="tm-view-morph rounded-full bg-black"\n' +
      '  style="--tm-view-stage-width: 228px; --tm-view-stage-height: 56px; --tm-view-width: 228px; --tm-view-height: 56px">\n' +
      '  <div data-tm-panel aria-hidden="true">Idle</div>\n' +
      '  <div data-tm-panel data-tm-active>Call</div>\n' +
      '</div>',
  }),
  entry('count-reveal', 'recipes', 'text', {
    requires: 'markup',
    description: 'Slot-machine digits. Each character needs its own span.',
    preview: 'count-reveal',
    markup:
      '<div class="tm-count-reveal">\n' +
      '  <span>1</span><span>2</span><span>,</span><span>3</span><span>4</span><span>5</span>\n' +
      '</div>',
  }),
  entry('slide-digit', 'recipes', 'text', {
    description: 'A single digit sliding into place.',
    markup: '<span class="tm-slide-digit">7</span>',
  }),
  entry('text-flip', 'recipes', 'text', {
    requires: 'js',
    description: 'Rotating words with a flip. Needs initTextFlipElement to swap the text.',
    preview: 'text-flip',
    markup:
      '<span id="headline" class="tm-text-flip"></span>\n\n' +
      "import { initTextFlipElement } from 'tailmotion/utils';\n" +
      "initTextFlipElement(document.getElementById('headline'), {\n" +
      "  words: ['beautiful', 'amazing', 'powerful'],\n" +
      "  variant: 'flip',\n" +
      '});',
  }),
  entry('text-morph', 'recipes', 'text', {
    requires: 'js',
    description: 'Rotating words with a blur morph. Needs the same JS helper.',
    preview: 'text-flip',
    markup:
      '<span id="headline" class="tm-text-morph"></span>\n\n' +
      "import { initTextFlipElement } from 'tailmotion/utils';\n" +
      "initTextFlipElement(document.getElementById('headline'), {\n" +
      "  words: ['developers', 'designers', 'creators'],\n" +
      "  variant: 'morph',\n" +
      '});',
  }),
  entry('text-rotate', 'recipes', 'text', {
    requires: 'js',
    description: 'Rotating words on the horizontal axis. Needs the same JS helper.',
    preview: 'text-flip',
    markup: "<span id=\"headline\" class=\"tm-text-rotate\"></span>\n\n// See tm-text-flip for the JS.",
  }),
  entry('flip-hover', 'keyframes', 'interaction', {
    replay: false,
    description:
      'Rotates the element 180 degrees on hover. Add tm-flip-front and tm-flip-back for a ' +
      'two-sided card, or use it bare for a single face.',
    preview: 'flip',
    markup:
      '<div class="tm-flip-hover tm-3d">\n' +
      '  <div class="tm-flip-front">Front</div>\n' +
      '  <div class="tm-flip-back">Back</div>\n' +
      '</div>',
  }),
  entry('flip-btn', 'recipes', 'interaction', {
    requires: 'markup',
    description: 'Button whose label flips on hover. -top/-bottom/-left/-right set the axis.',
    preview: 'flip',
    markup:
      '<button class="tm-flip-btn">\n' +
      '  <span class="tm-flip-front">Download</span>\n' +
      '  <span class="tm-flip-back">Let\'s go</span>\n' +
      '</button>',
  }),
  entry('avatar-group', 'recipes', 'component', {
    requires: 'markup',
    description: 'Overlapping avatars that spread on hover. Tooltip colours are yours to set.',
    preview: 'avatar-group',
    markup:
      '<div class="tm-avatar-group">\n' +
      '  <div class="tm-avatar tm-avatar-ring">A</div>\n' +
      '  <div class="tm-avatar tm-avatar-ring">B</div>\n' +
      '  <div class="tm-avatar">+3</div>\n' +
      '</div>',
  }),
];

/**
 * Classes that animate as soon as they are applied, so a replay button has
 * something to replay. Hover-triggered keyframes are excluded.
 */
export const REPLAYABLE = new Set(
  catalog
    .filter((a) => a.replay !== false && (a.group === 'keyframes' || ['stagger', 'count-reveal', 'slide-digit'].includes(a.name)))
    .map((a) => a.name)
);

export const CATEGORIES = [
  { id: 'popular', label: 'Popular' },
  { id: 'entrance', label: 'Entrance' },
  { id: 'exit', label: 'Exit' },
  { id: 'loop', label: 'Looping' },
  { id: 'attention', label: 'Attention' },
  { id: 'interaction', label: 'Interaction' },
  { id: 'text', label: 'Text' },
  { id: 'background', label: 'Background' },
  { id: 'choreography', label: 'Choreography' },
  { id: 'component', label: 'Component' },
];

export const GROUPS = [
  {
    id: 'keyframes',
    label: 'Keyframes',
    hint: 'One-shot and looping animations. Replayable.',
  },
  {
    id: 'transitions',
    label: 'Transitions',
    hint: 'Hover, press and toggle states. Interruptible.',
  },
  {
    id: 'recipes',
    label: 'Recipes',
    hint: 'Need a particular markup structure, and sometimes JavaScript.',
  },
];

/** Kept for compatibility with anything still importing the old shape. */
export const animations = catalog;
