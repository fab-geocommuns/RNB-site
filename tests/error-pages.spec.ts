import { test } from '@/tests/fixtures';
import { expect } from '@playwright/test';

// Blog articles are fetched server-side: Ghost responses come from tests/mock-server
test.describe("Pages d'erreur", () => {
  test('une URL inconnue affiche la page introuvable du site', async ({
    page,
  }) => {
    const response = await page.goto('/cette-page-n-existe-pas');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Page non trouvée' }),
    ).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();

    await page.getByRole('link', { name: "Page d'accueil" }).click();
    await expect(page).toHaveURL('/');
  });

  test('un article de blog inconnu répond 404', async ({ page }) => {
    const response = await page.goto('/blog/article-qui-n-existe-pas');
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: 'Page non trouvée' }),
    ).toBeVisible();
  });

  test('une erreur serveur affiche la page d’erreur du site', async ({
    page,
  }) => {
    await page.goto('/blog/erreur-ghost');
    await expect(
      page.getByRole('heading', { name: 'Erreur inattendue' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });
});
