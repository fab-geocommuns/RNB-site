import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';
import { MOCK_HOST, MOCK_PORT } from '@/tests/config';

// Tokens understood by the `/auth/mfa/status/` stub of tests/mock-server
const MFA_USER = { username: 'mfa', accessToken: 'jeton-mfa' };
const USER_WITHOUT_APP = {
  username: 'sans-application',
  accessToken: 'jeton-sans-application',
};

const PAGE_PATH = '/mon-compte/securite';
const PASSWORD = 'mot-de-passe';
const BACKUP_CODES = Array.from({ length: 10 }, (_, i) => `code${i}abc`);
const MFA_SETUP = {
  otpauth_uri:
    'otpauth://totp/RNB%3Amfa?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30&issuer=RNB',
  secret: 'JBSWY3DPEHPK3PXP',
  qr_code_svg:
    '<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><path d="M0 0h21v21H0z"/></svg>',
};

const INVALID_CODE_MESSAGE =
  'Code incorrect ou expiré. Patientez quelques secondes avant de réessayer.';
const THROTTLED_MESSAGE = 'Trop de tentatives. Réessayez dans une minute.';
const QR_CODE_ALT =
  "QR code à scanner avec votre application d'authentification";
const API_TOKEN_RENEWED = "Votre clé d'API a aussi été renouvelée";
const REPLACEMENT_INTRO =
  "Scannez ce QR code avec votre nouvelle application. Votre application actuelle reste active jusqu'à la confirmation.";
const ALREADY_CONFIGURED_DETAIL =
  "Une application d'authentification est déjà configurée. Contactez le support pour la réinitialiser.";
const SETUP_NOT_STARTED_DETAIL =
  "Commencez par configurer l'application d'authentification.";
const BACKUP_CODE_SPENT_HINT =
  'Un code de secours saisi ici ne servira plus, même si vous annulez ensuite.';

const getSession = async (page: Page) =>
  (await page.request.get('/api/auth/session')).json();

const passwordField = (page: Page) =>
  page.getByLabel('Mot de passe', { exact: true });
const codeField = (page: Page) => page.getByLabel('Code à 6 chiffres');

// Browser-side POST requests to an API path, counted as they leave the page
const countPosts = ({ page, path }: { page: Page; path: string }) => {
  const counter = { count: 0 };
  page.on('request', (request) => {
    if (
      request.method() === 'POST' &&
      new URL(request.url()).pathname.endsWith(path)
    ) {
      counter.count += 1;
    }
  });
  return counter;
};

// What GET /auth/mfa/status/ answers for this token, as if changed by another session
const setMfaStatus = async ({
  page,
  accessToken,
  configured,
}: {
  page: Page;
  accessToken: string;
  configured: boolean;
}) => {
  const response = await page.request.post(
    `http://${MOCK_HOST}:${MOCK_PORT}/__mfa-status`,
    {
      data: { accessToken, configured },
    },
  );
  expect(response.ok()).toBe(true);
};

const openSecurityPage = async (page: Page) => {
  await page.goto(PAGE_PATH);
  await expect(
    page.getByRole('heading', { name: 'Sécurité', exact: true }),
  ).toBeVisible();
};

const fillProof = async ({ page, otp }: { page: Page; otp?: string }) => {
  await passwordField(page).fill(PASSWORD);
  if (otp !== undefined) await codeField(page).fill(otp);
};

