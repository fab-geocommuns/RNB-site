import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';

// Accounts and codes understood by the `/login/` stub of tests/mock-server
const PASSWORD = 'mot-de-passe';
const INVALID_CODE_MESSAGE =
  'Code incorrect ou expiré. Patientez quelques secondes avant de réessayer.';
const BACKUP_CODES = Array.from({ length: 10 }, (_, i) => `code${i}abc`);
const MFA_SETUP = {
  otpauth_uri:
    'otpauth://totp/RNB%3Aenrole?secret=JBSWY3DPEHPK3PXP&algorithm=SHA1&digits=6&period=30&issuer=RNB',
  secret: 'JBSWY3DPEHPK3PXP',
  qr_code_svg:
    '<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="21" height="21"><path d="M0 0h21v21H0z"/></svg>',
};

const THROTTLED_MESSAGE = 'Trop de tentatives. Réessayez dans une minute.';
const QR_CODE_ALT =
  "QR code à scanner avec votre application d'authentification";

const logIn = async ({
  page,
  email,
  password = PASSWORD,
}: {
  page: Page;
  email: string;
  password?: string;
}) => {
  await page.goto('/connexion?redirect=/a-propos');
  // The newsletter modal of the footer has its own email field
  const form = page.getByTestId('login-form');
  await form.getByLabel('Email').fill(email);
  await form.getByLabel('Mot de passe').fill(password);
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
};

const getSession = async (page: Page) =>
  (await page.request.get('/api/auth/session')).json();

const codeField = (page: Page) => page.getByLabel('Code à 6 chiffres');

const submitCode = (page: Page) =>
  page.getByRole('button', { name: 'Se connecter', exact: true }).click();

// An HTML error page on a next-auth callback: `signIn` fails to parse it and throws
const failNextAuthCallback = ({
  page,
  provider,
}: {
  page: Page;
  provider: string;
}) =>
  page.route(`**/api/auth/callback/${provider}`, (route) =>
    route.fulfill({
      status: 502,
      contentType: 'text/html',
      body: '<html><body>Bad Gateway</body></html>',
    }),
  );

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

