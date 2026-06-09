import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import { buildingSegur } from '@/tests/fixtures/data/buildings';

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
    httpMocker,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(
      `/buildings/${buildingSegur.rnb_id}/?from=site&withPlots=1`,
      buildingSegur,
    );

    await mapPage.goToBuilding(buildingSegur.rnb_id);
    await expect(mapPage.buildingDetailsPannel).toBeVisible();
    await expect(mapPage.buildingDetailsPannel).toContainText(
      buildingSegur.rnb_id,
    );
    await expect(mapPage.buildingDetailsPannel).toContainText(/ségur/i);
  });
});
