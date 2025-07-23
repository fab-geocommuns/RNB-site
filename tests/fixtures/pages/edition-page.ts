import { RNBPage } from '@/tests/fixtures/pages/_page';
import { Locator, Page } from '@playwright/test';

export class EditionPage extends RNBPage {
  readonly panel: Locator;
  readonly toaster: Locator;
  readonly map: Locator;
  readonly myAccountButton: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    super(page, '/edition');
    this.map = page.getByTestId('map');
    this.panel = page.getByTestId('edition-panel');
    this.toaster = page.getByTestId('toaster');
    this.myAccountButton = page.getByTestId('my-account-button');
    this.loginForm = page.getByTestId('login-form');
  }

  async goToBuilding(buildingId: string) {
    const isLoggedIn = await this.myAccountButton.isVisible();
    if (!isLoggedIn) {
      await this.login();
    }
    await this.page.goto(`/edition?q=${buildingId}`);
  }

  async deactivateBuilding() {
    const deactivationButton = this.panel.getByTestId(
      'toggle-activation-button',
    );
    await deactivationButton.scrollIntoViewIfNeeded();
    await deactivationButton.click();
  }

  async login() {
    await this.page.goto('/login');
    await this.loginForm
      .getByLabel('Email')
      .fill(process.env.TEST_ACCOUNT_EMAIL!);
    await this.loginForm
      .getByLabel('Mot de passe')
      .fill(process.env.TEST_ACCOUNT_PASSWORD!);
    await this.loginForm.getByRole('button', { name: /se connecter/i }).click();
    await this.page.waitForLoadState('networkidle');
  }
}