test.describe('Connexion avec double authentification', () => {
  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
  });

  test('sans double authentification, la connexion se fait avec le mot de passe', async ({
    page,
  }) => {
    await logIn({ page, email: 'sans-mfa@exemple.fr' });

    await page.waitForURL((url) => url.pathname === '/a-propos');
    const session = await getSession(page);
    expect(session.username).toBe('sans-mfa');
    expect(session.accessToken).toBe('jeton-connexion');
  });

  test('un mot de passe incorrect affiche le message habituel', async ({
    page,
  }) => {
    await logIn({
      page,
      email: 'sans-mfa@exemple.fr',
      password: 'mauvais',
    });

    await expect(
      page.getByText('Email ou mot de passe incorrect'),
    ).toBeVisible();
    expect(await getSession(page)).toEqual({});
  });

  test('le code de l’application est demandé après le mot de passe', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await expect(codeField(page)).toBeVisible();
    expect(await getSession(page)).toEqual({});

    await codeField(page).fill('123456');
    await submitCode(page);

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('mfa');
  });

  test('un code de secours permet aussi de se connecter', async ({ page }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('k3m7qz2a');
    await submitCode(page);

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('mfa');
  });

  test('un code invalide affiche une erreur et laisse le champ affiché', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('000000');
    await submitCode(page);

    await expect(page.getByText(INVALID_CODE_MESSAGE)).toBeVisible();
    await expect(codeField(page)).toBeVisible();
    await expect(codeField(page)).toHaveValue('');
    expect(await getSession(page)).toEqual({});
  });

  test('enrôlement obligatoire : QR code, clé, premier code puis codes de secours', async ({
    page,
    httpMocker,
  }) => {
    const credentials = {
      username: 'enrolement-obligatoire@exemple.fr',
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
        body: {
          id: 7,
          token: 'jeton-enrole',
          username: 'enrole',
          groups: ['Contributors'],
          backup_codes: BACKUP_CODES,
        },
      },
      { ...credentials, otp: '654321' },
    );

    const setupCalls = countPosts({ page, path: '/auth/mfa/setup/' });
    const confirmCalls = countPosts({ page, path: '/auth/mfa/confirm/' });

    await logIn({ page, email: credentials.username });

    const qrCode = page.getByAltText(QR_CODE_ALT);
    await expect(qrCode).toBeVisible();
    await expect(
      page.getByRole('heading', {
        name: 'Configurer la double authentification',
      }),
    ).toBeFocused();
    expect(setupCalls.count).toBe(1);
    expect(await qrCode.getAttribute('src')).toMatch(/^data:image\/svg\+xml,/);
    await expect(page.getByText(MFA_SETUP.secret)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Plus tard' })).toHaveCount(
      0,
    );

    await codeField(page).fill('654321');
    // A second click while the confirmation is pending sends nothing
    await page.getByRole('button', { name: 'Activer' }).dblclick();

    await expect(
      page.getByText('Conservez ces codes de secours en lieu sûr.', {
        exact: false,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Codes de secours' }),
    ).toBeFocused();
    expect(confirmCalls.count).toBe(1);
    await expect(
      page.getByTestId('backup-codes').getByRole('listitem'),
    ).toHaveText(BACKUP_CODES);
    // Codes are shown first, "Continuer" waits for the session
    await expect(page.getByRole('button', { name: 'Continuer' })).toBeEnabled();
    // Identity comes from /auth/users/me/, called with the token returned by the confirmation
    const session = await getSession(page);
    expect(session.username).toBe('enrole');
    expect(session.groups).toEqual(['Contributors']);
    expect(session.accessToken).toBe('jeton-enrole');

    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.waitForURL((url) => url.pathname === '/a-propos');
  });

  test('enrôlement obligatoire : un premier code invalide affiche une erreur', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      status: 401,
      body: {
        error: 'mfa_invalid',
        detail:
          "Code d'authentification invalide ou expiré. Patientez quelques secondes avant de réessayer.",
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('000000');
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(page.getByText(INVALID_CODE_MESSAGE)).toBeVisible();
    await expect(codeField(page)).toBeVisible();
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
    expect(await getSession(page)).toEqual({});
  });

  test('enrôlement suggéré : « Plus tard » mène à la page demandée, connecté', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });

    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();

    await page.getByRole('button', { name: 'Plus tard' }).click();

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('enrolement-suggere');
  });

  test('trop de tentatives au mot de passe : message dédié', async ({
    page,
  }) => {
    await logIn({ page, email: 'trop-de-tentatives@exemple.fr' });

    await expect(page.getByText(THROTTLED_MESSAGE)).toBeVisible();
    await expect(page.getByText('Email ou mot de passe incorrect')).toHaveCount(
      0,
    );
    expect(await getSession(page)).toEqual({});
  });

  test('trop de tentatives au code : message dédié, champ conservé', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('429429');
    await submitCode(page);

    await expect(page.getByText(THROTTLED_MESSAGE)).toBeVisible();
    await expect(page.getByText('Email ou mot de passe incorrect')).toHaveCount(
      0,
    );
    await expect(codeField(page)).toBeVisible();
    expect(await getSession(page)).toEqual({});
  });

  test('au code, une erreur du serveur affiche un message générique', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('500500');
    await submitCode(page);

    await expect(
      page.getByText('La connexion a échoué. Réessayez.'),
    ).toBeVisible();
    await expect(page.getByText('Email ou mot de passe incorrect')).toHaveCount(
      0,
    );
    await expect(codeField(page)).toBeVisible();
    expect(await getSession(page)).toEqual({});
  });

  test('« Retour » ramène à l’email et au mot de passe, sans code ni erreur', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('000000');
    await submitCode(page);
    await expect(page.getByText(INVALID_CODE_MESSAGE)).toBeVisible();

    await page.getByRole('button', { name: 'Retour' }).click();

    const form = page.getByTestId('login-form');
    await expect(form.getByLabel('Email')).toBeFocused();
    await expect(form.getByLabel('Email')).toHaveValue('mfa@exemple.fr');
    await expect(form.getByLabel('Mot de passe')).toHaveValue(PASSWORD);
    await expect(page.getByText(INVALID_CODE_MESSAGE)).toHaveCount(0);

    await submitCode(page);
    await expect(codeField(page)).toHaveValue('');
    await expect(page.getByText(INVALID_CODE_MESSAGE)).toHaveCount(0);
  });

  test('enrôlement : après un échec de la configuration, « Plus tard » et « Réessayer » restent proposés', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      status: 429,
      body: { detail: 'Requête limitée.' },
    });
    // Registered after the mocker, so it runs first: only the first setup fails
    let setupCalls = 0;
    await page.route(
      (url) => url.pathname.endsWith('/auth/mfa/setup/'),
      (route) =>
        setupCalls++ === 0
          ? route.fulfill({ status: 429, json: { detail: 'Requête limitée.' } })
          : route.fallback(),
    );

    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });

    await expect(page.getByText(THROTTLED_MESSAGE)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Plus tard' })).toBeVisible();

    await page.getByRole('button', { name: 'Réessayer' }).click();
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await expect(page.getByText(THROTTLED_MESSAGE)).toHaveCount(0);

    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();
    await expect(page.getByText(THROTTLED_MESSAGE)).toBeVisible();
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
  });

  test('enrôlement : une configuration expirée côté serveur affiche un nouveau QR code', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      status: 400,
      body: {
        error: 'mfa_setup_not_started',
        detail: "Commencez par configurer l'application d'authentification.",
      },
    });
    const setupCalls = countPosts({ page, path: '/auth/mfa/setup/' });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(
      page.getByText(
        "Commencez par configurer l'application d'authentification.",
      ),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await expect(codeField(page)).toHaveValue('');
    expect(setupCalls.count).toBe(2);
  });

  test('enrôlement obligatoire : si la session ne s’ouvre pas, les codes restent affichés et la reconnexion est proposée', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    // Unknown to the `/auth/users/me/` stub: the `api-token` sign-in fails
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      body: {
        id: 7,
        token: 'jeton-inconnu',
        username: 'enrole',
        groups: ['Contributors'],
        backup_codes: BACKUP_CODES,
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(
      page.getByText(
        'Votre application est configurée, mais la connexion a échoué.',
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page.getByTestId('backup-codes').getByRole('listitem'),
    ).toHaveText(BACKUP_CODES);
    await expect(page.getByRole('button', { name: 'Continuer' })).toHaveCount(
      0,
    );
    expect(await getSession(page)).toEqual({});

    await page.getByRole('button', { name: 'Se reconnecter' }).click();

    const form = page.getByTestId('login-form');
    await expect(form.getByLabel('Email')).toHaveValue(
      'enrolement-obligatoire@exemple.fr',
    );
    // The password is dropped once the backup codes are shown
    await expect(form.getByLabel('Mot de passe')).toHaveValue('');
  });

  test('enrôlement obligatoire : si l’ouverture de session lève une erreur, les codes restent affichés', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      body: {
        id: 7,
        token: 'jeton-enrole',
        username: 'enrole',
        groups: ['Contributors'],
        backup_codes: BACKUP_CODES,
      },
    });
    await failNextAuthCallback({ page, provider: 'api-token' });
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(
      page.getByTestId('backup-codes').getByRole('listitem'),
    ).toHaveText(BACKUP_CODES);
    await expect(
      page.getByText(
        'Votre application est configurée, mais la connexion a échoué.',
        { exact: false },
      ),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Se reconnecter' }),
    ).toBeVisible();
    expect(pageErrors).toEqual([]);
    expect(await getSession(page)).toEqual({});
  });

  test('enrôlement : une application déjà configurée renvoie vers la connexion avec le code', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    // Enrollment finished in another tab, or a lost confirmation response
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      status: 409,
      body: {
        error: 'mfa_already_configured',
        detail: "Une application d'authentification est déjà configurée.",
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(
      page.getByText(
        "Une application d'authentification est déjà configurée. Connectez-vous avec votre code.",
      ),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    await expect(codeField(page)).toHaveCount(0);

    await page.getByRole('button', { name: 'Se reconnecter' }).click();

    const form = page.getByTestId('login-form');
    await expect(form.getByLabel('Email')).toBeFocused();
    await expect(form.getByLabel('Email')).toHaveValue(
      'enrolement-obligatoire@exemple.fr',
    );
    await expect(form.getByLabel('Mot de passe')).toHaveValue(PASSWORD);
  });

  test('enrôlement : identifiants refusés par l’API, la reconnexion est proposée', async ({
    page,
    httpMocker,
  }) => {
    const refusal =
      "Impossible de se connecter avec les informations d'identification fournies.";
    // Password changed since the login
    httpMocker.post('/auth/mfa/setup/?from=site', {
      status: 400,
      body: { non_field_errors: [refusal] },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });

    await expect(
      page.getByText('Email ou mot de passe incorrect. Reconnectez-vous.'),
    ).toBeVisible();
    await expect(page.getByText(refusal, { exact: false })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Réessayer' })).toHaveCount(
      0,
    );

    await page.getByRole('button', { name: 'Se reconnecter' }).click();
    await expect(
      page.getByTestId('login-form').getByLabel('Email'),
    ).toBeFocused();
  });

  test('« Retour » est inactif pendant l’envoi du code', async ({ page }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await expect(codeField(page)).toBeVisible();

    let releaseLogin = () => {};
    const loginHeld = new Promise<void>((resolve) => {
      releaseLogin = resolve;
    });
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await loginHeld;
      await route.fallback();
    });

    await codeField(page).fill('000000');
    await submitCode(page);
    const back = page.getByRole('button', { name: 'Retour' });
    await expect(back).toBeDisabled();

    releaseLogin();
    await expect(page.getByText(INVALID_CODE_MESSAGE)).toBeVisible();
    await expect(back).toBeEnabled();
  });

  test('une erreur inattendue à la connexion affiche un message', async ({
    page,
  }) => {
    await failNextAuthCallback({ page, provider: 'credentials' });

    await logIn({ page, email: 'sans-mfa@exemple.fr' });

    await expect(
      page.getByText('La connexion a échoué. Réessayez.'),
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Se connecter', exact: true }),
    ).toBeEnabled();
  });
});
