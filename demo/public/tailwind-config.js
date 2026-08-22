/* ------------------------------------------------------------------
   Design tokens, shared by every page on the site.

   Colours are OKLCH so the greys step evenly in perceived lightness and
   the accent keeps one hue at every lightness. Each is written with
   Tailwind's <alpha-value> placeholder, so `bg-card/60` still works.
   Measured against the page (oklch(0 0 0)):

     ink         16.9:1     accent        7.3:1
     ink-muted    7.7:1     ink-faint     4.6:1

   Two roles carry meaning and nothing else does:
     ink-strong (white)  the primary action, and the selected state
     accent (blue)       links, focus rings, section eyebrows
   ------------------------------------------------------------------ */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        page: 'oklch(0 0 0 / <alpha-value>)',
        card: {
          DEFAULT: 'oklch(0.1448 0 0 / <alpha-value>)',
          hover: 'oklch(0.1913 0 0 / <alpha-value>)',
        },
        line: {
          DEFAULT: 'oklch(0.2405 0.0057 286 / <alpha-value>)',
          strong: 'oklch(0.3032 0.0089 286 / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'oklch(0.9461 0 0 / <alpha-value>)',
          strong: 'oklch(1 0 0 / <alpha-value>)',
          muted: 'oklch(0.7105 0.0072 286 / <alpha-value>)',
          faint: 'oklch(0.5815 0.0091 286 / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'oklch(0.6973 0.1597 258 / <alpha-value>)',
          soft: 'oklch(0.7776 0.1135 259 / <alpha-value>)',
        },
      },
      /* A role-based scale: one decision per role, size and spacing
         together. Headings tighten as they grow; the uppercase mono
         overline opens up. */
      fontSize: {
        display: ['2.625rem', { lineHeight: '1.06', letterSpacing: '-0.035em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.02', letterSpacing: '-0.04em' }],
        title: ['1.5rem', { lineHeight: '1.2', letterSpacing: '-0.022em' }],
        'title-lg': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.028em' }],
        heading: ['1rem', { lineHeight: '1.4', letterSpacing: '-0.011em' }],
        'body-lg': ['1.0625rem', { lineHeight: '1.55', letterSpacing: '-0.008em' }],
        body: ['0.9375rem', { lineHeight: '1.6' }],
        label: ['0.8125rem', { lineHeight: '1.45' }],
        micro: ['0.75rem', { lineHeight: '1.5' }],
        overline: ['0.6875rem', { lineHeight: '1.4', letterSpacing: '0.09em' }],
      },
      maxWidth: {
        shell: '1200px',
        measure: '62ch',
      },
    },
  },
};
