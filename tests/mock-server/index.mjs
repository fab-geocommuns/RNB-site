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
import { readFileSync } from 'node:fs';

// Historique servi au rendu serveur de /batiments/<id>/historique (cf.
// tests/history.spec.ts).
const HISTORY = JSON.parse(
  readFileSync(new URL('../fixtures/data/history.json', import.meta.url)),
);

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

// « Participer au RNB » section (/apercu-activite). Chosen to show the edge
// cases: no new organization (no delta), a 1-row ranking (its card is hidden)
const gironde = { code: '33', name: 'Gironde' };
const CONTRIBUTION_SUMMARY = {
  updated_at: '2026-10-15T14:10:00+02:00',
  window_days: 30,
  cities: { total: 1248, new: 12 },
  organizations: { total: 86, new: 0 },
  building_changes: { total: 4310, contributions: 520 },
  top: {
    users: [
      {
        username: 'contributrice_test',
        organization: 'Mairie Test',
        count: 800,
      },
    ],
    organizations: [
      { name: 'Commune de Talence', department: gironde, count: 42 },
      { name: 'Syndicat SIG', department: null, count: 18 },
    ],
    cities: [
      {
        insee_code: '28158',
        name: 'Fresnay-l’Évêque',
        department: { code: '28', name: 'Eure-et-Loir' },
        count: 9,
      },
      { insee_code: '33522', name: 'Talence', department: gironde, count: 7 },
      {
        insee_code: '73311',
        name: 'Verrens-Arvey',
        department: { code: '73', name: 'Savoie' },
        count: 5,
      },
    ],
  },
  newcomers: { users: [{ username: 'nouvelle_contributrice' }] },
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
  // Server-side fetch of /batiments/[id]/historique: simulates an API failure
  if (method === 'GET' && path === '/api/alpha/buildings/ERREURAPI/history/') {
    return json(res, 500, { detail: 'Internal error (mock).' });
  }
  if (
    method === 'GET' &&
    path === `/api/alpha/buildings/${HISTORY[0].rnb_id}/history/`
  ) {
    return json(res, 200, HISTORY);
  }
  if (method === 'GET' && path === '/api/alpha/contributions/summary/') {
    // the 7-day window: fewer contributions, same rankings, another newcomer
    const days = Number(u.searchParams.get('days') || 30);
    return json(
      res,
      200,
      days === 7
        ? {
            ...CONTRIBUTION_SUMMARY,
            window_days: 7,
            cities: { ...CONTRIBUTION_SUMMARY.cities, new: 3 },
            top: {
              ...CONTRIBUTION_SUMMARY.top,
              cities: CONTRIBUTION_SUMMARY.top.cities.map((c) => ({
                ...c,
                count: 1,
              })),
            },
            newcomers: { users: [{ username: 'nouvelle_contributrice_7j' }] },
          }
        : CONTRIBUTION_SUMMARY,
    );
  }
  if (method === 'GET' && path.startsWith('/api/alpha/buildings/')) {
    return json(res, 404, { detail: 'Not found (mock).' });
  }
  if (method === 'POST' && path === '/api/alpha/notifications/unsubscribe/') {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const { token } = JSON.parse(raw || '{}');
      if (token === 'jeton-valide') {
        return json(res, 200, { email: 'auteur@exemple.fr' });
      }
      json(res, 400, { token: ['Lien de désinscription invalide.'] });
    });
    return;
  }
  if (method === 'POST' && path === '/api/alpha/auth/pro_connect/exchange/') {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      const { code } = JSON.parse(raw || '{}');
      if (code === 'code-valide') {
        return json(res, 200, {
          id: 42,
          token: 'jeton-proconnect',
          username: 'agent-proconnect',
          groups: ['Contributors', 'Admins'],
        });
      }
      json(res, 400, { error: 'invalid_code' });
    });
    return;
  }
  if (method === 'GET' && path === '/api/alpha/auth/pro_connect/logout/') {
    res.writeHead(302, {
      Location:
        'https://proconnect.example/logout?id_token_hint=jeton-id&state=etat',
    });
    return res.end();
  }
  if (method === 'GET' && path === '/api/alpha/notifications/preferences/') {
    return json(res, 200, { subscribed: true });
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
