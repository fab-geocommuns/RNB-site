import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class ActivityPreviewPage extends RNBPage {
  readonly title: Locator;
  readonly section: Locator;

  constructor(page: Page) {
    super(page, '/apercu-activite');
    this.title = page.locator('h2').getByText(/amélioré (leurs|ses) bâtiments/);
    this.section = page.locator('section').filter({ has: this.title });
  }
}
