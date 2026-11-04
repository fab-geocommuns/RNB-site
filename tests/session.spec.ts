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

    const sessionCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/session')) {
        sessionCalls.push(request.url());
      }
    });

    await page.goto('/');
    await expect(page.getByTestId('my-account-button').first()).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Se connecter' }),
    ).not.toBeVisible();
    expect(sessionCalls).toEqual([]);
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
