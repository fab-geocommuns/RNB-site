import {
  expect,
  Locator,
  type Page,
  PageAssertionsToHaveScreenshotOptions,
} from '@playwright/test';

export abstract class RNBPage {
  readonly page: Page;
  readonly path: string;
  readonly loginForm: Locator;
  readonly myAccountButton: Locator;

  protected constructor(page: Page, path: string) {
    this.page = page;
    this.path = path;

    this.loginForm = page.getByTestId('login-form');
    this.myAccountButton = page.getByTestId('my-account-button');
  }

  async goto() {
    await this.page.goto(this.path);
  }

  async performVisualComparison(
    name: string | ReadonlyArray<string>,
    options?: PageAssertionsToHaveScreenshotOptions,
  ) {
    await expect(this.page).toHaveScreenshot(name, options);
  }

  async login() {
    await this.page.waitForLoadState('networkidle');
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

  async isLoggedIn() {
    return await this.myAccountButton.isVisible();
  }

  async loginIfNotLoggedIn() {
    if (!(await this.isLoggedIn())) {
      await this.login();
    }
  }
}
