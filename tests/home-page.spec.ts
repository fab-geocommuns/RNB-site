import { test, expect } from '@/tests/fixtures';
import { banFeatureSegur } from '@/tests/fixtures/data/buildings';

test.describe("Page d'accueil", () => {
  test('doit contenir les éléments nécessaires', async ({ homePage }) => {
    await expect(homePage.mapButton).toBeVisible();
    await expect(homePage.mapButton).toHaveAttribute('href', /carte/);
    await expect(homePage.dbsTitle).toBeVisible();
    await expect(homePage.toolsTitle).toBeVisible();
    await expect(homePage.useCasesTitle).toBeVisible();
  });

  test("doit contenir le champ de recherche rapide d'ID-RNB pour la carte", async ({
    homePage,
    page,
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('CDVXSAKG94Q5');
    await homePage.searchMapField.press('Enter');
    await page.waitForURL('**/carte*');
    expect(page.url()).toContain('CDVXSAKG94Q5');
  });

  test("doit contenir le champ de recherche rapide d'adresse pour la carte qui fonctionne avec clavier", async ({
    homePage,
    httpMocker,
    page,
  }) => {
    await httpMocker.banSearch([banFeatureSegur]);

    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await expect(homePage.searchMapSuggestions).toBeVisible();
    await homePage.searchMapField.press('ArrowDown');
    await homePage.searchMapField.press('Enter');
    await page.waitForURL('**/carte*');
  });

  test("doit contenir le champ de recherche rapide d'adresse pour la carte qui fonctionne avec la souris", async ({
    homePage,
    httpMocker,
    page,
  }) => {
    await httpMocker.banSearch([banFeatureSegur]);

    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await homePage.searchMapSuggestions
      .locator('[class*="suggestion"]')
      .first()
      .click();
    await page.waitForURL('**/carte*');
  });

  test('affiche les contributions de la communauté par fenêtre glissante', async ({
    homePage,
  }) => {
    const section = homePage.editionActivitySection;
    // first big number: the contributions tile
    const contributionsCount = section.locator('.fr-display--xs').first();
    await expect(homePage.editionActivityTitle).toHaveText(
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
    await expect(homePage.editionActivityTitle).toHaveText(
      'Ces 7 derniers jours, 42 communes ont amélioré leurs bâtiments',
    );

    await section.getByText('Depuis toujours').click();
    await expect(contributionsCount).toHaveText(/^98\s765$/);
    await expect(homePage.editionActivityTitle).toHaveText(
      'Depuis le lancement de l’édition, 42 communes ont amélioré leurs bâtiments',
    );
  });

  test('bascule le classement entre organisations, communes et départements', async ({
    homePage,
  }) => {
    const section = homePage.editionActivitySection;
    await expect(section.getByText('Mairie Test').first()).toBeVisible();
    await section.getByRole('button', { name: 'Communes' }).click();
    await expect(
      section.getByRole('heading', { name: 'Communes les plus éditées' }),
    ).toBeVisible();
    await expect(section.getByText('Ville Test')).toBeVisible();
  });

  test('explique comment se construit le RNB', async ({ homePage }) => {
    const section = homePage.editionActivitySection;
    await expect(
      section.getByRole('heading', { name: 'Comment se construit le RNB ?' }),
    ).toBeVisible();
    await expect(section.getByText(/279\s500/)).toBeVisible();
    await expect(section.getByText(/98\s765/)).toBeVisible();
    await expect(
      section.getByRole('link', { name: 'Rejoindre les contributeurs' }),
    ).toHaveAttribute('href', '/inscription');
  });

  test("empêche l'execution d'un script inline (CSP)", async ({ homePage }) => {
    const msgPromise = homePage.page.waitForEvent('console');
    await homePage.page.evaluate(() => {
      const image = document.createElement('img');
      image.src = 'https://placehold.co/600x400/EEE/31343C';
      document.body.appendChild(image);
    });
    const message = (await msgPromise).text();
    expect(message).toMatch(/(Refused to load|blocked the loading)/i);
    expect(message).toContain('https://placehold.co/600x400/EEE/31343C');
    expect(message).toMatch(/Content.Security.Policy/i);
  });
});
