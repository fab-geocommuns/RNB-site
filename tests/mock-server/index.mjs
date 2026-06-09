#!/usr/bin/env node
/**
 * Minimal HTTP server for Playwright e2e tests.
 *
 * Next.js does some fetches *server-side* (e.g. `getDatabases` for the home
 * page, the Ghost CMS calls for the blog teaser). Playwright's `page.route`
 * only sees browser-side traffic, so it can't intercept those.
 *
 * This server provides empty / harmless defaults so the dev server can render
 * pages without depending on staging. Per-test browser-side stubs are still
 * driven by the `HttpMocker` fixture.
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.MOCK_SERVER_PORT || 8001);
const HOST = process.env.MOCK_SERVER_HOST || '127.0.0.1';
console.log(`[mock-server] starting on ${HOST}:${PORT} (pid=${process.pid})`);

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(body));
};

const server = createServer((req, res) => {
  const { method, url } = req;
  const u = new URL(url, `http://localhost:${PORT}`);
  const path = u.pathname;

  if (process.env.MOCK_SERVER_VERBOSE) {
    console.log(`[mock-server] ${method} ${u.pathname}${u.search}`);
  }

  if (path === '/__health') {
    return json(res, 200, { ok: true });
  }

  // RNB API
  if (method === 'GET' && path === '/api/alpha/diffusion_databases') {
    return json(res, 200, []);
  }
  if (method === 'GET' && path.startsWith('/api/alpha/buildings/')) {
    return json(res, 404, { detail: 'Not found (mock).' });
  }

  // Ghost CMS — only used at SSR for the home page. The Ghost client hits
  // `{NEXT_GHOST_API_URL}/ghost/api/{version}/content/{resource}`.
  if (path.startsWith('/ghost/api/')) {
    if (path.includes('/posts/')) return json(res, 200, { posts: [] });
    if (path.includes('/pages/')) return json(res, 200, { pages: [] });
    return json(res, 200, {});
  }

  // Default: 404 — visible in dev logs so unhandled routes surface.
  json(res, 404, { error: `mock-server: unhandled ${method} ${path}` });
});

server.listen(PORT, HOST, () => {
  console.log(`[mock-server] listening on http://${HOST}:${PORT}`);
});

server.on('error', (err) => {
  console.error(`[mock-server] failed to listen on ${HOST}:${PORT}:`, err);
  process.exit(1);
});
