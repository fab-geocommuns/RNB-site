import { test } from '@/tests/fixtures';
import { expect } from '@playwright/test';

test.describe('Définition & Standard', () => {
  test('doit contenir les éléments nécessaires', async ({ definitionPage }) => {
    await expect(definitionPage.definitionTitle).toBeVisible();
    await expect(definitionPage.buildDefinitionTitle).toBeVisible();
    await expect(definitionPage.evaluateTitle).toBeVisible();
    expect(await definitionPage.buildings.count()).toBeGreaterThan(0);
  });

  test("ne doit pas avoir de lien d'image cassé", async ({
    definitionPage,
  }) => {
    await definitionPage.page.waitForTimeout(2000);
    const brokenImages = await definitionPage.page.evaluate(() => {
      const allImages = document.getElementsByTagName('img');
      return Array.from(allImages)
        .filter((img) => !img.complete || img.naturalWidth === 0)
        .map((img) => img.src);
    });

    expect(brokenImages).toHaveLength(0);
  });
});
