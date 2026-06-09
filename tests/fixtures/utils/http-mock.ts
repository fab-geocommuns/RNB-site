import { Page, Route, Request, expect } from '@playwright/test';

export type MockResponse = {
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
};

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type Stub = {
  method: Method;
  path: string;
  response: MockResponse;
  expectBody?: unknown;
};

// Empty 1x1 transparent PNG, used to absorb tile / image requests we don't
// care about during e2e tests.
const EMPTY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);
const EMPTY_PBF = Buffer.alloc(0);

// Hosts we silently absorb (analytics, tiles, BAN, etc.) — they aren't tested
// here and we don't want noisy network errors masking real failures.
const ABSORBED_HOSTS = [
  'sentry.incubateur.net',
  'cdn.heapanalytics.com',
  'heapanalytics.com',
  'openmaptiles.geo.data.gouv.fr',
  'plateforme.adresse.data.gouv.fr',
  'geoservices.ign.fr',
  'data.geopf.fr',
];

export class HttpMocker {
  private stubs: Stub[] = [];
  private apiBase: URL;
  private routesInstalled = false;

  constructor(
    private page: Page,
    apiBase: string,
  ) {
    this.apiBase = new URL(apiBase);
  }

  /** Register a stub for a request against the mocked API. */
  on(
    method: Method,
    apiRelativePath: string,
    response: MockResponse,
    options: { expectBody?: unknown } = {},
  ) {
    this.stubs.push({
      method,
      path: apiRelativePath,
      response,
      expectBody: options.expectBody,
    });
  }

  get(path: string, body: unknown, response?: MockResponse) {
    this.on('GET', path, response ?? { body });
  }

  post(path: string, response: MockResponse, expectBody?: unknown) {
    this.on('POST', path, response, { expectBody });
  }

  patch(path: string, response: MockResponse, expectBody?: unknown) {
    this.on('PATCH', path, response, { expectBody });
  }

  /**
   * Stub the BAN geocoder so the address autocomplete returns the given
   * features instead of hitting the live service.
   */
  async banSearch(features: unknown[]) {
    await this.installBanIfNeeded();
    this.banFeatures = features;
  }

  private banFeatures: unknown[] | null = null;
  private banInstalled = false;
  private async installBanIfNeeded() {
    if (this.banInstalled) return;
    this.banInstalled = true;
    await this.page.route(
      (url) => url.host === 'data.geopf.fr',
      async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            type: 'FeatureCollection',
            features: this.banFeatures ?? [],
          }),
        });
      },
    );
  }

  /**
   * @deprecated Use `on(method, path, response, { expectBody })` together with
   * `install()` for default-deny behaviour. Kept as a thin shim while
   * edition-page specs are being migrated.
   */
  async mockAPIRequest(
    method: string,
    apiRelativePath: string,
    expectBody: unknown,
    response: MockResponse,
    _allowOtherAPIRequests: boolean = false,
  ) {
    this.on(
      method.toUpperCase() as Method,
      apiRelativePath,
      response,
      expectBody != null ? { expectBody } : {},
    );
    await this.install();
  }

  /**
   * Install the default-deny route handlers. Must be called before any page
   * navigation. Idempotent.
   */
  async install() {
    if (this.routesInstalled) return;
    this.routesInstalled = true;

    // RNB API: default deny — unrecognized requests fail loudly.
    await this.page.route(
      (url) => url.host === this.apiBase.host,
      (route, request) => this.handleApiRequest(route, request),
    );

    // External services we don't test: absorb silently.
    await this.page.route(
      (url) => ABSORBED_HOSTS.some((host) => url.host.endsWith(host)),
      (route, request) => this.absorb(route, request),
    );
  }

  private async handleApiRequest(route: Route, request: Request) {
    const url = new URL(request.url());
    const fullPath = url.pathname + url.search;
    const apiPath = fullPath.replace(this.apiBase.pathname, '');
    const method = request.method() as Method;

    // Vector tile endpoints are absorbed with an empty PBF — they're not
    // worth stubbing individually and we don't assert on them.
    if (/\.pbf(\?.*)?$/.test(url.pathname + url.search)) {
      await route.fulfill({
        status: 200,
        contentType: 'application/x-protobuf',
        body: EMPTY_PBF,
      });
      return;
    }

    const stub = this.stubs.find(
      (s) => s.method === method && s.path === apiPath,
    );

    if (!stub) {
      const error = `Unmocked API request: ${method} ${apiPath}`;
      console.error(`[http-mock] ${error}`);
      await route.fulfill({
        status: 599,
        body: JSON.stringify({ error }),
        contentType: 'application/json',
      });
      return;
    }

    if (stub.expectBody !== undefined) {
      expect(request.postDataJSON()).toMatchObject(
        stub.expectBody as Record<string, unknown>,
      );
    }

    const { response } = stub;
    await route.fulfill({
      status: response.status ?? 200,
      headers: {
        'Content-Type': 'application/json',
        ...response.headers,
      },
      body:
        typeof response.body === 'string'
          ? response.body
          : JSON.stringify(response.body ?? {}),
    });
  }

  private async absorb(route: Route, request: Request) {
    const url = new URL(request.url());
    if (url.pathname.endsWith('.pbf')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/x-protobuf',
        body: EMPTY_PBF,
      });
      return;
    }
    if (/\.(png|jpe?g|webp)$/i.test(url.pathname)) {
      await route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: EMPTY_PNG,
      });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    });
  }
}

export function createHttpMocker(page: Page, apiBase: string): HttpMocker {
  return new HttpMocker(page, apiBase);
}
