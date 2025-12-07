import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import TailMotion CSS from the package
import 'tailmotion/css';

const GA_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;

function initGtag(gaId) {
  if (!gaId) return;
  const existing = document.getElementById('ga-tag');
  if (existing) return;

  // Load the gtag script
  const script = document.createElement('script');
  script.id = 'ga-tag';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  // Initialize dataLayer and gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(){window.dataLayer.push(arguments);} // eslint-disable-line no-inner-declarations
  gtag('js', new Date());
  gtag('config', gaId);
}

initGtag(GA_ID);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
