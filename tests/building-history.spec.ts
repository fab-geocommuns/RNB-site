import { test } from '@/tests/fixtures';
import { expect } from '@playwright/test';

// The history is fetched server-side: responses come from tests/mock-server
test.describe('Historique du bâtiment', () => {
  test('un bâtiment inconnu de l’API affiche la page introuvable', async ({
    page,
  }) => {
    await page.goto('/batiments/INCONNU/historique');
    await expect(
      page.getByRole('heading', { name: 'Bâtiment non trouvé' }),
    ).toBeVisible();
  });

  test('une erreur de l’API affiche une page d’erreur, pas une 404', async ({
    page,
  }) => {
    await page.goto('/batiments/ERREURAPI/historique');
    await expect(
      page.getByRole('heading', { name: 'Historique indisponible' }),
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Bâtiment non trouvé' }),
    ).toHaveCount(0);
  });
});
