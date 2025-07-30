import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe('Edition', () => {
  test.describe('Désactivation', () => {
    test('doit pouvoir désactiver un bâtiment', async ({
      browserName,
      editionPage,
      httpMocker,
    }) => {
      test.skip(
        browserName === 'firefox',
        'Pas de support de WebGL2 sur Firefox headless',
      );

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
