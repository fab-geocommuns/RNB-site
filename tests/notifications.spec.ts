import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';

// Server actions are POSTs carrying the Next-Action header.
const countServerActionCalls = (page: Page) => {
  const calls = { count: 0 };
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.headers()['next-action']) {
      calls.count += 1;
    }
  });
  return calls;
};

test.describe('Désinscription des notifications par lien email', () => {
  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
  });

  test("ne désinscrit qu'au clic et affiche l'adresse désinscrite", async ({
    page,
  }) => {
    const actionCalls = countServerActionCalls(page);

    await page.goto('/notifications/desinscription?token=jeton-valide');
    await page.waitForLoadState('networkidle');

    const button = page.getByRole('button', { name: 'Me désinscrire' });
    await expect(button).toBeVisible();
    expect(actionCalls.count).toBe(0);
    await expect(page.getByText('ne recevra plus')).toHaveCount(0);

    await button.click();

    await expect(
      page.getByText(
        "L'adresse auteur@exemple.fr ne recevra plus ces notifications.",
      ),
    ).toBeVisible();
    await expect(
      page.getByRole('main').getByRole('link', { name: 'Mon compte' }),
    ).toHaveAttribute('href', '/mon-compte/notifications');
    expect(actionCalls.count).toBe(1);
  });

  test('affiche une erreur quand le jeton est invalide', async ({ page }) => {
    await page.goto('/notifications/desinscription?token=jeton-altere');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'Me désinscrire' }).click();

    await expect(
      page.getByText("Ce lien de désinscription n'est pas valide."),
    ).toBeVisible();
  });

  test('affiche une erreur quand le jeton est absent', async ({ page }) => {
    await page.goto('/notifications/desinscription');

    await expect(
      page.getByText('Ce lien de désinscription est incomplet.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Me désinscrire' }),
    ).toHaveCount(0);
  });
});

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
