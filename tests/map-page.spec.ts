import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';

test.describe('Carte', () => {
  test('doit contenir les éléments nécessaires', async ({ mapPage }) => {
    await expect(mapPage.map).toBeVisible();
  });
});
