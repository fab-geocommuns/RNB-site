import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class MapPage extends RNBPage {
  readonly map: Locator;

  constructor(page: Page) {
    super(page, '/carte');
    this.map = page.getByLabel('Map');
  }
}
