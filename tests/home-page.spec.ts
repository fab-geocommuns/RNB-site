import { test, expect } from '@/tests/fixtures';
import { MapController } from '@mapgrab/playwright';

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
    mapLocator,
    browserName,
    mapController,
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('CDVXSAKG94Q5');
    await homePage.searchMapField.press('Enter');
    await page.waitForURL('**/carte*');

    if (browserName !== 'firefox') {
      await mapController('mainMap').waitToMapStable();
      const ign = mapLocator('filter["==", ["get", "rnb_id"], "CDVXSAKG94Q5"]');
      await expect(ign).toBeVisibleOnMap();
    }
  });

  test("doit contenir le champ de recherche rapide d'adresse pour la carte qui fonctionne avec clavier", async ({
    homePage,
    page,
    mapLocator,
    browserName,
    mapController,
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await expect(homePage.searchMapSuggestions).toBeVisible();
    await homePage.searchMapField.press('ArrowDown');
    await homePage.searchMapField.press('Enter');
    await page.waitForURL('**/carte*');

    if (browserName !== 'firefox') {
      await mapController('mainMap').waitToMapStable();
      const ign = mapLocator('filter["==", ["get", "rnb_id"], "CDVXSAKG94Q5"]');
      await expect(ign).toBeVisibleOnMap();
    }
  });

  test("doit contenir le champ de recherche rapide d'adresse pour la carte qui fonctionne avec la souris", async ({
    homePage,
    page,
    mapLocator,
    browserName,
    mapController,
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await homePage.searchMapSuggestions
      .locator('[class*="suggestion"]')
      .first()
      .click();
    await page.waitForURL('**/carte*');

    if (browserName !== 'firefox') {
      await mapController('mainMap').waitToMapStable();
      const ign = mapLocator('filter["==", ["get", "rnb_id"], "CDVXSAKG94Q5"]');
      await expect(ign).toBeVisibleOnMap();
    }
  });

  test("empêche l'execution d'un script inline (CSP)", async ({ homePage }) => {
    const msgPromise = homePage.page.waitForEvent('console');
    await homePage.page.evaluate(() => {
      const image = document.createElement('img');
      image.src = 'https://placehold.co/600x400/EEE/31343C';
      document.body.appendChild(image);
    });
    const message = (await msgPromise).text();
    // Chrome: Refused to load the image 'https://placehold.co/600x400/EEE/31343C' because it violates the following Content Security Policy directive: "img-src 'self' blob: data: https://rnb-open.s3.fr-par.scw.cloud/ https://referentiel-national-du-batiment.ghost.io/
    // Firefox: [JavaScript Error: \"Content-Security-Policy: The page’s settings blocked the loading of a resource (img-src) at https://placehold.co/600x400/EEE/31343C because it violates the following directive: “img-src 'self' blob: data: https://rnb-open.s3.fr-par.scw.cloud/ https://referentiel-national-du-batiment.ghost.io/”\" {file: \"debugger eval code line 291 > eval\" line: 3}]
    expect(message).toMatch(/(Refused to load|blocked the loading)/i);
    expect(message).toContain('https://placehold.co/600x400/EEE/31343C');
    expect(message).toMatch(/Content.Security.Policy/i);
  });
});
