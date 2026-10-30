import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';

const CREATE_ACCOUNT_PATH = '/auth/users/?from=site';

const fillAndSubmit = async (page: Page) => {
  await page.goto('/inscription');
  // Avant l'hydratation, le clic soumettrait le formulaire en natif
  await page.waitForLoadState('networkidle');
  const form = page.locator('form', {
    has: page.getByRole('button', { name: 'Créer un compte' }),
  });
  await form.locator('input[name="email"]').fill('nouveau@exemple.fr');
  await form.locator('input[name="username"]').fill('nouveau');
  await form.locator('input[name="lastName"]').fill('Dupont');
  await form.locator('input[name="firstName"]').fill('Camille');
  await form.locator('input[name="password"]').fill('motdepasse-solide');
  await form.locator('input[name="confirmPassword"]').fill('motdepasse-solide');
  await form.getByRole('button', { name: 'Créer un compte' }).click();
};

test.describe('Création de compte', () => {
  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
  });

  test('confirme la création et demande de valider l’email', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post(
      CREATE_ACCOUNT_PATH,
      { status: 201, body: {} },
      {
        email: 'nouveau@exemple.fr',
        username: 'nouveau',
        password: 'motdepasse-solide',
        last_name: 'Dupont',
        first_name: 'Camille',
      },
    );

    await fillAndSubmit(page);

    await expect(page.getByText('Votre compte a été créé')).toBeVisible();
  });

  test("affiche l'erreur renvoyée par l'API sous le champ concerné", async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post(CREATE_ACCOUNT_PATH, {
      status: 400,
      body: { email: ['Un compte existe déjà avec cette adresse email.'] },
    });

    await fillAndSubmit(page);

    await expect(
      page.getByText('Un compte existe déjà avec cette adresse email.'),
    ).toBeVisible();
    await expect(page.getByText('Votre compte a été créé')).toHaveCount(0);
  });

  test("affiche un message quand l'erreur porte sur un champ absent du formulaire", async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post(CREATE_ACCOUNT_PATH, {
      status: 400,
      body: { captcha_solution: ['Captcha invalide.'] },
    });

    await fillAndSubmit(page);

    await expect(
      page.getByText('captcha_solution : Captcha invalide.'),
    ).toBeVisible();
  });
});