test.describe('Sécurité dans Mon compte', () => {
  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
  });

  test('le lien Sécurité mène à la page', async ({ page, auth }) => {
    await auth.signIn(MFA_USER);
    await page.goto('/mon-compte/notifications');

    await page.getByRole('link', { name: 'Sécurité', exact: true }).click();

    await page.waitForURL((url) => url.pathname === PAGE_PATH);
    await expect(
      page.getByRole('heading', { name: 'Sécurité', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: "Changer d'application" }),
    ).toBeVisible();
  });

  test("changer d'application avec le code actuel", async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    const credentials = { username: MFA_USER.username, password: PASSWORD };
    httpMocker.post(
      '/auth/mfa/replace/setup/?from=site',
      { body: MFA_SETUP },
      { ...credentials, otp: '123456' },
    );
    httpMocker.post(
      '/auth/mfa/replace/confirm/?from=site',
      { body: { backup_codes: BACKUP_CODES } },
      { ...credentials, otp: '654321' },
    );
    const setupCalls = countPosts({ page, path: '/auth/mfa/replace/setup/' });

    await openSecurityPage(page);
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await expect(page.getByText(BACKUP_CODE_SPENT_HINT)).toBeVisible();
    await fillProof({ page, otp: '123456' });
    // A second click while the proof is pending sends nothing
    await page.getByRole('button', { name: 'Vérifier' }).dblclick();

    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Configurer la nouvelle application' }),
    ).toBeFocused();
    await expect(page.getByText(REPLACEMENT_INTRO)).toBeVisible();
    await expect(page.getByText(MFA_SETUP.secret)).toBeVisible();
    expect(setupCalls.count).toBe(1);
    await expect(
      page.getByRole('button', { name: 'Continuer sans activer' }),
    ).toHaveCount(0);

    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
    await expect(
      page.getByRole('heading', { name: 'Codes de secours', exact: true }),
    ).toBeFocused();
    // The API token is kept: no renewal sentence, same session token
    await expect(page.getByText(API_TOKEN_RENEWED)).toHaveCount(0);
    expect((await getSession(page)).accessToken).toBe(MFA_USER.accessToken);

    await page.getByRole('button', { name: 'Terminer' }).click();
    await expect(
      page.getByRole('button', { name: "Changer d'application" }),
    ).toBeVisible();
    expect(new URL(page.url()).pathname).toBe(PAGE_PATH);
  });

  test('le mot de passe vérifié sert à la confirmation, même retapé pendant la vérification', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    const credentials = { username: MFA_USER.username, password: PASSWORD };
    httpMocker.post(
      '/auth/mfa/replace/setup/?from=site',
      { body: MFA_SETUP },
      { ...credentials, otp: '123456' },
    );
    // Answers only to the password checked at the proof step
    httpMocker.post(
      '/auth/mfa/replace/confirm/?from=site',
      { body: { backup_codes: BACKUP_CODES } },
      { ...credentials, otp: '654321' },
    );
    // Holds the proof answer while the user keeps typing
    let releaseSetup = () => {};
    const setupHeld = new Promise<void>((held) =>
      page.route('**/auth/mfa/replace/setup/**', async (route) => {
        await new Promise<void>((release) => {
          releaseSetup = release;
          held();
        });
        await route.fallback();
      }),
    );

    await openSecurityPage(page);
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await fillProof({ page, otp: '123456' });
    await passwordField(page).press('Enter');
    await setupHeld;
    await page.keyboard.type('-modifie');
    releaseSetup();

    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
  });

  test('régénérer les codes de secours', async ({ page, auth, httpMocker }) => {
    await auth.signIn(MFA_USER);
    httpMocker.post(
      '/auth/mfa/backup_codes/?from=site',
      { body: { backup_codes: BACKUP_CODES } },
      { username: MFA_USER.username, password: PASSWORD, otp: 'k3m7qz2a' },
    );

    await openSecurityPage(page);
    await page.getByRole('button', { name: 'Régénérer les codes' }).click();
    // The new codes come with the same answer: nothing to finish afterwards
    await expect(page.getByText(BACKUP_CODE_SPENT_HINT)).toHaveCount(0);
    await fillProof({ page, otp: 'k3m7qz2a' });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
    await expect(
      page.getByRole('heading', { name: 'Codes de secours', exact: true }),
    ).toBeFocused();
    await expect(
      page.getByRole('button', { name: 'Copier les codes' }),
    ).toBeVisible();
    await expect(page.getByText(API_TOKEN_RENEWED)).toHaveCount(0);

    await page.getByRole('button', { name: 'Terminer' }).click();
    await expect(
      page.getByRole('button', { name: 'Régénérer les codes' }),
    ).toBeVisible();
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
  });

  test("code actuel faux au changement d'application", async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    httpMocker.post('/auth/mfa/replace/setup/?from=site', {
      status: 401,
      body: {
        error: 'mfa_invalid',
        detail:
          "Code d'authentification invalide ou expiré. Patientez quelques secondes avant de réessayer.",
      },
    });
    const confirmCalls = countPosts({
      page,
      path: '/auth/mfa/replace/confirm/',
    });

    await openSecurityPage(page);
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await fillProof({ page, otp: '000000' });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(page.getByText(INVALID_CODE_MESSAGE)).toBeVisible();
    await expect(codeField(page)).toHaveValue('');
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
    expect(confirmCalls.count).toBe(0);
  });

  test('trop de tentatives à la régénération', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    httpMocker.post('/auth/mfa/backup_codes/?from=site', {
      status: 429,
      body: { detail: 'Requête limitée.' },
    });

    await openSecurityPage(page);
    await page.getByRole('button', { name: 'Régénérer les codes' }).click();
    await fillProof({ page, otp: '123456' });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(page.getByText(THROTTLED_MESSAGE)).toBeVisible();
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
    await expect(codeField(page)).toBeVisible();
  });

  test('activation : application activée entre-temps, la page affiche le bon état', async ({
    page,
    auth,
    httpMocker,
  }) => {
    const user = {
      username: 'active-ailleurs',
      accessToken: 'jeton-active-ailleurs',
    };
    await setMfaStatus({
      page,
      accessToken: user.accessToken,
      configured: false,
    });
    await auth.signIn(user);
    httpMocker.post('/auth/mfa/setup/?from=site', {
      status: 409,
      body: {
        error: 'mfa_already_configured',
        detail: ALREADY_CONFIGURED_DETAIL,
      },
    });

    await openSecurityPage(page);
    await page
      .getByRole('button', { name: 'Activer la double authentification' })
      .click();
    await setMfaStatus({
      page,
      accessToken: user.accessToken,
      configured: true,
    });
    await fillProof({ page });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(
      page.getByRole('button', { name: "Changer d'application" }),
    ).toBeVisible();
    await expect(page.getByText(ALREADY_CONFIGURED_DETAIL)).toHaveCount(0);
  });

  test('régénération : application supprimée entre-temps, la page affiche le bon état', async ({
    page,
    auth,
    httpMocker,
  }) => {
    const user = {
      username: 'supprimee-ailleurs',
      accessToken: 'jeton-supprimee-ailleurs',
    };
    await setMfaStatus({
      page,
      accessToken: user.accessToken,
      configured: true,
    });
    await auth.signIn(user);
    httpMocker.post('/auth/mfa/backup_codes/?from=site', {
      status: 400,
      body: {
        error: 'mfa_setup_not_started',
        detail: SETUP_NOT_STARTED_DETAIL,
      },
    });

    await openSecurityPage(page);
    await page.getByRole('button', { name: 'Régénérer les codes' }).click();
    await setMfaStatus({
      page,
      accessToken: user.accessToken,
      configured: false,
    });
    await fillProof({ page, otp: '123456' });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(
      page.getByRole('button', { name: 'Activer la double authentification' }),
    ).toBeVisible();
    await expect(page.getByText(SETUP_NOT_STARTED_DETAIL)).toHaveCount(0);
  });

  test('activation sur la page sans application', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(USER_WITHOUT_APP);
    const credentials = {
      username: USER_WITHOUT_APP.username,
      password: PASSWORD,
    };
    httpMocker.post(
      '/auth/mfa/setup/?from=site',
      { body: MFA_SETUP },
      credentials,
    );
    httpMocker.post(
      '/auth/mfa/confirm/?from=site',
      {
        body: { login_code: 'code-enrolement', backup_codes: BACKUP_CODES },
      },
      { ...credentials, otp: '654321' },
    );
    const setupCalls = countPosts({ page, path: '/auth/mfa/setup/' });

    await openSecurityPage(page);
    await page
      .getByRole('button', { name: 'Activer la double authentification' })
      .click();
    await expect(codeField(page)).toHaveCount(0);
    await fillProof({ page });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    expect(setupCalls.count).toBe(1);
    await expect(
      page.getByRole('button', { name: 'Continuer sans activer' }),
    ).toHaveCount(0);

    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer', exact: true }).click();
    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
    await expect(page.getByText(API_TOKEN_RENEWED)).toBeVisible();

    // The page reloads at the same URL: `next dev` can take more than 5 s to
    // render it, so assertions start once its response arrived
    const reloaded = page.waitForResponse(
      (response) =>
        response.request().isNavigationRequest() &&
        new URL(response.url()).pathname === PAGE_PATH,
    );
    await page.getByRole('button', { name: 'Continuer' }).click();
    await reloaded;
    await expect(
      page.getByRole('button', { name: "Changer d'application" }),
    ).toBeVisible();
    expect(setupCalls.count).toBe(1);
    // The confirmation renews the API token: the session is opened again with it
    expect((await getSession(page)).accessToken).toBe('jeton-enrole');
  });

  test('activation : mot de passe faux, message sur le champ', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(USER_WITHOUT_APP);
    httpMocker.post('/auth/mfa/setup/?from=site', {
      status: 400,
      body: {
        non_field_errors: [
          "Impossible de se connecter avec les informations d'identification fournies.",
        ],
      },
    });

    await openSecurityPage(page);
    await page
      .getByRole('button', { name: 'Activer la double authentification' })
      .click();
    await fillProof({ page });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(page.getByText('Mot de passe incorrect.')).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    expect(new URL(page.url()).pathname).toBe(PAGE_PATH);
    expect((await getSession(page)).accessToken).toBe(
      USER_WITHOUT_APP.accessToken,
    );
  });

  test('ProConnect : lien masqué et message d’information', async ({
    page,
    auth,
  }) => {
    // The default token is unknown to the mock: an API call would crash the page
    await auth.signIn({ authProvider: 'proconnect' });

    await page.goto('/mon-compte/notifications');
    await expect(
      page.getByRole('heading', { name: 'Notifications' }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Sécurité', exact: true }),
    ).toHaveCount(0);

    await page.goto(PAGE_PATH);
    await expect(
      page.getByText(
        'La double authentification de votre compte est gérée par ProConnect.',
      ),
    ).toBeVisible();
    await expect(passwordField(page)).toHaveCount(0);
  });

  test('visiteur anonyme redirigé vers la connexion', async ({ page }) => {
    await page.goto(PAGE_PATH);

    await page.waitForURL(
      (url) =>
        url.pathname === '/connexion' &&
        url.searchParams.get('redirect') === PAGE_PATH,
    );
  });

  test('application en attente disparue : Recommencer ramène au formulaire, Annuler à la vue d’ensemble', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    httpMocker.post('/auth/mfa/replace/setup/?from=site', { body: MFA_SETUP });
    // Admin reset, or a replacement finished in another tab
    httpMocker.post('/auth/mfa/replace/confirm/?from=site', {
      status: 400,
      body: {
        error: 'mfa_setup_not_started',
        detail: "Commencez par configurer l'application d'authentification.",
      },
    });

    await openSecurityPage(page);
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await fillProof({ page, otp: '123456' });
    await page.getByRole('button', { name: 'Vérifier' }).click();
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(
      page.getByText('Cette opération ne peut plus aboutir. Recommencez.'),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    await expect(page.getByText(REPLACEMENT_INTRO)).toHaveCount(0);

    await page.getByRole('button', { name: 'Recommencer' }).click();
    await expect(
      page.getByRole('heading', { name: "Changer d'application" }),
    ).toBeFocused();
    await expect(passwordField(page)).toHaveValue('');
    await expect(codeField(page)).toHaveValue('');

    // A new pending app, abandoned with « Annuler »: back to the overview, nothing confirmed
    const confirmCalls = countPosts({
      page,
      path: '/auth/mfa/replace/confirm/',
    });
    await fillProof({ page, otp: '234567' });
    await page.getByRole('button', { name: 'Vérifier' }).click();
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await page.getByRole('button', { name: 'Annuler' }).click();

    await expect(
      page.getByRole('button', { name: "Changer d'application" }),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    expect(confirmCalls.count).toBe(0);
  });

  test('« Annuler » au formulaire de preuve revient à la vue d’ensemble sans rien envoyer', async ({
    page,
    auth,
  }) => {
    await auth.signIn(MFA_USER);
    const setupCalls = countPosts({ page, path: '/auth/mfa/replace/setup/' });

    await openSecurityPage(page);
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await fillProof({ page, otp: '123456' });
    await page.getByRole('button', { name: 'Annuler' }).click();

    await expect(
      page.getByRole('button', { name: "Changer d'application" }),
    ).toBeVisible();
    await expect(passwordField(page)).toHaveCount(0);
    expect(setupCalls.count).toBe(0);

    // Reopened, the form is empty
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await expect(passwordField(page)).toHaveValue('');
    await expect(codeField(page)).toHaveValue('');
  });

  test('preuve refusée, erreur du serveur : message dans l’alerte, formulaire conservé', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    httpMocker.post('/auth/mfa/backup_codes/?from=site', {
      status: 500,
      body: {},
    });

    await openSecurityPage(page);
    await page.getByRole('button', { name: 'Régénérer les codes' }).click();
    await fillProof({ page, otp: '123456' });
    await page.getByRole('button', { name: 'Vérifier' }).click();

    await expect(
      page.getByText('Une erreur est survenue. Merci de réessayer plus tard.'),
    ).toBeVisible();
    await expect(page.getByText('Mot de passe incorrect.')).toHaveCount(0);
    await expect(page.getByText(INVALID_CODE_MESSAGE)).toHaveCount(0);
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
    await expect(passwordField(page)).toHaveValue(PASSWORD);
  });

  test('mot de passe refusé à la confirmation du changement : Recommencer, sans déconnexion', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(MFA_USER);
    httpMocker.post('/auth/mfa/replace/setup/?from=site', { body: MFA_SETUP });
    // Password changed from another session between the two steps
    httpMocker.post('/auth/mfa/replace/confirm/?from=site', {
      status: 400,
      body: {
        non_field_errors: [
          "Impossible de se connecter avec les informations d'identification fournies.",
        ],
      },
    });

    await openSecurityPage(page);
    await page.getByRole('button', { name: "Changer d'application" }).click();
    await fillProof({ page, otp: '123456' });
    await page.getByRole('button', { name: 'Vérifier' }).click();
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Confirmer' }).click();

    await expect(
      page.getByText('Cette opération ne peut plus aboutir. Recommencez.'),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: 'Se reconnecter' }),
    ).toHaveCount(0);
    expect((await getSession(page)).accessToken).toBe(MFA_USER.accessToken);

    await page.getByRole('button', { name: 'Recommencer' }).click();
    await expect(
      page.getByRole('heading', { name: "Changer d'application" }),
    ).toBeFocused();
    await expect(passwordField(page)).toHaveValue('');
  });

  test('activation : si la session ne se rouvre pas, les codes restent affichés et « Se reconnecter » ramène à la page', async ({
    page,
    auth,
    httpMocker,
  }) => {
    await auth.signIn(USER_WITHOUT_APP);
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    // Refused by the exchange stub: the `mfa-enrollment` sign-in fails
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      body: { login_code: 'code-inconnu', backup_codes: BACKUP_CODES },
    });

    await openSecurityPage(page);
    await page
      .getByRole('button', { name: 'Activer la double authentification' })
      .click();
    await fillProof({ page });
    await page.getByRole('button', { name: 'Vérifier' }).click();
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer', exact: true }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(
      page.getByText(
        'Votre application est configurée, mais la connexion a échoué.',
        { exact: false },
      ),
    ).toBeVisible();
    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );

    await page.getByRole('button', { name: 'Se reconnecter' }).click();
    await page.waitForURL(
      (url) =>
        url.pathname === '/connexion' &&
        url.searchParams.get('redirect') === PAGE_PATH,
    );
    expect(await getSession(page)).toEqual({});
  });

  for (const { failure, user } of [
    {
      failure: 'jeton refusé par l’API',
      user: { username: 'mfa', accessToken: 'jeton-inconnu' },
    },
    {
      failure: 'réponse sans état',
      user: { username: 'mfa', accessToken: 'jeton-etat-illisible' },
    },
    {
      failure: 'session sans nom d’utilisateur',
      user: { username: '', accessToken: MFA_USER.accessToken },
    },
  ]) {
    test(`page d’erreur du site : ${failure}`, async ({ page, auth }) => {
      await auth.signIn(user);

      await page.goto(PAGE_PATH);

      await expect(
        page.getByRole('heading', { name: 'Erreur inattendue' }),
      ).toBeVisible();
      await expect(passwordField(page)).toHaveCount(0);
    });
  }
});
