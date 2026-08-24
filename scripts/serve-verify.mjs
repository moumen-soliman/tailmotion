/* Minimal static server used while developing: serves the repository root so
   verify/*.html can load ../tailmotion.css directly, with no bundler in the
   way. Not published. */
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = path.join(rootDir, url === '/' ? '/verify/index.html' : url);

  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  try {
    if (statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
  } catch {
    res.writeHead(404).end('Not found');
    return;
  }

  res.writeHead(200, {
    'content-type': TYPES[path.extname(filePath)] || 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
}).listen(PORT, () => console.log(`verify server on http://localhost:${PORT}`));
