import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';
import { test } from '@/tests/fixtures';

export class MapPage extends RNBPage {
  readonly map: Locator;

  constructor(page: Page) {
    super(page, '/carte');
    this.map = page.getByLabel('Map');
  }

  async goToBuilding(buildingId: string) {
    await this.page.goto(`/carte?q=${buildingId}`);
  }

  get buildingDetailsPannel() {
    return this.page.getByTestId('visu-panel');
  }
}
