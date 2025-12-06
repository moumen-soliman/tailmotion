import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const demoDir = path.join(rootDir, 'demo');

const prepare = async () => {
  await mkdir(demoDir, { recursive: true });
  
  // Copy CSS
  const cssSource = path.join(rootDir, 'tailmotion.css');
  const cssTarget = path.join(demoDir, 'tailmotion.css');
  await copyFile(cssSource, cssTarget);
  console.log(`[tailmotion] Copied ${path.relative(rootDir, cssSource)} -> ${path.relative(rootDir, cssTarget)}`);
  
  // Copy JS
  const jsSource = path.join(rootDir, 'dist', 'tailmotion.js');
  const jsTarget = path.join(demoDir, 'tailmotion.js');
  await copyFile(jsSource, jsTarget);
  console.log(`[tailmotion] Copied ${path.relative(rootDir, jsSource)} -> ${path.relative(rootDir, jsTarget)}`);
};

prepare().catch((error) => {
  console.error('[tailmotion] Unable to prepare demo files');
  console.error(error);
  process.exitCode = 1;
});


