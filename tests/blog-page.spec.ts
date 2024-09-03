import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe("Page d'actualités", () => {
  test('doit contenir les éléments nécessaires', async ({ blogPage }) => {
    await expect(blogPage.pressTitle).toBeVisible();
    await expect(blogPage.followUsTitle).toBeVisible();
    await expect(blogPage.newsletterField).toBeVisible();
    await expect(blogPage.newsletterButton).toBeVisible();

    const blogPostsNb = await blogPage.blogPosts.count();
    expect(blogPostsNb).toBeGreaterThan(0);
  });

  test("doit contenir un formulaire d'inscription à l'infolettre fonctionnel", async ({
    newsletterTestUtil,
    blogPage,
  }) => {
    await newsletterTestUtil.run({
      newsletterField: blogPage.newsletterField,
      newsletterButton: blogPage.newsletterButton,
    });
  });
});
