import { test, expect } from '@/tests/fixtures';
import { emptyReportStats } from '@/tests/fixtures/data/reports';

test.describe('Session rendue côté serveur', () => {
  test("le HTML de l'accueil affiche « Mon compte » à un connecté", async ({
    auth,
    context,
  }) => {
    await auth.signIn();

    const response = await context.request.get('/');
    const html = await response.text();

    expect(html).toContain('Mon compte');
    expect(html).not.toContain('Se connecter');
  });

  test("l'en-tête n'affiche jamais « Se connecter » à un connecté", async ({
    auth,
    httpMocker,
    page,
  }) => {
    await httpMocker.install();
    await auth.signIn();

    // The header must not wait for the browser to fetch the session
    await page.route('**/api/auth/session', (route) => route.abort());

    await page.goto('/');
    await expect(page.getByTestId('my-account-button').first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Se connecter' }),
    ).not.toBeVisible();
  });

  test('un chargement de page prolonge le cookie de session', async ({
    auth,
    context,
    httpMocker,
    page,
  }) => {
    await httpMocker.install();
    await auth.signIn(); // cookie valid for one hour

    const sessionCookieExpiry = async () =>
      (await context.cookies()).find(
        (cookie) => cookie.name === 'next-auth.session-token',
      )?.expires ?? 0;
    const before = await sessionCookieExpiry();

    await page.goto('/');

    // Issued again with next-auth's default max age (30 days)
    await expect
      .poll(sessionCookieExpiry)
      .toBeGreaterThan(before + 24 * 60 * 60);
  });

  test('/edition affiche la carte sans écran de chargement à un connecté', async ({
    browserName,
    auth,
    httpMocker,
    page,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await httpMocker.install();
    httpMocker.get('/reports/stats/?from=site', emptyReportStats);
    await auth.signIn();

    const response = await page.request.get('/edition');
    expect(await response.text()).not.toContain('Chargement en cours');

    await page.goto('/edition');
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  });

  test('/edition renvoie à la connexion quand la session est perdue', async ({
    browserName,
    auth,
    context,
    httpMocker,
    page,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await httpMocker.install();
    httpMocker.get('/reports/stats/?from=site', emptyReportStats);
    await auth.signIn();

    // Session fetches made on load re-issue the cookie: let them finish so
    // they cannot restore it after the sign-out below
    let pendingSessionCalls = 0;
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/session')) pendingSessionCalls++;
    });
    page.on('requestfinished', (request) => {
      if (request.url().includes('/api/auth/session')) pendingSessionCalls--;
    });

    await page.goto('/edition');
    await expect(page.locator('.maplibregl-canvas')).toBeVisible();
    await expect.poll(() => pendingSessionCalls).toBe(0);

    // Signed out elsewhere: next-auth refetches the session when the tab
    // becomes visible again
    await context.clearCookies();
    await page.evaluate(() =>
      document.dispatchEvent(new Event('visibilitychange')),
    );

    await expect(page).toHaveURL(/\/connexion\?redirect=%2Fedition/);
  });

  test('/edition redirige un visiteur vers la connexion côté serveur', async ({
    context,
  }) => {
    const response = await context.request.get('/edition?q=CDVXSAKG94Q5', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(response.headers()['location']).toBe(
      `/connexion?redirect=${encodeURIComponent('/edition?q=CDVXSAKG94Q5')}`,
    );
  });
});
