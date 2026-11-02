// Servidor do menu de TESTE (staging). Entrega `public/` como o Vercel entregaria, com duas
// diferenças deliberadas: /menu/js/engine-config.js vem de staging/engine-config.js e o
// rewrite /menu-engine/... (vercel.json) aponta para o Engine de staging.
// Uso: node staging/serve.mjs   (PORT=5199, ENGINE_STAGING_URL=http://127.0.0.1:3200)
// Não toca em src/ nem em public/: o comportamento de produção não muda.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(root, 'public');
const port = Number(process.env.PORT || 5199);
const engine = new URL(process.env.ENGINE_STAGING_URL || 'http://127.0.0.1:3200');
if (!['127.0.0.1', 'localhost'].includes(engine.hostname)) {
  throw new Error('ENGINE_STAGING_URL precisa ser o Engine de staging local (loopback).');
}

const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.woff2': 'font/woff2', '.ico': 'image/x-icon'
};
const proxied = /^\/menu-engine(\/api\/v1\/public\/restaurants\/[a-z0-9-]+)$/;

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const proxy = proxied.exec(url.pathname);
  if (proxy) {
    const upstream = await fetch(engine.origin + proxy[1], { headers: { accept: 'application/json' } }).catch(() => null);
    if (!upstream) { res.writeHead(502).end('Engine de staging indisponível.'); return; }
    res.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') || 'application/json', 'cache-control': 'no-store' });
    res.end(Buffer.from(await upstream.arrayBuffer()));
    return;
  }
  let path = decodeURIComponent(url.pathname);
  if (path === '/') { res.writeHead(302, { location: '/menu/' }).end(); return; }
  if (path === '/menu' || path === '/menu/') path = '/menu/index.html';
  const file = path === '/menu/js/engine-config.js'
    ? join(root, 'staging', 'engine-config.js')
    : normalize(join(publicDir, path));
  if (!file.startsWith(publicDir) && !file.startsWith(join(root, 'staging'))) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Não encontrado');
  }
}).listen(port, '127.0.0.1', () => console.log(`Menu de teste em http://127.0.0.1:${port}/menu/ (Engine ${engine.origin})`));
