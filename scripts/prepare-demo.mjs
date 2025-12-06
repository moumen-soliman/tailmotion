import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const source = path.join(rootDir, 'tailmotion.css');
const demoDir = path.join(rootDir, 'demo');
const target = path.join(demoDir, 'tailmotion.css');

const prepare = async () => {
  await mkdir(demoDir, { recursive: true });
  await copyFile(source, target);
  console.log(`[tailmotion] Copied ${path.relative(rootDir, source)} -> ${path.relative(rootDir, target)}`);
};

prepare().catch((error) => {
  console.error('[tailmotion] Unable to copy demo CSS');
  console.error(error);
  process.exitCode = 1;
});


