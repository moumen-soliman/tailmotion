import React from 'react';
import ReactDOM from 'react-dom/client';
import { Nav } from './sections/Nav';
import { SiteFooter } from './sections/SiteFooter';
import { Capabilities } from './sections/Capabilities';

import 'tailmotion/css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className="min-h-screen bg-page">
      <Nav current="capabilities" />
      <Capabilities />
      <SiteFooter />
    </div>
  </React.StrictMode>
);
