import {
  expect,
  type Page,
  PageAssertionsToHaveScreenshotOptions,
} from '@playwright/test';

export abstract class RNBPage {
  readonly page: Page;
  readonly path: string;

  protected constructor(page: Page, path: string) {
    this.page = page;
    this.path = path;
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
}
