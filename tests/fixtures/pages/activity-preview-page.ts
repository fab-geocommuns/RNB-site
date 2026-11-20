import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class ActivityPreviewPage extends RNBPage {
  readonly section: Locator;

  constructor(page: Page) {
    super(page, '/apercu-activite');
    this.section = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Participer au RNB' }),
    });
  }
}

// Details of the section, opened on the period in its URL
export class ActivityDetailsPage extends RNBPage {
  readonly main: Locator;

  constructor(page: Page) {
    super(page, '/apercu-activite/details');
    this.main = page.locator('main');
  }
}
