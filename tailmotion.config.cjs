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

