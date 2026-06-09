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
    this.myAccountButton = page
      .locator('a[data-testid="my-account-button"]')
      .first();
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

  async expectLoggedIn() {
    await expect(this.myAccountButton).toBeVisible();
  }
}
