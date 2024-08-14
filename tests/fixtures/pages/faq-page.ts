import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Page } from '@playwright/test';

export class FaqPage extends RNBPage {
  constructor(page: Page) {
    super(page, '/faq');
  }
}
