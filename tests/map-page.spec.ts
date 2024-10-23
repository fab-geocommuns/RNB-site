import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe('Carte', () => {
  test('doit contenir les éléments nécessaires', async ({
    mapPage,
    browserName,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    await expect(mapPage.map).toBeVisible();
  });
});
