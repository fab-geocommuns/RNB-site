import { test, expect } from '@/tests/fixtures';

// /apercu-activite: the « Participer au RNB » section of the home page, tried
// on production data before it goes on the home page. Data served by the mock
// server (tests/mock-server/index.mjs).
test.describe("Aperçu de l'activité", () => {
  test('affiche les 3 chiffres clés des 30 derniers jours', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    // in the order of the rankings below them
    await expect(section.locator('.fr-card h3')).toHaveText([
      // the number and its label are two spans of the heading
      /^4\s310\s*modifications de bâtiments$/,
      /^86\s*organisations contributrices$/,
      /^1\s248\s*communes améliorées par la communauté$/,
      'Organisations les plus actives',
      'Communes les plus éditées',
    ]);
    await expect(
      section.getByText('dont 520 par les contributeurs'),
    ).toBeVisible();
    await expect(
      section.getByText('dont 12 pour la première fois'),
    ).toBeVisible();
    // no new organization: no "dont 0"
    await expect(section.getByText(/^dont 0 /)).toHaveCount(0);
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
    // an organization is shown without department
    const organizations = section
      .locator('.fr-card')
      .filter({ hasText: 'Organisations les plus actives' });
    await expect(organizations.getByRole('listitem')).toHaveCount(2);
    await expect(organizations.getByText(/·/)).toHaveCount(0);
    // a single contributor: the card is hidden
    await expect(
      section.getByRole('heading', { name: 'Contributeurs les plus actifs' }),
    ).toHaveCount(0);
  });

  test('accueille les nouveaux contributeurs, et eux seuls', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('heading', {
        name: 'Nouveaux contributeurs ces 30 derniers jours',
      }),
    ).toBeVisible();
    const tags = section.locator('.fr-tags-group');
    await expect(tags.getByRole('listitem')).toHaveCount(1);
    await expect(
      tags.getByText('nouvelle_contributrice', { exact: true }),
    ).toBeVisible();
  });

  test('la période change tous les chiffres de la section', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    const cities = section
      .locator('.fr-card')
      .filter({ hasText: 'Communes les plus éditées' });
    const tags = section.locator('.fr-tags-group');

    await section.getByText('7 derniers jours').click();

    await expect(
      section.getByRole('heading', {
        name: '40 communes améliorées par la communauté',
      }),
    ).toBeVisible();
    await expect(
      section.getByText('dont 3 pour la première fois'),
    ).toBeVisible();
    await expect(cities.getByText('9', { exact: true })).toHaveCount(0);
    await expect(
      section.getByRole('heading', {
        name: 'Nouveaux contributeurs ces 7 derniers jours',
      }),
    ).toBeVisible();
    await expect(
      tags.getByText('nouvelle_contributrice_7j', { exact: true }),
    ).toBeVisible();
    await expect(
      tags.getByText('nouvelle_contributrice', { exact: true }),
    ).toHaveCount(0);
  });

  test('depuis toujours : les cumuls et les derniers arrivés', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;

    await section.getByText('Depuis toujours').click();

    await expect(
      section.getByRole('heading', {
        name: /^17\s126 communes améliorées par la communauté$/,
      }),
    ).toBeVisible();
    // every contribution is a first one over the whole period
    await expect(section.getByText(/pour la première fois/)).toHaveCount(0);
    await expect(
      section.getByRole('heading', { name: 'Derniers contributeurs arrivés' }),
    ).toBeVisible();
    await expect(
      section
        .locator('.fr-tags-group')
        .getByText('derniere_arrivee', { exact: true }),
    ).toBeVisible();
  });

  test('propose de participer', async ({ activityPreviewPage }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('link', { name: 'S’inscrire pour contribuer' }),
    ).toHaveAttribute('href', '/inscription');
    await expect(
      section.getByRole('link', { name: 'Voir l’activité de ma commune' }),
    ).toHaveCount(0);
    await expect(
      section.getByRole('link', { name: 'Toutes les statistiques' }),
    ).toHaveAttribute('href', '/stats');
  });

  test("n'est pas indexée par les moteurs de recherche", async ({
    activityPreviewPage,
  }) => {
    await expect(
      activityPreviewPage.page.locator('meta[name="robots"]'),
    ).toHaveAttribute('content', /noindex/);
  });
});
