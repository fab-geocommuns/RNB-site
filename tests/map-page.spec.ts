import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe('Carte', () => {
  test('doit contenir les éléments nécessaires', async ({
    mapPage,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await expect(mapPage.map).toBeVisible();
    await expect(mapPage.buildingStyleButton).toBeVisible();
  });

  test("doit changer de mode d'affichage entre point et emprise", async ({
    mapPage,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    let imageUrl = await mapPage.buildingStyleButton
      .locator('img')
      .getAttribute('src');
    expect(imageUrl).toContain('/dot.');
    await mapPage.buildingStyleButton.click();
    imageUrl = await mapPage.buildingStyleButton
      .locator('img')
      .getAttribute('src');
    expect(imageUrl).toContain('/polygon.');
  });
});
