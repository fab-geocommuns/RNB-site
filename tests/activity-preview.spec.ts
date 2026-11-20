import { test, expect } from '@/tests/fixtures';

// /apercu-activite: the « Participer au RNB » section of the home page, tried
// on production data before it goes on the home page, and its details page.
// Data served by the mock server (tests/mock-server/index.mjs).
test.describe("Aperçu de l'activité", () => {
  test('affiche les 2 chiffres clés des 30 derniers jours', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;
    await expect(section.locator('.fr-card h3')).toHaveText([
      // the number and its label are two spans of the heading
      /^520\s*contributions$/,
      /^86\s*organisations contributrices$/,
    ]);
    await expect(
      section.getByText('dont 5 pour la première fois'),
    ).toBeVisible();
    // the rest is on the details page
    await expect(section.getByText(/communes? améliorées?/)).toHaveCount(0);
    await expect(section.locator('.fr-tags-group')).toHaveCount(0);
  });

  test('la période change les chiffres de la section', async ({
    activityPreviewPage,
  }) => {
    const { section } = activityPreviewPage;

    await section.getByText('7 derniers jours').click();

    await expect(section.locator('.fr-card h3')).toHaveText([
      /^140\s*contributions$/,
      /^20\s*organisations contributrices$/,
    ]);
    // no new organization: no "dont 0"
    await expect(section.getByText(/^dont /)).toHaveCount(0);

    await section.getByText('Depuis toujours').click();

    await expect(
      section.getByRole('heading', { name: /^888\s625 contributions$/ }),
    ).toBeVisible();
    // every contribution is a first one over the whole period
    await expect(section.getByText(/pour la première fois/)).toHaveCount(0);
  });

  test('mène au détail de l’activité, sur la période choisie', async ({
    activityPreviewPage,
  }) => {
    const { page, section } = activityPreviewPage;
    const details = section.getByRole('link', {
      name: 'Voir le détail de l’activité',
    });
    await expect(details).toHaveAttribute(
      'href',
      '/apercu-activite/details?periode=30',
    );

    await section.getByText('7 derniers jours').click();
    await expect(details).toHaveAttribute(
      'href',
      '/apercu-activite/details?periode=7',
    );
    await details.click();

    // the test timeout, not the 5 s of expect: in dev, the page is compiled
    // on its first visit
    await page.waitForURL(/\/apercu-activite\/details\?periode=7$/);
    await expect(
      page.getByRole('heading', {
        name: '40 communes améliorées par la communauté',
      }),
    ).toBeVisible();
  });

  test('propose de participer', async ({ activityPreviewPage }) => {
    const { section } = activityPreviewPage;
    await expect(
      section.getByRole('link', { name: 'S’inscrire pour contribuer' }),
    ).toHaveAttribute('href', '/inscription');
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

test.describe("Détail de l'activité", () => {
  test('affiche les 3 chiffres clés des 30 derniers jours', async ({
    activityDetailsPage,
  }) => {
    const { main } = activityDetailsPage;
    await expect(main.locator('.fr-card h2')).toHaveText([
      /^520\s*contributions$/,
      /^86\s*organisations contributrices$/,
      /^1\s248\s*communes améliorées par la communauté$/,
    ]);
    await expect(main.getByText('dont 12 pour la première fois')).toBeVisible();
  });

  test('affiche les classements complets, un onglet chacun', async ({
    activityDetailsPage,
  }) => {
    const { main } = activityDetailsPage;
    await expect(
      main.getByRole('heading', { name: 'Classements' }),
    ).toBeVisible();
    const table = main.locator('.fr-table table');

    // every contributor, not only the top of the summary
    await expect(table.locator('caption')).toHaveText(
      'Contributeurs les plus actifs',
    );
    await expect(table.locator('tbody tr')).toHaveCount(12);
    await expect(table.locator('tbody tr').first()).toContainText(
      /1\s*contributrice_test\s*Mairie Test\s*800/,
    );
    await expect(table.locator('tbody tr').last()).toContainText(
      /12\s*contributeur_11\s*–\s*1/,
    );

    await main.getByRole('tab', { name: 'Organisations (2)' }).click();
    await expect(table.locator('caption')).toHaveText(
      'Organisations les plus actives',
    );
    await expect(table.locator('thead th')).toHaveText([
      'Rang',
      'Organisation',
      'Contributions',
    ]);
    await expect(table.locator('tbody tr')).toHaveCount(2);

    await main.getByRole('tab', { name: 'Communes (3)' }).click();
    await expect(table.locator('tbody tr')).toHaveCount(3);
    await expect(table.getByText('Gironde (33)')).toBeVisible();
  });

  test('affiche le nom court des organisations, le nom complet au survol', async ({
    activityDetailsPage,
  }) => {
    const { page, main } = activityDetailsPage;
    await main.getByRole('tab', { name: /^Organisations/ }).click();
    const table = main.locator('.fr-table table');
    await expect(table.getByText('Commune de Talence')).toBeVisible();
    await expect(table.getByText('Syndicat intercommunal SIG')).toBeHidden();

    await table.getByText('Syndicat SIG', { exact: true }).hover();

    await expect(
      page.getByRole('tooltip', { name: 'Syndicat intercommunal SIG' }),
    ).toBeVisible();
  });

  test('accueille les nouveaux contributeurs, et eux seuls', async ({
    activityDetailsPage,
  }) => {
    const { main } = activityDetailsPage;
    await expect(
      main.getByRole('heading', {
        name: 'Nouveaux contributeurs ces 30 derniers jours',
      }),
    ).toBeVisible();
    const tags = main.locator('.fr-tags-group');
    await expect(tags.getByRole('listitem')).toHaveCount(1);
    await expect(
      tags.getByText('nouvelle_contributrice', { exact: true }),
    ).toBeVisible();
  });

  test('la période change tous les chiffres, et l’URL', async ({
    activityDetailsPage,
  }) => {
    const { page, main } = activityDetailsPage;
    const table = main.locator('.fr-table table');
    const tags = main.locator('.fr-tags-group');
    await main.getByRole('tab', { name: /^Communes/ }).click();

    await main.getByText('7 derniers jours').click();

    await expect(page).toHaveURL(/\?periode=7$/);
    await expect(
      main.getByRole('heading', {
        name: '40 communes améliorées par la communauté',
      }),
    ).toBeVisible();
    await expect(main.getByText('dont 3 pour la première fois')).toBeVisible();
    // the tab stays, the rankings are the ones of the period
    await expect(table.locator('caption')).toHaveText(
      'Communes les plus éditées',
    );
    await expect(table.getByText('9', { exact: true })).toHaveCount(0);
    await expect(
      main.getByRole('tab', { name: 'Contributeurs (1)' }),
    ).toBeVisible();
    await expect(
      main.getByRole('heading', {
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
    page,
    activityDetailsPage,
  }) => {
    await page.goto('/apercu-activite/details?periode=all');
    const { main } = activityDetailsPage;

    await expect(
      main.getByRole('heading', {
        name: /^17\s126 communes améliorées par la communauté$/,
      }),
    ).toBeVisible();
    await expect(main.getByText(/pour la première fois/)).toHaveCount(0);
    // the cities capped by the API, and said so
    await main.getByRole('tab', { name: 'Communes (100)' }).click();
    await expect(main.locator('.fr-table caption')).toHaveText(
      'Les 100 communes les plus éditées',
    );
    await expect(
      main.getByRole('heading', { name: 'Derniers contributeurs arrivés' }),
    ).toBeVisible();
    await expect(
      main
        .locator('.fr-tags-group')
        .getByText('derniere_arrivee', { exact: true }),
    ).toBeVisible();
  });

  test("n'est pas indexée par les moteurs de recherche", async ({
    activityDetailsPage,
  }) => {
    await expect(
      activityDetailsPage.page.locator('meta[name="robots"]'),
    ).toHaveAttribute('content', /noindex/);
  });
});
