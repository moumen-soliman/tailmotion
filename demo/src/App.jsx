import { useEffect, useState } from 'react';
import { Nav } from './sections/Nav';
import { Hero } from './sections/Hero';
import { Composability } from './sections/Composability';
import { ViewMorph } from './sections/ViewMorph';
import { UseCases } from './sections/UseCases';
import { Explorer } from './sections/Explorer';
import { Installation } from './sections/Installation';
import { Accessibility, FinalCta } from './sections/Accessibility';
import { SiteFooter } from './sections/SiteFooter';
import { detectVariants } from './lib/variants';

const EMPTY_VARIANTS = {
  hover: new Set(),
  active: new Set(),
  focus: new Set(),
  'focus-visible': new Set(),
  'focus-within': new Set(),
  'group-hover': new Set(),
  'motion-safe': new Set(),
  breakpoints: new Set(),
};

export default function App() {
  // Read the shipped variant selectors once the stylesheet is in the document,
  // so the page only ever offers a trigger that actually exists.
  const [variants, setVariants] = useState(EMPTY_VARIANTS);

  useEffect(() => {
    setVariants(detectVariants());
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-shell border-x border-line bg-page">
      <Nav />
      <main>
        <Hero variants={variants} />
        <Composability />
        <ViewMorph />
        <UseCases />
        <Explorer variants={variants} />
        <Installation variants={variants} />
        <Accessibility />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  );
}
