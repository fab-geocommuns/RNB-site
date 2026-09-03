/**
 * Calque « Bâtiments démolis » (issue #1005) : activation automatique à la
 * sélection d'un bâtiment démoli, garde sur `is_active`, parité /carte ↔
 * /edition, et bouton du sélecteur de calques.
 *
 * Hors périmètre : le rendu réel d'un bâtiment démoli sur la carte (clic sur
 * une feature rendue). `tests/fixtures/utils/http-mock.ts` absorbe toute
 * requête `.pbf` (tuiles vectorielles) avec un buffer vide — aucune feature
 * de bâtiment ne se rend jamais dans ce harnais e2e, donc
 * `queryRenderedFeatures` n'y retournerait jamais rien. Ces scénarios passent
 * tous par `?q=<rnb_id>` (recherche), jamais par un clic carte.
 */
import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import {
  buildingSegur,
  buildingDemolished,
  buildingDemolishedInactive,
} from '@/tests/fixtures/data/buildings';

test.describe('Bâtiments démolis', () => {
  test('active automatiquement le calque et affiche le badge « Démoli » sur /carte', async ({
    mapPage,
    httpMocker,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(
      `/buildings/${buildingDemolished.rnb_id}/?from=site&withPlots=1`,
      buildingDemolished,
    );

    await mapPage.goToBuilding(buildingDemolished.rnb_id);

    await expect(
      mapPage.toaster.getByText(/Bâtiments démolis.*activé/),
    ).toBeVisible();
    await expect(
      mapPage.buildingDetailsPannel.getByText('Démoli', { exact: true }),
    ).toBeVisible();
  });

  test("n'active rien pour un bâtiment non démoli", async ({
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

    // Le panneau se rend dans le même effet React que l'activation
    // automatique du calque : une fois visible, le toast aurait déjà été
    // déclenché s'il devait l'être.
    await expect(mapPage.buildingDetailsPannel).toBeVisible();
    await expect(
      mapPage.toaster.getByText(/Bâtiments démolis/),
    ).not.toBeVisible();
  });

  test('parité /edition : même activation automatique et même badge', async ({
    editionPage,
    httpMocker,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(
      `/buildings/${buildingDemolished.rnb_id}/?from=site&withPlots=1`,
      buildingDemolished,
    );

    await editionPage.goToBuilding(buildingDemolished.rnb_id);

    await expect(
      editionPage.toaster.getByText(/Bâtiments démolis.*activé/),
    ).toBeVisible();
    await expect(
      editionPage.panel.getByText('Démoli', { exact: true }),
    ).toBeVisible();
  });

  test('bâtiment démoli désactivé : ni toast ni activation, seul le bandeau de désactivation reste', async ({
    mapPage,
    httpMocker,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(
      `/buildings/${buildingDemolishedInactive.rnb_id}/?from=site&withPlots=1`,
      buildingDemolishedInactive,
    );

    await mapPage.goToBuilding(buildingDemolishedInactive.rnb_id);

    await expect(mapPage.buildingDetailsPannel).toBeVisible();
    await expect(
      mapPage.buildingDetailsPannel.getByText(
        'Cet Identifiant RNB a été désactivé.',
      ),
    ).toBeVisible();
    await expect(
      mapPage.toaster.getByText(/Bâtiments démolis/),
    ).not.toBeVisible();
  });

  test('bascule l\'état actif du bouton "Bâtiments démolis" dans le sélecteur de calques', async ({
    mapPage,
    page,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await mapPage.openLayersMenu();
    await mapPage.demolishedLayerButton.click();
    await expect(page).toHaveURL(/extra_layers=demolished/);

    await mapPage.demolishedLayerButton.click();
    await expect(page).not.toHaveURL(/extra_layers=demolished/);
  });
});
