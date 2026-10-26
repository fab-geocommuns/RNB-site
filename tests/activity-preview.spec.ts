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
    await expect(section.getByText('+12 ces 30 derniers jours')).toBeVisible();
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
    await expect(section.getByText(/^\+0 /)).toHaveCount(0);
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
    await expect(tags.getByText('nouvelle_contributrice')).toBeVisible();
  });

  test('version simple : la période ne change pas les chiffres clés', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    const cities = section
      .locator('.fr-card')
      .filter({ hasText: 'Communes les plus éditées' });
    await expect(cities.getByText('9')).toBeVisible();

    await section.getByText('7 derniers jours').click();

    await expect(
      section.getByRole('heading', {
        name: 'Ces 7 derniers jours',
        exact: true,
      }),
    ).toBeVisible();
    // the rankings follow the window, the key figures do not
    await expect(cities.getByText('9')).toHaveCount(0);
    await expect(section.getByText('+12 ces 30 derniers jours')).toBeVisible();
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

  test('version complète : chiffres de la période et 3 classements', async ({
    activityPreviewCompletePage,
  }) => {
    const { section } = activityPreviewCompletePage;
    await expect(
      section.getByRole('heading', {
        name: /^1\s234 contributions ces 30 derniers jours$/,
      }),
    ).toBeVisible();
    await expect(
      section.getByText('+23 % par rapport aux 30 jours précédents'),
    ).toBeVisible();
    await expect(
      section.getByRole('heading', { name: '7 contributeurs actifs' }),
    ).toBeVisible();
    // the single contributor still gets his card
    await expect(
      section.getByRole('heading', { name: 'Contributeurs les plus actifs' }),
    ).toBeVisible();
  });

  test('version récit : la phrase de la période et le podium', async ({
    activityPreviewStoryPage,
  }) => {
    const { section } = activityPreviewStoryPage;
    await expect(
      section.getByRole('heading', {
        name: /^Ces 30 derniers jours, 1\s234 contributions ont amélioré 42 communes, grâce à 7 contributeurs\.$/,
      }),
    ).toBeVisible();
    await expect(section.getByText('Contributeur le plus actif')).toBeVisible();
    await expect(
      section.getByRole('heading', { name: 'contributrice_test' }),
    ).toBeVisible();
    await expect(
      activityPreviewStoryPage.page.getByRole('link', { name: 'Récit' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('bascule entre 30 et 7 jours', async ({
    activityPreviewCompletePage,
  }) => {
    const { section } = activityPreviewCompletePage;
    await expect(
      section.getByRole('heading', {
        name: 'Ces 30 derniers jours',
        exact: true,
      }),
    ).toBeVisible();

    await section.getByText('7 derniers jours').click();

    await expect(
      section.getByRole('heading', {
        name: 'Ces 7 derniers jours',
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      section.getByRole('heading', {
        name: '321 contributions ces 7 derniers jours',
      }),
    ).toBeVisible();
  });
});
