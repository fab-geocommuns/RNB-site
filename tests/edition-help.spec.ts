import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import { buildingValidatedBy } from '@/tests/fixtures/data/buildings';

const BUILDING_ID = 'PG46YY6YWCX8';
const GET_PATH = `/buildings/${BUILDING_ID}/?from=site&withPlots=1`;

test.describe('Aide contextuelle de l’édition', () => {
  test.setTimeout(60000);

  test('l’aide du statut physique s’ouvre dans le panneau d’aide', async ({
    browserName,
    editionPage,
    httpMocker,
    page,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(GET_PATH, buildingValidatedBy([]));

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();

    await expect(editionPage.panel.getByLabel('Statut physique')).toBeVisible();

    const helpPanel = page.getByTestId('edition-help-panel');
    const helpButton = editionPage.panel.getByRole('button', {
      name: 'Aide : Statut physique',
    });
    await expect(helpPanel).toBeHidden();
    await expect(helpButton).toHaveAttribute('aria-expanded', 'false');

    await helpButton.click();
    await expect(helpPanel).toBeVisible();
    await expect(helpButton).toHaveAttribute('aria-expanded', 'true');
    await expect(
      helpPanel.getByText(/le statut le plus répandu/),
    ).toBeVisible();
    await expect(
      helpPanel.getByRole('link', { name: /En savoir plus/ }),
    ).toHaveAttribute('href', /#quel-statut-donner-a-un-batiment$/);

    // Non bloquant : le formulaire reste utilisable aide ouverte.
    await editionPage.statusSelect.selectOption('demolished');
    await expect(helpPanel).toBeVisible();

    // Échap ferme l'aide et rend le focus au bouton.
    await helpPanel.getByText(/le statut le plus répandu/).click();
    await page.keyboard.press('Escape');
    await expect(helpPanel).toBeHidden();
    await expect(helpButton).toBeFocused();
  });

  test('chaque section du formulaire a son aide', async ({
    browserName,
    editionPage,
    httpMocker,
    page,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(GET_PATH, buildingValidatedBy([]));

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();

    const helpPanel = page.getByTestId('edition-help-panel');
    for (const section of [
      'Validation',
      'Statut physique',
      'Adresses',
      'Géométrie',
      'Désactiver',
    ]) {
      const button = editionPage.panel.getByRole('button', {
        name: `Aide : ${section}`,
        exact: true,
      });
      await button.scrollIntoViewIfNeeded();
      await button.click();
      await expect(
        page.getByRole('region', { name: `Aide : ${section}`, exact: true }),
      ).toBeVisible();
      await expect(
        helpPanel.getByRole('link', { name: /En savoir plus/ }),
      ).toBeVisible();
    }

    await helpPanel.getByRole('link', { name: 'Fermer' }).click();
    await expect(helpPanel).toBeHidden();
  });

  test('la barre d’outils propose un lien vers le guide d’édition', async ({
    browserName,
    editionPage,
    httpMocker,
    page,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    httpMocker.get(GET_PATH, buildingValidatedBy([]));

    await editionPage.goToBuilding(BUILDING_ID);

    const guideLink = page.getByRole('link', { name: 'guide', exact: true });
    await expect(guideLink).toHaveAttribute(
      'href',
      /editer-le-rnb-dans-les-regles-de-lart#quel-statut-donner-a-un-batiment$/,
    );
    await expect(guideLink).toHaveAttribute('target', '_blank');
  });
});
