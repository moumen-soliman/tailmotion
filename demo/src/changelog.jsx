import React from 'react';
import ReactDOM from 'react-dom/client';
import { Nav } from './sections/Nav';
import { SiteFooter } from './sections/SiteFooter';
import { ChangelogPage } from './sections/ChangelogPage';

// TailMotion's own CSS, so the page's press feedback comes from the library.
import 'tailmotion/css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-page pb-14 sm:pb-16 lg:pb-20">
      <Nav current="changelog" />
      <ChangelogPage />
      <SiteFooter />
    </div>
  </React.StrictMode>
);
