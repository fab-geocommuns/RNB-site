import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import {
  buildingSegur,
  buildingToSplit,
} from '@/tests/fixtures/data/buildings';

test.describe('Edition', () => {
  test.setTimeout(60000);

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

      httpMocker.get(
        `/buildings/${buildingSegur.rnb_id}/?from=site&withPlots=1`,
        buildingSegur,
      );
      httpMocker.patch(
        `/buildings/${buildingSegur.rnb_id}/?from=site`,
        { status: 204 },
        { is_active: false },
      );

      await editionPage.goToBuilding(buildingSegur.rnb_id);
      await expect(editionPage.panel).toBeVisible();
      await editionPage.deactivateBuilding();
      await expect(editionPage.toaster.getByText(/désactivé/i)).toBeVisible();
    });
  });

  test.describe('Scission', () => {
    test('doit pouvoir scinder un bâtiment', async ({
      browserName,
      editionPage,
      httpMocker,
      mapController,
    }) => {
      test.skip(
        browserName === 'firefox',
        'Pas de support de WebGL2 sur Firefox headless',
      );

      httpMocker.get(
        `/buildings/${buildingToSplit.rnb_id}/?from=site&withPlots=1`,
        buildingToSplit,
      );
      httpMocker.post(`/buildings/${buildingToSplit.rnb_id}/split/?from=site`, {
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
      });

      await editionPage.goToBuilding(buildingToSplit.rnb_id);
      await expect(editionPage.panel).toBeVisible();

      const map = mapController('mainMap');
      await map.fitMapToBounds([2.421027, 48.844011, 2.428424, 48.84669]);

      await editionPage.startSplit();

      await expect(
        editionPage.panel.getByText(/Découpe du bâtiment/i),
      ).toBeVisible();
      await expect(
        editionPage.panel.getByText(/traits? de découpe/i),
      ).toBeVisible();

      await editionPage.drawCutLine(map, [
        [2.424, 48.8449],
        [2.424, 48.8456],
      ]);

      await editionPage.validateCut();
      await editionPage.clickNext();
      await editionPage.clickNext();
      await editionPage.confirmSplit();

      await expect(
        editionPage.toaster.getByText(/scindé avec succès/i),
      ).toBeVisible();
    });

    test('doit pouvoir afficher une erreur de validation sur un des enfants', async ({
      browserName,
      editionPage,
      httpMocker,
      mapController,
    }) => {
      test.skip(
        browserName === 'firefox',
        'Pas de support de WebGL2 sur Firefox headless',
      );

      httpMocker.get(
        `/buildings/${buildingToSplit.rnb_id}/?from=site&withPlots=1`,
        buildingToSplit,
      );
      httpMocker.post(`/buildings/${buildingToSplit.rnb_id}/split/?from=site`, {
        status: 400,
        body: {
          created_buildings: {
            '0': {
              shape: [
                "La forme fournie n'a pas pu être analysée ou n'est pas valide",
              ],
            },
          },
        },
      });

      await editionPage.goToBuilding(buildingToSplit.rnb_id);
      await expect(editionPage.panel).toBeVisible();

      const map = mapController('mainMap');
      await map.fitMapToBounds([2.421027, 48.844011, 2.428424, 48.84669]);

      await editionPage.startSplit();

      await expect(
        editionPage.panel.getByText(/Découpe du bâtiment/i),
      ).toBeVisible();
      await expect(
        editionPage.panel.getByText(/traits? de découpe/i),
      ).toBeVisible();

      await editionPage.drawCutLine(map, [
        [2.424, 48.8449],
        [2.424, 48.8456],
      ]);

      await editionPage.validateCut();
      await editionPage.clickNext();
      await editionPage.clickNext();
      await editionPage.confirmSplit();

      await expect(
        editionPage.toaster.getByText(/1er.*n'est pas valide/i),
      ).toBeVisible();
    });
  });
});
