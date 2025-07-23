import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe('Edition', () => {
  test.describe('Désactivation', () => {
    test('doit pouvoir désactiver un bâtiment', async ({
      editionPage,
      httpMocker,
    }) => {
      await editionPage.goToBuilding('NHDE2W8HE3X3');
      await expect(editionPage.panel).toBeVisible();
      await httpMocker.mockAPIRequest(
        'PATCH',
        '/buildings/NHDE2W8HE3X3/?from=site',
        { is_active: false },
        { status: 204 },
        true,
      );
      await editionPage.deactivateBuilding();
      await expect(editionPage.toaster.getByText(/désactivé/i)).toBeVisible();
    });
  });
});
