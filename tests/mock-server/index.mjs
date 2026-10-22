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

// Home page "La communauté du RNB" block: rolling windows (?days=N)
const EDITIONS_BY_PERIOD = {
  last_7_days: 321,
  last_30_days: 1234,
};

const PERIOD_SINCE = {
  last_7_days: '2026-10-08T14:00:00+02:00',
  last_30_days: '2026-09-15T14:00:00+02:00',
};
const MONTHLY = [
  '2025-11',
  '2025-12',
  '2026-01',
  '2026-02',
  '2026-03',
  '2026-04',
  '2026-05',
  '2026-06',
  '2026-07',
  '2026-08',
  '2026-09',
  '2026-10',
].map((month, i) => ({ month, editions: 300 + i * 100 }));

const editionActivity = (period) => ({
  period: { key: period, since: PERIOD_SINCE[period] ?? null, until: null },
  updated_at: '2026-10-15T14:00:00+02:00',
  totals: {
    editions: EDITIONS_BY_PERIOD[period] ?? 0,
    cities: 42,
    editors: 7,
  },
  previous_period: {
    since: '2026-08-16T14:00:00+02:00',
    until: '2026-09-15T14:00:00+02:00',
    editions: 1000,
  },
  monthly: MONTHLY,
  top: {
    users: [
      {
        rank: 1,
        username: 'contributrice_test',
        organization_short_name: 'Mairie Test',
        count: 800,
      },
    ],
    organizations: [
      {
        rank: 1,
        name: 'Mairie de Test',
        short_name: 'Mairie Test',
        count: 800,
      },
    ],
    cities: [
      {
        rank: 1,
        insee_code: '99001',
        name: 'Ville Test',
        department: { code: '99', name: 'Département Test' },
        count: 500,
      },
    ],
    departments: [
      { rank: 1, code: '99', name: 'Département Test', count: 500 },
    ],
  },
  newcomers: {
    users: [
      {
        username: 'nouveau_contributeur',
        organization_short_name: null,
        first_edition_at: '2026-10-03T09:12:00+02:00',
      },
    ],
    cities: [],
    departments: [],
    count: { users: 3, cities: 0, departments: 0 },
  },
});

const changeStatsDay = (date, bdtopo, bal) => ({
  date,
  events_count: { import_bdtopo: bdtopo, import_bal: bal, contributions: 10 },
});

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
  if (method === 'GET' && path === '/api/alpha/editions/activity/') {
    const days = u.searchParams.get('days') || '30';
    return json(res, 200, editionActivity(`last_${days}_days`));
  }
  if (method === 'GET' && path === '/api/alpha/buildings/change_stats/') {
    return json(res, 200, [
      changeStatsDay('2024-04-15', 120000, 3000),
      changeStatsDay('2025-04-15', 90000, 4500),
      changeStatsDay('2026-04-15', 60000, 2000),
    ]);
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
