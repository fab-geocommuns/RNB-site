import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

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

  test('doit contenir le champ de recherche rapide pour la carte qui fonctionne avec clavier', async ({
    homePage,
    page,
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await expect(homePage.searchMapSuggestions).toBeVisible();
    await homePage.searchMapField.press('ArrowDown');
    await homePage.searchMapField.press('Enter');
    await page.waitForURL('**/carte*');
  });

  test('doit contenir le champ de recherche rapide pour la carte qui fonctionne avec la souris', async ({
    homePage,
    page,
  }) => {
    await expect(homePage.searchMapField).toBeVisible();
    await homePage.searchMapField.scrollIntoViewIfNeeded();
    await homePage.searchMapField.fill('73 Av. de Paris, 94160 Saint-Mandé');
    await homePage.searchMapSuggestions
      .locator('[class*="suggestion"]')
      .first()
      .click();
    await page.waitForURL('**/carte*');
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
