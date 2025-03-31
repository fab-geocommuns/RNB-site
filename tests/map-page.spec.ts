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
  });

  test("doit pouvoir afficher les données d'un bâtiment", async ({
    mapPage,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await mapPage.goToBuilding('NHDE2W8HE3X3');
    await expect(mapPage.buildingDetailsPannel).toBeVisible();
    await expect(mapPage.buildingDetailsPannel).toContainText('NHDE2W8HE3X3');
    await expect(mapPage.buildingDetailsPannel).toContainText('segur');
  });
});
