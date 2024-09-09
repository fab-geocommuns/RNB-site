import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class DefinitionPage extends RNBPage {
  readonly definitionTitle: Locator;
  readonly buildDefinitionTitle: Locator;
  readonly evaluateTitle: Locator;
  readonly buildings: Locator;

  constructor(page: Page) {
    super(page, '/definition');

    this.definitionTitle = page.getByText("Définition d'un bâtiment");
    this.buildDefinitionTitle = page.getByText('Contruction de la définition');
    this.evaluateTitle = page.getByText(
      'Evaluez si votre construction est un bâtiment',
    );
    this.buildings = page.getByTestId('building');
  }
}
