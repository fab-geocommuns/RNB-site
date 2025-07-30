import { Page, Route, Request, expect } from '@playwright/test';

export type MockResponse = {
  status?: number;
  headers?: Record<string, string>;
  body?: any;
};

export class HttpMocker {
  private routes: Array<{ pattern: string; handler: Function }> = [];
  private catchAllSetup = false;

  constructor(private page: Page) {}

  /**
   * Mock a request with assertions and response
   */
  async mockAPIRequest(
    method: string,
    apiRelativePath: string,
    body: any | null,
    response: MockResponse,
    allowOtherAPIRequests: boolean = false,
  ) {
    const handleMatchingRequest = async (route: Route, request: Request) => {
      if (body) {
        expect(request.postDataJSON()).toMatchObject(body);
      }

      // Fulfill the request with mock response
      await route.fulfill({
        status: response.status || 200,
        headers: {
          'Content-Type': 'application/json',
          ...response.headers,
        },
        body:
          typeof response.body === 'string'
            ? response.body
            : JSON.stringify(response.body),
      });
    };

    await this.page.route('**/api/alpha/**', async (route, request) => {
      const url = new URL(request.url());
      const fullPath = url.pathname + url.search;
      if (
        fullPath === '/api/alpha' + apiRelativePath &&
        request.method() === method
      ) {
        return handleMatchingRequest(route, request);
      }

      if (!allowOtherAPIRequests) {
        await route.abort();
        throw new Error(
          `Unexpected API request: ${request.method()} ${url}. Set allowOtherAPIRequests=true to allow other API requests.`,
        );
      }
    });
  }
}

export function createHttpMocker(page: Page): HttpMocker {
  return new HttpMocker(page);
}
