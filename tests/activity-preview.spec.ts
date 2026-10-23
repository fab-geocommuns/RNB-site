import { test, expect } from '@/tests/fixtures';

// /apercu-activite: the home page activity block, tried on production data
// before it goes on the home page. Data served by the mock server.
test.describe("Aperçu de l'activité", () => {
  test('résume les contributions de la communauté par fenêtre glissante', async ({
    activityPreviewPage,
  }) => {
    const { section, summary } = activityPreviewPage;
    await expect(summary).toHaveText(
      /^Ces 30 derniers jours : 1\s234 contributions dans 42 communes par 7 contributeurs$/,
    );
    await expect(
      section.getByText(
        '+23 % par rapport aux 30 jours précédents · 3 contributeurs pour la première fois',
      ),
    ).toBeVisible();
    await expect(section.getByText('nouveau_contributeur')).toBeVisible();

    await section.getByText('7 jours').click();
    await expect(summary).toHaveText(
      /^Ces 7 derniers jours : 321 contributions dans 42 communes par 7 contributeurs$/,
    );
  });

  test('affiche les 3 classements côte à côte sur grand écran', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    for (const title of [
      'Contributeurs les plus actifs',
      'Organisations les plus actives',
      'Communes les plus éditées',
    ]) {
      await expect(section.getByRole('heading', { name: title })).toBeVisible();
    }
    await expect(
      section.getByText('Ville Test').filter({ visible: true }),
    ).toBeVisible();
    // the tabs are only for small screens
    await expect(section.getByRole('tablist')).toBeHidden();
  });

  test('affiche les classements dans des onglets sur mobile', async ({
    activityPreviewPage,
  }) => {
    const { page, section } = activityPreviewPage;
    await page.setViewportSize({ width: 375, height: 812 });

    const citiesTab = section.getByRole('tab', { name: 'Communes' });
    await citiesTab.click();
    await expect(citiesTab).toHaveAttribute('aria-selected', 'true');
    await expect(
      section.getByRole('tabpanel').getByText('Ville Test'),
    ).toBeVisible();
  });

  test('renvoie vers les ressources pour participer', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('link', { name: 'Comment est construit le RNB' }),
    ).toHaveAttribute('href', '/a-propos');
    await expect(
      section.getByRole('link', { name: 'S’inscrire pour contribuer' }),
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
