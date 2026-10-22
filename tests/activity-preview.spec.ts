import { test, expect } from '@/tests/fixtures';

// /apercu-activite: the home page activity block, tried on production data
// before it goes on the home page. Data served by the mock server.
test.describe("Aperçu de l'activité", () => {
  test('affiche les contributions de la communauté par fenêtre glissante', async ({
    activityPreviewPage,
  }) => {
    const { section, title } = activityPreviewPage;
    // first big number: the contributions tile
    const contributionsCount = section.locator('.fr-display--xs').first();
    await expect(title).toHaveText(
      'Ces 30 derniers jours, 42 communes ont amélioré leurs bâtiments',
    );
    await expect(contributionsCount).toHaveText(/^1\s234$/);
    await expect(
      section.getByText('+23 % par rapport aux 30 jours précédents'),
    ).toBeVisible();
    await expect(section.getByText('dont 3 nouveaux')).toBeVisible();
    await expect(section.getByText('contributrice_test')).toBeVisible();
    await expect(
      section.getByText('Contributeur · nouveau_contributeur'),
    ).toBeVisible();

    await section.getByText('7 jours').click();
    await expect(contributionsCount).toHaveText(/^321$/);
    await expect(title).toHaveText(
      'Ces 7 derniers jours, 42 communes ont amélioré leurs bâtiments',
    );
  });

  test('bascule le classement entre organisations, communes et départements', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(section.getByText('Mairie Test').first()).toBeVisible();
    await section.getByRole('button', { name: 'Communes' }).click();
    await expect(
      section.getByRole('heading', { name: 'Communes les plus éditées' }),
    ).toBeVisible();
    await expect(section.getByText('Ville Test')).toBeVisible();
  });

  test('explique comment se construit le RNB', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('heading', { name: 'Comment se construit le RNB ?' }),
    ).toBeVisible();
    await expect(section.getByText(/279\s500/)).toBeVisible();
    await expect(
      section.getByRole('link', { name: 'Rejoindre les contributeurs' }),
    ).toHaveAttribute('href', '/inscription');
  });

  test("n'est pas indexée par les moteurs de recherche", async ({
    activityPreviewPage,
  }) => {
    await expect(
      activityPreviewPage.page.locator('meta[name="robots"]'),
    ).toHaveAttribute('content', /noindex/);
  });
});
