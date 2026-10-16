/**
 * Formulaire « Améliorez le RNB » du panneau bâtiment de /carte.
 */
import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import { buildingSegur } from '@/tests/fixtures/data/buildings';

const REPORT_TEXT = 'Il manque une adresse';

const submitReport = async (page: Page) => {
  const panel = page.getByTestId('visu-panel');
  await panel.getByPlaceholder(/Envoyez votre signalement/).fill(REPORT_TEXT);
  const request = page.waitForRequest(
    (req) => req.method() === 'POST' && req.url().includes('/reports/'),
  );
  await panel.getByRole('button', { name: 'Envoyer mon signalement' }).click();
  await expect(panel.getByText('Signalement envoyé. Merci.')).toBeVisible();
  return request;
};

test.describe('Formulaire de signalement', () => {
  test.beforeEach(async ({ browserName, httpMocker }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await httpMocker.install();
    httpMocker.get(
      `/buildings/${buildingSegur.rnb_id}/?from=site&withPlots=1`,
      buildingSegur,
    );
  });

  test('connecté, le signalement est envoyé avec le token et sans email', async ({
    page,
    auth,
    httpMocker,
  }) => {
    httpMocker.post(
      '/reports/?from=site',
      { status: 201, body: {} },
      { rnb_id: buildingSegur.rnb_id, text: REPORT_TEXT },
    );
    await auth.signIn({ accessToken: 'token-de-test' });

    await page.goto(`/carte?q=${buildingSegur.rnb_id}`);
    const panel = page.getByTestId('visu-panel');
    await expect(panel).toContainText(buildingSegur.rnb_id);
    await expect(panel.getByPlaceholder(/adresse email/)).toHaveCount(0);

    const request = await submitReport(page);
    expect(request.headers()['authorization']).toBe('Token token-de-test');
    expect(request.postDataJSON()).not.toHaveProperty('email');
  });

  test('anonyme, le signalement est envoyé sans token, avec l’email saisi', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post(
      '/reports/?from=site',
      { status: 201, body: {} },
      {
        rnb_id: buildingSegur.rnb_id,
        text: REPORT_TEXT,
        email: 'visiteur@example.com',
      },
    );

    await page.goto(`/carte?q=${buildingSegur.rnb_id}`);
    const panel = page.getByTestId('visu-panel');
    await panel
      .getByPlaceholder('Votre adresse email (optionnelle)')
      .fill('visiteur@example.com');

    const request = await submitReport(page);
    expect(request.headers()).not.toHaveProperty('authorization');
  });
});
