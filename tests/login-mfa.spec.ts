import { Page, Route } from '@playwright/test';
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

// Failures of an `/auth/mfa/*` call that the enrollment cannot explain
const SERVER_FAILURES = [
  {
    failure: 'une erreur du serveur affiche son message',
    message: 'Erreur interne.',
    fail: (route: Route) =>
      route.fulfill({ status: 500, json: { detail: 'Erreur interne.' } }),
  },
  {
    failure: 'une coupure réseau affiche un message générique',
    message: 'Une erreur est survenue. Merci de réessayer plus tard.',
    fail: (route: Route) => route.abort(),
  },
];

// `signIn` chains next-auth requests (providers, csrf, callback) that `next dev`
// can take more than 5 s to answer: assertions start once the callback answered
const submitCredentials = async (page: Page) => {
  const answered = page.waitForResponse('**/api/auth/callback/credentials');
  await page.getByRole('button', { name: 'Se connecter', exact: true }).click();
  await answered;
};

type Credentials = { page: Page; email: string; password?: string };

const fillCredentials = async ({
  page,
  email,
  password = PASSWORD,
}: Credentials) => {
  await page.goto('/connexion?redirect=/a-propos');
  // The newsletter modal of the footer has its own email field
  const form = page.getByTestId('login-form');
  await form.getByLabel('Email').fill(email);
  await form.getByLabel('Mot de passe').fill(password);
};

const logIn = async (credentials: Credentials) => {
  await fillCredentials(credentials);
  await submitCredentials(credentials.page);
};

const getSession = async (page: Page) =>
  (await page.request.get('/api/auth/session')).json();

const codeField = (page: Page) => page.getByLabel('Code à 6 chiffres');

