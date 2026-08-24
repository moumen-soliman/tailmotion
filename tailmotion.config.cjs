const plugin = require('tailwindcss/plugin');

const DEFAULT_TOKENS = {
  durations: {
    150: '150ms',
    200: '200ms',
    300: '300ms',
    400: '400ms',
    500: '500ms',
    700: '700ms',
    900: '900ms',
    1000: '1000ms',
    1200: '1200ms',
    1400: '1400ms',
    1600: '1600ms',
    2000: '2000ms',
    3000: '3000ms',
  },
  delays: {
    0: '0ms',
    75: '75ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    400: '400ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',
    out: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    'in-out': 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    soft: 'cubic-bezier(0.4, 0, 0.2, 1)',
    snappy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bouncy: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  repeat: {
    1: '1',
    2: '2',
    3: '3',
    infinite: 'infinite',
  },
  stagger: {
    50: '50ms',
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
  },
  distance: {
    4: '4px',
    8: '8px',
    12: '12px',
    20: '20px',
    30: '30px',
  },
  // Motion-profile factors. These multiply each animation's own tuned default
  // rather than replacing it, so a scope keeps its relative character.
  speed: {
    75: '0.75',
    85: '0.85',
    100: '1',
    110: '1.1',
    125: '1.25',
    150: '1.5',
  },
  emphasis: {
    0: '0',
    50: '0.5',
    75: '0.75',
    100: '1',
    125: '1.25',
    150: '1.5',
  },
  // How long a destructive hold has to be held.
  hold: {
    800: '800ms',
    1200: '1200ms',
    1600: '1600ms',
    2000: '2000ms',
  },
};

const withImportant = (value) =>
  typeof value === 'string' && value.trim().endsWith('!important') ? value : `${value} !important`;

const resolveTokens = (themeTokens = {}, optionTokens = {}) => {
  const merged = {};

  Object.keys(DEFAULT_TOKENS).forEach((key) => {
    merged[key] = {
      ...DEFAULT_TOKENS[key],
      ...(themeTokens[key] || {}),
      ...(optionTokens[key] || {}),
    };
  });

  return merged;
};

module.exports = plugin.withOptions(
  (options = {}) => {
    return ({ matchUtilities, theme }) => {
      const tokens = resolveTokens(theme('tailmotion', {}), options);

      matchUtilities(
        {
          'tm-duration': (value) => ({
            '--tm-duration': withImportant(value),
          }),
        },
        {
          values: tokens.durations,
          supportsNegativeValues: false,
        }
      );

      matchUtilities(
        {
          'tm-delay': (value) => ({
            '--tm-delay': withImportant(value),
          }),
        },
        {
          values: tokens.delays,
          supportsNegativeValues: false,
        }
      );

      matchUtilities(
        {
          'tm-ease': (value) => ({
            '--tm-easing': withImportant(value),
          }),
        },
        {
          values: tokens.easing,
          supportsNegativeValues: false,
        }
      );

      matchUtilities(
        {
          'tm-repeat': (value) => ({
            '--tm-iteration-count': withImportant(value),
          }),
        },
        {
          values: tokens.repeat,
          supportsNegativeValues: false,
        }
      );

      // tm-stagger-step-* is the 0.6 spelling; tm-stagger-* is the shorter one
      // introduced with the choreography module. Same token, same behaviour.
      matchUtilities(
        {
          'tm-stagger-step': (value) => ({
            '--tm-stagger-step': withImportant(value),
          }),
          'tm-stagger': (value) => ({
            '--tm-stagger-step': withImportant(value),
          }),
        },
        {
          values: tokens.stagger,
          supportsNegativeValues: false,
        }
      );

      // Motion-profile factors, for a scope that needs one axis of a
      // personality without taking a whole tm-motion-* profile.
      matchUtilities(
        {
          'tm-speed': (value) => ({
            '--tm-duration-scale': withImportant(value),
          }),
        },
        {
          values: tokens.speed,
          supportsNegativeValues: false,
        }
      );

      // Emphasis moves how far a keyframe departs from rest; overshoot moves
      // only the frames that travel past it. tm-emphasis sets both, which is
      // what a personality wants; tm-overshoot flattens the spring on its own.
      matchUtilities(
        {
          'tm-emphasis': (value) => ({
            '--tm-emphasis': withImportant(value),
            '--tm-overshoot': withImportant(value),
          }),
          'tm-overshoot': (value) => ({
            '--tm-overshoot': withImportant(value),
          }),
        },
        {
          values: tokens.emphasis,
          supportsNegativeValues: false,
        }
      );

      // Hold duration for tm-hold-confirm.
      matchUtilities(
        {
          'tm-hold': (value) => ({
            '--tm-hold-duration': withImportant(value),
          }),
        },
        {
          values: tokens.hold,
          supportsNegativeValues: false,
        }
      );

      // Travel distance for every slide entrance and exit. --tm-exit-distance
      // derives from this, so one utility retunes both.
      matchUtilities(
        {
          'tm-distance': (value) => ({
            '--tm-distance': withImportant(value),
          }),
        },
        {
          values: tokens.distance,
          supportsNegativeValues: false,
        }
      );
    };
  },
  () => ({
    theme: {
      extend: {
        tailmotion: DEFAULT_TOKENS,
      },
    },
  })
);

module.exports.default = module.exports;

