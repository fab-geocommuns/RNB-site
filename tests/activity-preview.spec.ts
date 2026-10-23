import { test, expect } from '@/tests/fixtures';

// /apercu-activite: the home page activity block, tried on production data
// before it goes on the home page. Data served by the mock server.
test.describe("Aperçu de l'activité", () => {
  test('affiche les contributions de la communauté par fenêtre glissante', async ({
    activityPreviewPage,
  }) => {
    const { section, subtitle } = activityPreviewPage;
    // first big number: the contributions tile
    const contributionsCount = section.locator('.fr-display--xs').first();
    await expect(subtitle).toHaveText(
      'Ces 30 derniers jours, 42 communes ont amélioré leurs bâtiments',
    );
    await expect(contributionsCount).toHaveText(/^1\s234$/);
    await expect(
      section.getByText('+23 % par rapport aux 30 jours précédents'),
    ).toBeVisible();
    await expect(section.getByText('dont 3 nouveaux')).toBeVisible();
    await expect(section.getByText('contributrice_test')).toBeVisible();
    await expect(section.getByText('nouveau_contributeur')).toBeVisible();

    await section.getByText('7 jours').click();
    await expect(contributionsCount).toHaveText(/^321$/);
    await expect(subtitle).toHaveText(
      'Ces 7 derniers jours, 42 communes ont amélioré leurs bâtiments',
    );
  });

  test('affiche les classements dans des onglets', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(section.getByText('contributrice_test')).toBeVisible();

    const citiesTab = section.getByRole('tab', { name: 'Communes' });
    await citiesTab.click();
    await expect(citiesTab).toHaveAttribute('aria-selected', 'true');
    await expect(
      section.getByRole('tabpanel').getByText('Ville Test'),
    ).toBeVisible();
  });

  test('propose de rejoindre les contributeurs', async ({
    activityPreviewPage,
  }) => {
    await expect(
      activityPreviewPage.section.getByRole('link', {
        name: 'Rejoindre les contributeurs',
      }),
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
