import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe('Edition', () => {
  test.describe('Désactivation', () => {
    test('doit pouvoir désactiver un bâtiment', async ({
      browserName,
      editionPage,
      httpMocker,
    }) => {
      test.skip(
        browserName === 'firefox',
        'Pas de support de WebGL2 sur Firefox headless',
      );

      await editionPage.goToBuilding('NHDE2W8HE3X3');
      await expect(editionPage.panel).toBeVisible();
      await httpMocker.mockAPIRequest(
        'PATCH',
        '/buildings/NHDE2W8HE3X3/?from=site',
        { is_active: false },
        { status: 204 },
        true,
      );
      await editionPage.deactivateBuilding();
      await expect(editionPage.toaster.getByText(/désactivé/i)).toBeVisible();
    });
  });

  test.describe('Scission', () => {
    test('doit pouvoir scinder un bâtiment', async ({
      editionPage,
      httpMocker,
      mapController,
      mapLocator,
    }) => {
      await editionPage.goToBuilding('DWEZKKAXTAG2');
      await expect(editionPage.panel).toBeVisible();

      const map = mapController('mainMap');

      await map.fitMapToBounds([2.421027, 48.844011, 2.428424, 48.84669]);

      await editionPage.startSplit();
      await editionPage.clickNext();

      await editionPage.drawShape(map, [
        [2.423719541, 48.845236854],
        [2.42375453, 48.845399805],
        [2.424280374, 48.845348939],
        [2.424247375, 48.845183219],
        [2.423719541, 48.845236854],
      ]);

      await editionPage.clickNext();
      await editionPage.drawShape(map, [
        [2.424247375, 48.845183219],
        [2.424280374, 48.845348939],
        [2.425280374, 48.845248939],
        [2.425247375, 48.845083219],
        [2.424247375, 48.845183219],
      ]);

      await httpMocker.mockAPIRequest(
        'POST',
        '/buildings/DWEZKKAXTAG2/split/?from=site',
        {
          created_buildings: [
            {
              status: 'constructed',
              addresses_cle_interop: [],
              shape:
                'POLYGON ((2.423721634213109 48.84523835886833, 2.4237562502758863 48.84539782325717, 2.4242824144108397 48.84534770593274, 2.4242477983494553 48.84518368524684, 2.423721634213109 48.84523835886833))',
            },
            {
              status: 'constructed',
              addresses_cle_interop: [],
              shape:
                'POLYGON ((2.4242477983494553 48.84518368524684, 2.4242824144108397 48.84534770593274, 2.4252793569856124 48.84524747113295, 2.425244740924228 48.845083450118295, 2.4242477983494553 48.84518368524684))',
            },
          ],
        },
        {
          status: 201,
          body: [
            {
              rnb_id: 'BUILDING_1',
              status: 'constructed',
              shape:
                'POLYGON ((2.423721634213109 48.84523835886833, 2.4237562502758863 48.84539782325717, 2.4242824144108397 48.84534770593274, 2.4242477983494553 48.84518368524684, 2.423721634213109 48.84523835886833))',
            },
            {
              rnb_id: 'BUILDING_2',
              status: 'constructed',
              shape:
                'POLYGON ((2.4242477983494553 48.84518368524684, 2.4242824144108397 48.84534770593274, 2.4252793569856124 48.84524747113295, 2.425244740924228 48.845083450118295, 2.4242477983494553 48.84518368524684))',
            },
          ],
        },
        true,
      );

      await editionPage.confirmSplit();
      await expect(
        editionPage.toaster.getByText(/scindé avec succès/i),
      ).toBeVisible();
    });
  });
});
