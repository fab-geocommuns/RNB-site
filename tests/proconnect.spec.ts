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
