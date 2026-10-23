import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class ActivityPreviewPage extends RNBPage {
  readonly section: Locator;
  // generated sentence summing up the period
  readonly summary: Locator;

  constructor(page: Page) {
    super(page, '/apercu-activite');
    this.section = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Participer au RNB' }),
    });
    this.summary = this.section.getByRole('heading', { level: 3 });
  }
}
