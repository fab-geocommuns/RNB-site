import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import {
  makeBuildingResponse,
  makeValidator,
} from '@/tests/fixtures/data/building';

const BUILDING_ID = 'PG46YY6YWCX8';
const GET_PATH = `/buildings/${BUILDING_ID}/?from=site&withPlots=1`;
const PATCH_PATH = `/buildings/${BUILDING_ID}/?from=site`;

test.describe('Validation depuis l’édition', () => {
  test.setTimeout(60000);

  test('formulaire verrouillé tant qu’une validation existe', async ({
    browserName,
    editionPage,
    httpMocker,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    // Bâtiment validé par un autre utilisateur (verrouille le formulaire).
    await httpMocker.mockAPIRoutes(
      [
        {
          method: 'GET',
          path: GET_PATH,
          response: {
            status: 200,
            body: makeBuildingResponse({
              rnb_id: BUILDING_ID,
              validated_by: [makeValidator({ display_name: 'Camille Témoin' })],
            }),
          },
        },
      ],
      true,
    );

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();

    // Le select de statut est désactivé (formulaire verrouillé).
    await expect(editionPage.statusSelect).toBeDisabled();
    // La case à cocher de déverrouillage est présente.
    await expect(editionPage.unlockCheckbox).toBeVisible();

    // Cocher déverrouille le formulaire.
    await editionPage.unlockCheckbox.check();
    await expect(editionPage.statusSelect).toBeEnabled();
  });

  test('valider un bâtiment depuis l’édition', async ({
    browserName,
    editionPage,
    httpMocker,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    // État initial : bâtiment non validé.
    await httpMocker.mockAPIRoutes(
      [
        {
          method: 'GET',
          path: GET_PATH,
          response: {
            status: 200,
            body: makeBuildingResponse({
              rnb_id: BUILDING_ID,
              validated_by: [],
            }),
          },
        },
      ],
      true,
    );

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();
    await expect(editionPage.validateButton).toBeVisible();

    // Mocks pour le clic : PATCH is_valid:true puis re-GET (validé).
    // Ce nouvel enregistrement masque le précédent (handler le plus récent).
    await httpMocker.mockAPIRoutes(
      [
        {
          method: 'PATCH',
          path: PATCH_PATH,
          body: { is_valid: true },
          response: { status: 204 },
        },
        {
          method: 'GET',
          path: GET_PATH,
          response: {
            status: 200,
            body: makeBuildingResponse({
              rnb_id: BUILDING_ID,
              validated_by: [makeValidator()],
            }),
          },
        },
      ],
      true,
    );

    await editionPage.clickValidate();
    await expect(
      editionPage.toaster.getByText(/validation enregistrée/i),
    ).toBeVisible();
  });
});
