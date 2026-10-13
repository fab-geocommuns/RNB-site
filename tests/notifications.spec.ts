import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';

test.describe('Préférences de notifications dans Mon compte', () => {
  const PREFERENCES_PATH = '/notifications/preferences/?from=site';

  test.beforeEach(async ({ httpMocker, auth }) => {
    await httpMocker.install();
    await auth.signIn();
  });

  const TOGGLE_LABEL =
    'Recevoir un email quand un de mes signalements est traité, refusé ou commenté';
  const toggle = (page: Page) =>
    page.getByRole('checkbox', { name: TOGGLE_LABEL });
  // The DSFR label covers the checkbox and receives the click.
  const clickToggle = async (page: Page) => {
    await expect(toggle(page)).toBeEnabled();
    await page.getByText(TOGGLE_LABEL).click();
  };

  test("se désabonne en basculant l'interrupteur", async ({
    page,
    httpMocker,
  }) => {
    httpMocker.on(
      'PUT',
      PREFERENCES_PATH,
      { body: { subscribed: false } },
      { expectBody: { subscribed: false } },
    );

    await page.goto('/mon-compte/notifications');
    await page.waitForLoadState('networkidle');
    await expect(toggle(page)).toBeChecked();

    const put = page.waitForRequest(
      (request) =>
        request.method() === 'PUT' &&
        request.url().includes('/notifications/preferences/'),
    );
    await clickToggle(page);

    expect((await put).postDataJSON()).toEqual({ subscribed: false });
    await expect(toggle(page)).not.toBeChecked();
    await expect(toggle(page)).toBeEnabled();
  });

  test("remet l'interrupteur et affiche une erreur si l'enregistrement échoue", async ({
    page,
    httpMocker,
  }) => {
    httpMocker.on('PUT', PREFERENCES_PATH, { status: 500, body: {} });

    await page.goto('/mon-compte/notifications');
    await page.waitForLoadState('networkidle');
    await clickToggle(page);

    await expect(page.getByText(UNEXPECTED_ERROR_MESSAGE)).toBeVisible();
    await expect(toggle(page)).toBeChecked();
  });
});
