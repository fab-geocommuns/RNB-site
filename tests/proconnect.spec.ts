import { Page } from '@playwright/test';
import { test, expect } from '@/tests/fixtures';

test.describe('Retour de ProConnect avec un code à usage unique', () => {
  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
  });

  test("ouvre la session avec les groupes renvoyés par l'API, sans jeton dans l'URL", async ({
    page,
  }) => {
    const visitedUrls: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) visitedUrls.push(frame.url());
    });

    await page.goto(
      '/auth/proconnect/callback?code=code-valide&redirect=/a-propos',
    );
    // A glob would already match the callback URL (its query ends with /a-propos)
    await page.waitForURL((url) => url.pathname === '/a-propos');

    const session = await (await page.request.get('/api/auth/session')).json();
    expect(session.username).toBe('agent-proconnect');
    expect(session.groups).toEqual(['Contributors', 'Admins']);
    expect(session.authProvider).toBe('proconnect');
    expect(visitedUrls.some((url) => url.includes('jeton-proconnect'))).toBe(
      false,
    );
  });

  test("consomme le code même quand un paramètre error est ajouté à l'URL", async ({
    page,
  }) => {
    await page.goto(
      '/auth/proconnect/callback?error=x&code=code-valide&redirect=/a-propos',
    );
    await page.waitForURL((url) => url.pathname === '/a-propos');

    const session = await (await page.request.get('/api/auth/session')).json();
    expect(session.username).toBe('agent-proconnect');
    expect(session.groups).toEqual(['Contributors', 'Admins']);
    expect(session.authProvider).toBe('proconnect');
  });

  test('consomme le code même quand le visiteur est déjà connecté', async ({
    page,
    auth,
  }) => {
    await auth.signIn();

    await page.goto(
      '/auth/proconnect/callback?code=code-valide&redirect=/a-propos',
    );
    await page.waitForURL((url) => url.pathname === '/a-propos');

    const session = await (await page.request.get('/api/auth/session')).json();
    expect(session.username).toBe('agent-proconnect');
    expect(session.groups).toEqual(['Contributors', 'Admins']);
  });

  test('affiche une erreur quand le code est expiré ou déjà utilisé', async ({
    page,
  }) => {
    await page.goto('/auth/proconnect/callback?code=code-expire');

    await expect(
      page.getByText(
        'Votre lien de connexion ProConnect est invalide ou a expiré. Veuillez vous reconnecter.',
      ),
    ).toBeVisible();
    const session = await (await page.request.get('/api/auth/session')).json();
    expect(session).toEqual({});
  });

  test('affiche une erreur quand le code est absent', async ({ page }) => {
    await page.goto('/auth/proconnect/callback');

    await expect(
      page.getByText('Paramètres de connexion manquants.'),
    ).toBeVisible();
  });
});

test.describe('Déconnexion depuis Mon compte', () => {
  test.setTimeout(60000);

  test.beforeEach(async ({ httpMocker }) => {
    await httpMocker.install();
  });

  const getSession = async (page: Page) =>
    (await page.request.get('/api/auth/session')).json();

  // SessionProvider requests the session from an effect, so the request means
  // the page is hydrated and the sign-out button has its click handler.
  const openAccountPage = async (page: Page) => {
    const hydrated = page.waitForRequest('**/api/auth/session');
    await page.goto('/mon-compte/notifications');
    await hydrated;
  };

  test('passe par ProConnect pour une session ProConnect', async ({
    page,
    auth,
  }) => {
    await page.route('https://proconnect.example/**', (route) =>
      route.fulfill({ status: 200, body: 'ProConnect' }),
    );
    await auth.signIn({ authProvider: 'proconnect' });

    await openAccountPage(page);
    await page.getByRole('button', { name: 'Se déconnecter' }).click();

    await page.waitForURL(
      (url) =>
        url.host === 'proconnect.example' &&
        url.pathname === '/logout' &&
        url.searchParams.get('id_token_hint') === 'jeton-id',
    );
    expect(await getSession(page)).toEqual({});
  });

  test('déconnecte localement une session identifiant / mot de passe', async ({
    page,
    auth,
    baseURL,
  }) => {
    const proconnectLogoutCalls: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/api/auth/proconnect-logout')) {
        proconnectLogoutCalls.push(request.url());
      }
    });
    await auth.signIn();

    await openAccountPage(page);
    // Checking the session before sign-out completes would race with it: the
    // session endpoint renews the cookie that sign-out clears.
    const signedOut = page.waitForResponse('**/api/auth/signout');
    await page.getByRole('button', { name: 'Se déconnecter' }).click();
    await signedOut;

    expect(await getSession(page)).toEqual({});
    expect(new URL(page.url()).host).toBe(new URL(baseURL!).host);
    expect(proconnectLogoutCalls).toEqual([]);
  });
});
