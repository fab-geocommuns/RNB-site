import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class ActivityPreviewPage extends RNBPage {
  readonly section: Locator;
  // generated sentence summing up the period
  readonly subtitle: Locator;

  constructor(page: Page) {
    super(page, '/apercu-activite');
    this.section = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'La communauté du RNB' }),
    });
    this.subtitle = this.section.locator('.section__subtitle');
  }
}
