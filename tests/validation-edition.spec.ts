import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import {
  buildingValidatedBy,
  makeValidator,
} from '@/tests/fixtures/data/buildings';
import { DEFAULT_USERNAME } from '@/tests/fixtures/utils/auth-mock';

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
    httpMocker.get(
      GET_PATH,
      buildingValidatedBy([makeValidator({ display_name: 'Camille Témoin' })]),
    );

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();

    // Verrouillé : données en lecture seule (pas de champ de formulaire).
    await expect(
      editionPage.panel.getByRole('heading', { name: 'Statut du bâtiment' }),
    ).toBeVisible();
    await expect(editionPage.statusSelect).toHaveCount(0);
    // Le bouton de déverrouillage est présent.
    await expect(editionPage.unlockButton).toBeVisible();

    // Cliquer fait apparaître le formulaire d'édition.
    await editionPage.clickUnlock();
    await expect(editionPage.statusSelect).toBeVisible();
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

    // Bâtiment non validé + PATCH is_valid:true attendu lors du clic.
    httpMocker.get(GET_PATH, buildingValidatedBy([]));
    httpMocker.patch(PATCH_PATH, { status: 204 }, { is_valid: true });

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();
    await expect(editionPage.validateButton).toBeVisible();

    await editionPage.clickValidate();
    await expect(
      editionPage.toaster.getByText(/validation enregistrée/i),
    ).toBeVisible();
  });

  test('retirer sa validation depuis l’édition', async ({
    browserName,
    editionPage,
    httpMocker,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    // Bâtiment validé par l'utilisateur courant + PATCH is_valid:false au clic.
    httpMocker.get(
      GET_PATH,
      buildingValidatedBy([
        makeValidator({ username: DEFAULT_USERNAME, display_name: 'Moi' }),
      ]),
    );
    httpMocker.patch(PATCH_PATH, { status: 204 }, { is_valid: false });

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();
    await expect(editionPage.removeValidationButton).toBeVisible();

    await editionPage.clickRemoveValidation();
    await expect(
      editionPage.toaster.getByText(/validation retirée/i),
    ).toBeVisible();
  });
});
