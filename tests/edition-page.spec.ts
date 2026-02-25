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
      browserName,
      editionPage,
      httpMocker,
      mapController,
    }) => {
      test.skip(
        browserName === 'firefox',
        'Pas de support de WebGL2 sur Firefox headless',
      );

      const targetBuilding = '6NFTV4Z6DP92';
      await editionPage.goToBuilding(targetBuilding);
      await expect(editionPage.panel).toBeVisible();

      const map = mapController('mainMap');

      await map.fitMapToBounds([2.421027, 48.844011, 2.428424, 48.84669]);

      await editionPage.startSplit();

      // Wait for the cut step UI to appear (building shape is loading)
      await expect(
        editionPage.panel.getByText(/Découpe du bâtiment/i),
      ).toBeVisible();

      // Wait for the shape to be loaded
      await expect(
        editionPage.panel.getByText(/traits? de découpe/i),
      ).toBeVisible();

      // Draw a cut line across the building
      await editionPage.drawCutLine(map, [
        [2.424, 48.8449],
        [2.424, 48.8456],
      ]);

      // Validate the cut
      await editionPage.validateCut();

      // Navigate through child info steps
      await editionPage.clickNext(); // child 1 → child 2
      await editionPage.clickNext(); // child 2 → summary

      // Mock the split API request (don't check exact body since shapes are computed by turf)
      await httpMocker.mockAPIRequest(
        'POST',
        `/buildings/${targetBuilding}/split/?from=site`,
        null,
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
      const targetBuilding = '6NFTV4Z6DP92';
      await editionPage.goToBuilding(targetBuilding);
      await expect(editionPage.panel).toBeVisible();

      const map = mapController('mainMap');

      await map.fitMapToBounds([2.421027, 48.844011, 2.428424, 48.84669]);

      await editionPage.startSplit();

      // Wait for the cut step UI
      await expect(
        editionPage.panel.getByText(/Découpe du bâtiment/i),
      ).toBeVisible();

      await expect(
        editionPage.panel.getByText(/traits? de découpe/i),
      ).toBeVisible();

      // Draw a cut line across the building
      await editionPage.drawCutLine(map, [
        [2.424, 48.8449],
        [2.424, 48.8456],
      ]);

      // Validate the cut
      await editionPage.validateCut();

      // Navigate through child info steps
      await editionPage.clickNext(); // child 1 → child 2
      await editionPage.clickNext(); // child 2 → summary

      await httpMocker.mockAPIRequest(
        'POST',
        `/buildings/${targetBuilding}/split/?from=site`,
        null,
        {
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
        },
        true,
      );

      await editionPage.confirmSplit();
      await expect(
        editionPage.toaster.getByText(/1er.*n'est pas valide/i),
      ).toBeVisible();
    });
  });
});
