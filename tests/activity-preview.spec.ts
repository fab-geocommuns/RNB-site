import { test, expect } from '@/tests/fixtures';

// /apercu-activite: the « Participer au RNB » section of the home page, tried
// on production data before it goes on the home page. Data served by the mock
// server (tests/mock-server/index.mjs).
test.describe("Aperçu de l'activité", () => {
  test('affiche les 3 chiffres clés avec leur libellé', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('heading', {
        name: /^1\s248 communes déjà améliorées par la communauté$/,
      }),
    ).toBeVisible();
    await expect(section.getByText('+12 ce mois-ci')).toBeVisible();
    await expect(
      section.getByRole('heading', { name: '86 organisations contributrices' }),
    ).toBeVisible();
    await expect(
      section.getByRole('heading', {
        name: /^4\s310 modifications de bâtiments ces 30 derniers jours$/,
      }),
    ).toBeVisible();
    await expect(
      section.getByText('dont 520 par les contributeurs'),
    ).toBeVisible();
    // no new organization: no "+0"
    await expect(section.getByText('+0 ce mois-ci')).toHaveCount(0);
  });

  test('affiche les classements de plus d’une ligne', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    const cities = section
      .locator('.fr-card')
      .filter({ hasText: 'Communes les plus éditées' });
    await expect(cities.getByRole('listitem')).toHaveCount(3);
    await expect(cities.getByText('· Gironde (33)')).toBeVisible();
    await expect(
      section.getByRole('heading', { name: 'Organisations les plus actives' }),
    ).toBeVisible();
    // a single contributor: the card is hidden
    await expect(
      section.getByRole('heading', { name: 'Contributeurs les plus actifs' }),
    ).toHaveCount(0);
  });

  test('accueille les nouvelles communes contributrices', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('heading', {
        name: 'Nouvelles communes contributrices ce mois-ci',
      }),
    ).toBeVisible();
    await expect(section.getByText('Verrens-Arvey').last()).toBeVisible();
  });

  test('propose de participer', async ({ activityPreviewPage }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('link', { name: 'S’inscrire pour contribuer' }),
    ).toHaveAttribute('href', '/inscription');
    await expect(
      section.getByRole('link', { name: 'Voir l’activité de ma commune' }),
    ).toHaveAttribute('href', '/stats#mise-a-jour');
    await expect(
      section.getByRole('link', { name: 'Toutes les statistiques' }),
    ).toHaveAttribute('href', '/stats');
    await expect(
      section.getByText(
        'Les contributions de l’équipe RNB ne sont pas comptées dans les classements.',
      ),
    ).toBeVisible();
  });

  test("n'est pas indexée par les moteurs de recherche", async ({
    activityPreviewPage,
  }) => {
    await expect(
      activityPreviewPage.page.locator('meta[name="robots"]'),
    ).toHaveAttribute('content', /noindex/);
  });
});
