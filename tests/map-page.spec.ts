import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import { buildingSegur } from '@/tests/fixtures/data/buildings';
import { REPORTS_POINT } from '@/tests/fixtures/data/reports';
import { API_BASE } from '@/tests/config';

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

  test('le calque des bâtiments démolis ne redessine pas la carte en boucle', async ({
    page,
    httpMocker,
    mapController,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await httpMocker.install();
    await page.goto('/carte?extra_layers=demolished');

    // A style changed on every frame never lets the map report itself loaded
    const map = await mapController('mainMap').getMapInstance();
    await expect
      .poll(() => map.evaluate((mapInstance) => mapInstance.loaded()))
      .toBe(true);
  });

  test('activer le cadastre ne recharge pas les tuiles des bâtiments et des permis', async ({
    page,
    mapPage,
    mapController,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    const buildingTileRequests: string[] = [];
    const adsTileRequests: string[] = [];
    page.on('request', (request) => {
      const url = request.url();
      if (url.startsWith(`${API_BASE}/tiles/`)) buildingTileRequests.push(url);
      if (url.startsWith(`${API_BASE}/permis/tiles/`))
        adsTileRequests.push(url);
    });

    await page.goto(
      `/carte?coords=${REPORTS_POINT.lat},${REPORTS_POINT.lng},17`,
    );
    const map = await mapController('mainMap').getMapInstance();
    await expect
      .poll(() => map.evaluate((mapInstance) => mapInstance.loaded()))
      .toBe(true);
    expect(buildingTileRequests.length).toBeGreaterThan(0);
    expect(adsTileRequests.length).toBeGreaterThan(0);
    buildingTileRequests.length = 0;
    adsTileRequests.length = 0;

    await mapPage.openLayersMenu();
    const plotTilesRequested = page.waitForRequest(/\/plots\/tiles\//);
    await page.getByRole('link', { name: 'Cadastre' }).click();
    await plotTilesRequested;
    await expect
      .poll(() => map.evaluate((mapInstance) => mapInstance.loaded()))
      .toBe(true);

    expect(buildingTileRequests).toEqual([]);
    expect(adsTileRequests).toEqual([]);
  });
});
