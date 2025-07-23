import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class EditionPage extends RNBPage {
  readonly panel: Locator;
  readonly toaster: Locator;
  readonly map: Locator;

  constructor(page: Page) {
    super(page, '/edition');
    this.map = page.getByTestId('map');
    this.panel = page.getByTestId('edition-panel');
    this.toaster = page.getByTestId('toaster');
  }

  async goToBuilding(buildingId: string) {
    await this.loginIfNotLoggedIn();
    await this.page.goto(`/edition?q=${buildingId}`);
  }

  async deactivateBuilding() {
    const deactivationButton = this.panel.getByTestId(
      'toggle-activation-button',
    );
    await deactivationButton.scrollIntoViewIfNeeded();
    await deactivationButton.click();
  }
}
