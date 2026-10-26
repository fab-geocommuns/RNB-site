import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class ActivityPreviewPage extends RNBPage {
  readonly section: Locator;

  constructor(page: Page, path = '/apercu-activite') {
    super(page, path);
    this.section = page.locator('section').filter({
      has: page.getByRole('heading', { name: 'Participer au RNB' }),
    });
  }
}

export class ActivityPreviewCompletePage extends ActivityPreviewPage {
  constructor(page: Page) {
    super(page, '/apercu-activite/complet');
  }
}

export class ActivityPreviewStoryPage extends ActivityPreviewPage {
  constructor(page: Page) {
    super(page, '/apercu-activite/recit');
  }
}
