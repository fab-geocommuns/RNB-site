import { test, expect } from '@/tests/fixtures';
import { MapController } from '@mapgrab/playwright';

test.describe("Page d'accueil", () => {
  test('doit contenir les éléments nécessaires', async ({ homePage }) => {
    await expect(homePage.mapButton).toBeVisible();
    await expect(homePage.mapButton).toHaveAttribute('href', /carte/);
    await expect(homePage.dbsTitle).toBeVisible();
    await expect(homePage.toolsTitle).toBeVisible();
    await expect(homePage.useCasesTitle).toBeVisible();
    await expect(homePage.faqButton).toBeVisible();
    await expect(homePage.faqButton).toHaveAttribute('href', /faq/);
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
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await expect(homePage.searchMapSuggestions).toBeVisible();
    await homePage.searchMapField.press('ArrowDown');
    await homePage.searchMapField.press('Enter');
    await page.waitForURL('**/carte*');

    if (browserName !== 'firefox') {
      const ign = mapLocator('filter["==", ["get", "rnb_id"], "CDVXSAKG94Q5"]');
      await expect(ign).toBeVisibleOnMap();
    }
  });

  test("doit contenir le champ de recherche rapide d'adresse pour la carte qui fonctionne avec la souris", async ({
    homePage,
    page,
    mapLocator,
    browserName,
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
      const ign = mapLocator('filter["==", ["get", "rnb_id"], "CDVXSAKG94Q5"]');
      await expect(ign).toBeVisibleOnMap();
    }
  });

  test("doit contenir un formulaire d'inscription à l'infolettre fonctionnel", async ({
    homePage,
    newsletterTestUtil,
  }) => {
    await newsletterTestUtil.run({
      newsletterField: homePage.newsletterField,
      newsletterButton: homePage.newsletterButton,
    });
  });
});