const submitCode = submitCredentials;

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
          login_code: 'code-enrolement',
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
    await expect(
      page.getByRole('button', { name: 'Continuer sans activer' }),
    ).toHaveCount(0);

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
    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
    await expect(
      page.getByRole('button', { name: 'Copier les codes' }),
    ).toBeVisible();
    // The session opens on "Continuer", once the codes are on screen
    expect(await getSession(page)).toEqual({});

    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.waitForURL((url) => url.pathname === '/a-propos');

    // Identity and token come from exchanging the login code returned by the confirmation
    const session = await getSession(page);
    expect(session.username).toBe('enrole');
    expect(session.groups).toEqual(['Contributors']);
    expect(session.accessToken).toBe('jeton-enrole');
  });

  test('enrôlement obligatoire : une panne de next-auth après la confirmation ne fait pas perdre les codes', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      body: {
        login_code: 'code-enrolement',
        backup_codes: BACKUP_CODES,
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    // Without its providers, `signIn` leaves the page for next-auth's error page
    await page.route('**/api/auth/providers', (route) =>
      route.fulfill({
        status: 502,
        contentType: 'text/html',
        body: '<html><body>Bad Gateway</body></html>',
      }),
    );
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(page.getByRole('button', { name: 'Continuer' })).toBeEnabled();
    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
    expect(new URL(page.url()).pathname).toBe('/connexion');
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
    await expect(codeField(page)).toHaveValue('');
    await expect(page.getByTestId('backup-codes')).toHaveCount(0);
    expect(await getSession(page)).toEqual({});
  });

  test('enrôlement suggéré : « Continuer sans activer » mène à la page demandée, connecté, et n’est plus proposé dans ce navigateur', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    const setupPosts = countPosts({ page, path: '/auth/mfa/setup/' });

    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });
    const suggestion = page.getByRole('heading', {
      name: 'Vous êtes connecté',
    });
    await expect(suggestion).toBeVisible();
    await expect(suggestion).toBeFocused();
    // No QR code, and no pending key, before the user chooses to set it up
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    expect(setupPosts.count).toBe(0);

    await page.getByRole('button', { name: 'Continuer sans activer' }).click();

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('enrolement-suggere');

    await page.context().clearCookies();
    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('enrolement-suggere');
  });

  test('enrôlement suggéré : « Activer maintenant » affiche le QR code, d’où « Continuer sans activer » mène à la page demandée et n’est plus proposé', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });

    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });
    await page.getByRole('button', { name: 'Activer maintenant' }).click();

    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await page.getByRole('button', { name: 'Continuer sans activer' }).click();

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('enrolement-suggere');

    await page.context().clearCookies();
    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });

    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect((await getSession(page)).username).toBe('enrolement-suggere');
  });

  test('enrôlement suggéré : « Continuer sans activer » est inactif pendant la confirmation, puis « Continuer » rouvre la session avec le jeton renouvelé', async ({
    page,
    httpMocker,
  }) => {
    const credentials = {
      username: 'enrolement-suggere@exemple.fr',
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
          login_code: 'code-enrolement-suggere',
          backup_codes: BACKUP_CODES,
        },
      },
      { ...credentials, otp: '654321' },
    );

    await logIn({ page, email: credentials.username });
    await page.getByRole('button', { name: 'Activer maintenant' }).click();
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();

    let releaseConfirm = () => {};
    const confirmHeld = new Promise<void>((resolve) => {
      releaseConfirm = resolve;
    });
    await page.route('**/auth/mfa/confirm/**', async (route) => {
      await confirmHeld;
      await route.fallback();
    });

    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Continuer sans activer' }),
    ).toBeDisabled();

    releaseConfirm();
    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
    expect((await getSession(page)).accessToken).toBe('jeton-connexion');
    await page.getByRole('button', { name: 'Continuer' }).click();
    await page.waitForURL((url) => url.pathname === '/a-propos');

    // The confirmation renews the API token: the session is opened again with it
    const session = await getSession(page);
    expect(session.username).toBe('enrolement-suggere');
    expect(session.accessToken).toBe('jeton-renouvele');
  });

  test('l’email et le mot de passe sont figés pendant la connexion', async ({
    page,
  }) => {
    let releaseLogin = () => {};
    const loginHeld = new Promise<void>((resolve) => {
      releaseLogin = resolve;
    });
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await loginHeld;
      await route.fallback();
    });

    await fillCredentials({ page, email: 'mfa@exemple.fr' });
    // Settles once the held callback answers
    const loggedIn = submitCredentials(page);
    const form = page.getByTestId('login-form');
    await expect(form.getByLabel('Email')).toBeDisabled();
    await expect(form.getByLabel('Mot de passe')).toBeDisabled();

    releaseLogin();
    await loggedIn;
    await expect(codeField(page)).toBeVisible();
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

  test('trop de tentatives au code : message dédié, champ conservé, effacé par « Retour »', async ({
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

    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(
      page.getByTestId('login-form').getByLabel('Email'),
    ).toBeFocused();
    await expect(page.getByText(THROTTLED_MESSAGE)).toHaveCount(0);
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

  test('« Retour » efface un code saisi sans l’envoyer', async ({ page }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('123456');

    await page.getByRole('button', { name: 'Retour' }).click();
    await submitCode(page);

    await expect(codeField(page)).toHaveValue('');
  });

  test('enrôlement : après un échec de la configuration, « Continuer sans activer » et « Réessayer » restent proposés', async ({
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
    await page.getByRole('button', { name: 'Activer maintenant' }).click();

    await expect(page.getByText(THROTTLED_MESSAGE)).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Continuer sans activer' }),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Réessayer' }).click();
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await expect(page.getByText(THROTTLED_MESSAGE)).toHaveCount(0);

    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer', exact: true }).click();
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
    // Refused by the exchange stub: the `mfa-enrollment` sign-in fails
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      body: {
        login_code: 'code-inconnu',
        backup_codes: BACKUP_CODES,
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();
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
        login_code: 'code-enrolement',
        backup_codes: BACKUP_CODES,
      },
    });
    await failNextAuthCallback({ page, provider: 'mfa-enrollment' });
    const pageErrors: Error[] = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();
    await page.getByRole('button', { name: 'Continuer' }).click();

    await expect(page.getByTestId('backup-codes')).toHaveText(
      BACKUP_CODES.join('\n'),
    );
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
    const submitted = submitCode(page);
    const back = page.getByRole('button', { name: 'Retour' });
    await expect(back).toBeDisabled();

    releaseLogin();
    await submitted;
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

  test('à l’étape du code, seuls le code et « Retour » sont proposés', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });

    const form = page.getByTestId('login-form');
    const forgottenPassword = page.getByRole('link', {
      name: 'Mot de passe oublié ?',
    });
    const signUp = page.getByRole('link', { name: 'Inscrivez-vous' });
    await expect(codeField(page)).toBeFocused();
    await expect(form.getByLabel('Email')).toHaveCount(0);
    await expect(form.getByLabel('Mot de passe')).toHaveCount(0);
    await expect(forgottenPassword).toHaveCount(0);
    await expect(signUp).toHaveCount(0);

    // Same locators, back on the credentials step
    await page.getByRole('button', { name: 'Retour' }).click();
    await expect(forgottenPassword).toBeVisible();
    await expect(signUp).toBeVisible();
  });

  test('enrôlement : une application déjà configurée dès la configuration renvoie vers la connexion', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', {
      status: 409,
      body: {
        error: 'mfa_already_configured',
        detail: "Une application d'authentification est déjà configurée.",
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });

    await expect(
      page.getByText(
        "Une application d'authentification est déjà configurée. Connectez-vous avec votre code.",
      ),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Réessayer' })).toHaveCount(
      0,
    );

    await page.getByRole('button', { name: 'Se reconnecter' }).click();
    await expect(
      page.getByTestId('login-form').getByLabel('Email'),
    ).toBeFocused();
  });

  test('enrôlement : identifiants refusés à la confirmation, le QR code disparaît et la reconnexion est proposée', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    // Password changed between the setup and the confirmation
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      status: 400,
      body: {
        non_field_errors: [
          "Impossible de se connecter avec les informations d'identification fournies.",
        ],
      },
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();

    await expect(
      page.getByText('Email ou mot de passe incorrect. Reconnectez-vous.'),
    ).toBeVisible();
    await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
    await expect(codeField(page)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Réessayer' })).toHaveCount(
      0,
    );

    await page.getByRole('button', { name: 'Se reconnecter' }).click();
    await expect(
      page.getByTestId('login-form').getByLabel('Email'),
    ).toBeFocused();
  });

  for (const { failure, message, fail } of SERVER_FAILURES) {
    test(`enrôlement : à la configuration, ${failure} et « Réessayer »`, async ({
      page,
      httpMocker,
    }) => {
      httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
      // Registered after the mocker, so it runs first: only the first setup fails
      let setupCalls = 0;
      await page.route(
        (url) => url.pathname.endsWith('/auth/mfa/setup/'),
        (route) => (setupCalls++ === 0 ? fail(route) : route.fallback()),
      );

      await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });

      await expect(page.getByText(message)).toBeVisible();
      // A page reload would request a second setup, which the mocker would serve
      expect(setupCalls).toBe(1);
      await expect(page.getByAltText(QR_CODE_ALT)).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Se reconnecter' }),
      ).toHaveCount(0);

      await page.getByRole('button', { name: 'Réessayer' }).click();
      await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
      await expect(page.getByText(message)).toHaveCount(0);
    });
  }

  test('enrôlement : « Activer » reste inactif tant que la configuration n’a pas répondu', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    let releaseSetup = () => {};
    const setupHeld = new Promise<void>((resolve) => {
      releaseSetup = resolve;
    });
    await page.route(
      (url) => url.pathname.endsWith('/auth/mfa/setup/'),
      async (route) => {
        await setupHeld;
        await route.fallback();
      },
    );

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    const activate = page.getByRole('button', { name: 'Activer' });
    await expect(activate).toBeDisabled();

    releaseSetup();
    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await expect(activate).toBeEnabled();
  });

  test('enrôlement obligatoire : un double clic sur « Continuer » n’ouvre la session qu’une fois', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    httpMocker.post('/auth/mfa/confirm/?from=site', {
      body: {
        login_code: 'code-enrolement',
        backup_codes: BACKUP_CODES,
      },
    });
    const signInCalls = countPosts({
      page,
      path: '/api/auth/callback/mfa-enrollment',
    });
    let releaseSignIn = () => {};
    const signInHeld = new Promise<void>((resolve) => {
      releaseSignIn = resolve;
    });
    await page.route('**/api/auth/callback/mfa-enrollment', async (route) => {
      await signInHeld;
      await route.fallback();
    });

    await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
    await codeField(page).fill('654321');
    await page.getByRole('button', { name: 'Activer' }).click();
    const continueButton = page.getByRole('button', { name: 'Continuer' });
    await continueButton.dblclick();
    await expect(continueButton).toBeDisabled();

    releaseSignIn();
    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect(signInCalls.count).toBe(1);
  });

  test('enrôlement suggéré sans nom d’utilisateur : le refus est retenu par email', async ({
    page,
  }) => {
    const suggestion = page.getByRole('heading', {
      name: 'Vous êtes connecté',
    });

    await logIn({ page, email: 'sans-nom-a@exemple.fr' });
    await page.getByRole('button', { name: 'Continuer sans activer' }).click();
    await page.waitForURL((url) => url.pathname === '/a-propos');

    await page.context().clearCookies();
    await logIn({ page, email: 'sans-nom-a@exemple.fr' });
    await page.waitForURL((url) => url.pathname === '/a-propos');

    // Another account without a username still gets the suggestion
    await page.context().clearCookies();
    await logIn({ page, email: 'sans-nom-b@exemple.fr' });
    await expect(suggestion).toBeVisible();
  });

  for (const { failure, message, fail } of SERVER_FAILURES) {
    test(`enrôlement : à la confirmation, ${failure}, le QR code et le code restent affichés`, async ({
      page,
      httpMocker,
    }) => {
      httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
      await page.route(
        (url) => url.pathname.endsWith('/auth/mfa/confirm/'),
        fail,
      );

      await logIn({ page, email: 'enrolement-obligatoire@exemple.fr' });
      await codeField(page).fill('654321');
      const activate = page.getByRole('button', { name: 'Activer' });
      await activate.click();

      await expect(page.getByText(message)).toBeVisible();
      await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
      await expect(codeField(page)).toHaveValue('654321');
      await expect(activate).toBeEnabled();
      await expect(page.getByRole('button', { name: 'Réessayer' })).toHaveCount(
        0,
      );
      await expect(
        page.getByRole('button', { name: 'Se reconnecter' }),
      ).toHaveCount(0);
    });
  }

  test('enrôlement suggéré : identifiants refusés à la configuration, puis reconnexion avec un compte à enrôlement obligatoire, qui ne peut pas le repousser', async ({
    page,
    httpMocker,
  }) => {
    httpMocker.post('/auth/mfa/setup/?from=site', { body: MFA_SETUP });
    // Registered after the mocker, so it runs first: only the first setup fails
    let setupCalls = 0;
    await page.route(
      (url) => url.pathname.endsWith('/auth/mfa/setup/'),
      (route) =>
        setupCalls++ === 0
          ? route.fulfill({
              status: 400,
              json: {
                non_field_errors: [
                  "Impossible de se connecter avec les informations d'identification fournies.",
                ],
              },
            })
          : route.fallback(),
    );
    const postpone = page.getByRole('button', {
      name: 'Continuer sans activer',
    });

    await logIn({ page, email: 'enrolement-suggere@exemple.fr' });
    await page.getByRole('button', { name: 'Activer maintenant' }).click();

    await expect(
      page.getByText('Email ou mot de passe incorrect. Reconnectez-vous.'),
    ).toBeVisible();
    await expect(postpone).toBeVisible();
    await page.getByRole('button', { name: 'Se reconnecter' }).click();

    const form = page.getByTestId('login-form');
    await form.getByLabel('Email').fill('enrolement-obligatoire@exemple.fr');
    await submitCredentials(page);

    await expect(page.getByAltText(QR_CODE_ALT)).toBeVisible();
    await expect(postpone).toHaveCount(0);
  });

  test('à l’étape du code, un second envoi pendant la connexion est ignoré', async ({
    page,
  }) => {
    await logIn({ page, email: 'mfa@exemple.fr' });
    await codeField(page).fill('123456');

    const signInCalls = countPosts({
      page,
      path: '/api/auth/callback/credentials',
    });
    let releaseLogin = () => {};
    const loginHeld = new Promise<void>((resolve) => {
      releaseLogin = resolve;
    });
    await page.route('**/api/auth/callback/credentials', async (route) => {
      await loginHeld;
      await route.fallback();
    });

    await codeField(page).press('Enter');
    await expect(
      page.getByRole('button', { name: 'Se connecter', exact: true }),
    ).toBeDisabled();
    // A second Enter is already stopped by the disabled button:
    // `requestSubmit` skips it and reaches the form's own guard
    await page
      .getByTestId('login-form')
      .evaluate((form: HTMLFormElement) => form.requestSubmit());

    releaseLogin();
    await page.waitForURL((url) => url.pathname === '/a-propos');
    expect(signInCalls.count).toBe(1);
  });
});
