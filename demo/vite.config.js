import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const demoDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(demoDir, '..');

export default defineConfig({
  plugins: [react()],
  build: {
    // Static pages are separate entries so every route can be deployed directly.
    rollupOptions: {
      input: {
        main: path.join(demoDir, 'index.html'),
        changelog: path.join(demoDir, 'changelog', 'index.html'),
        example: path.join(demoDir, 'example', 'index.html'),
      },
    },
  },
  resolve: {
    // Point the demo at the local build so the page always shows this
    // checkout's CSS, with no publish or reinstall step in between.
    alias: [
      { find: /^tailmotion\/css$/, replacement: path.join(packageRoot, 'tailmotion.css') },
      { find: /^tailmotion\/utils$/, replacement: path.join(packageRoot, 'src', 'utils.js') },
      { find: /^tailmotion$/, replacement: path.join(packageRoot, 'src', 'index.js') },
    ],
  },
  server: {
    port: 5173,
  },
});
