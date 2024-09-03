import { expect, Locator, test as base } from '@playwright/test';
import { ComponentTestUtil } from '@/tests/fixtures/utils/components/_component';

type Args = {
  newsletterField?: Locator;
  newsletterButton?: Locator;
};

class NewsletterTestUtil extends ComponentTestUtil<Args> {
  async run({
    newsletterField = this.page.locator('[value="S\'inscrire"]'),
    newsletterButton = this.page.getByPlaceholder('Votre adresse email'),
  }: Args) {
    const email = 'email123@beta.gouv.fr';
    await this.page.route(/sibforms\.com/, (route) =>
      route.fulfill({
        status: 200,
        body: JSON.stringify({}),
      }),
    );

    await expect(newsletterField).toBeVisible();
    await expect(newsletterButton).toBeVisible();
    await newsletterField.fill(email);
    const [request] = await Promise.all([
      this.page.waitForRequest(/sibforms\.com/),
      newsletterButton.click(),
    ]);
    expect(request.url()).toContain('sibforms.com');
    expect(request.method()).toBe('POST');
    expect(request.postData()).toContain(email);
  }
}

export const testWithNewsletter = base.extend<{
  newsletterTestUtil: NewsletterTestUtil;
}>({
  newsletterTestUtil: async ({ page }, use) =>
    use(new NewsletterTestUtil(page)),
});
