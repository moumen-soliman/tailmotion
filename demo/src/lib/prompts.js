export const AI_INSTALL_PROMPT = `Add TailMotion to this project safely and verify the result.

Before editing anything:
1. Inspect the repository and identify:
   - The framework: React, Next.js, Vue, Nuxt, Svelte, SvelteKit, Astro, Vite, static HTML, React Native/Expo, or another setup.
   - The package manager from the lockfile.
   - Whether Tailwind CSS is installed and whether it is v3 or v4.
   - The global CSS entry file.
   - The Tailwind config format, if one exists: JavaScript, TypeScript, CommonJS, or ESM.
2. Preserve the project's existing conventions and dependencies. Do not replace its Tailwind config or global styles.

Compatibility check:
- TailMotion is a CSS motion utility for web DOM elements.
- For React Native or Expo native-only projects, do not install it or claim native support: CSS keyframes and DOM class selectors do not run on native views, including projects that only use NativeWind.
- Continue for React Native only when the project has a React Native Web or other browser target that loads normal CSS. Configure TailMotion only for that web target.

Install:
- Add the latest \`tailmotion\` package with the detected package manager.
- Do not install a JavaScript animation runtime.

Configure Tailwind and CSS:
- Tailwind CSS v4:
  Add these to the project's global CSS entry, preserving its existing imports:

  @import "tailwindcss";
  @import "tailmotion/css";

  No JavaScript Tailwind config is required for TailMotion's prebuilt classes. If the project needs TailMotion's configurable duration, delay, easing, repeat, stagger, or distance token utilities, also add:

  @plugin "tailmotion/plugin";

- Tailwind CSS v3:
  Add the TailMotion plugin without removing existing plugins.

  CommonJS:
  plugins: [require("tailmotion/plugin")]

  ESM/TypeScript:
  import tailmotion from "tailmotion/plugin";
  plugins: [tailmotion]

  Also load the stylesheet from the project's global CSS:

  @import "tailmotion/css";

- No Tailwind:
  Import \`tailmotion/css\` from the application's global JavaScript/CSS entry or link the built stylesheet in the HTML.

Framework integration:
- React, Next.js, and React Native Web: use \`className\`.
- Vue, Nuxt, Svelte, SvelteKit, Astro, and HTML: use \`class\`.
- Put the global stylesheet import in the framework's correct global entry, not inside every component.
- For SSR frameworks, keep the CSS import in an allowed root layout, app entry, or configured global stylesheet.

Add one small example in an existing suitable component:

React/Next.js:
<button className="tm-press motion-safe:tm-fade-in">Save changes</button>

Vue/Nuxt/Svelte/Astro/HTML:
<button class="tm-press motion-safe:tm-fade-in">Save changes</button>

Use Tailwind for layout, color, spacing, and typography; use TailMotion only for movement. Do not invent TailMotion classes. The bundled stylesheet includes only a curated set of prebuilt Tailwind state and responsive variants.

Finally:
- Run the project's relevant build, typecheck, or tests.
- Fix any integration errors you introduced.
- Summarize the detected stack, commands run, files changed, and the TailMotion classes added.`;
