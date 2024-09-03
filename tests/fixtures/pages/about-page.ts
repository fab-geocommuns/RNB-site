import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Page } from '@playwright/test';

export class AboutPage extends RNBPage {
  constructor(page: Page) {
    super(page, '/a-propos');
  }
}
