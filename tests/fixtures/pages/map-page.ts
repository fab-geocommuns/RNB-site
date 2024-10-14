import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';
import { test } from '@/tests/fixtures';

export class MapPage extends RNBPage {
  readonly map: Locator;
  readonly buildingStyleButton: Locator;

  constructor(page: Page, browserName: string) {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    super(page, '/carte');
    this.map = page.getByLabel('Map');
    this.buildingStyleButton = page.getByTestId('control-point-emprise');
  }
}
