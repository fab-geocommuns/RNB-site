import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { unsubscribeFromNotifications } from './unsubscribeFromNotifications';

const jsonResponse = ({ status, body }: { status: number; body: unknown }) =>
  new Response(JSON.stringify(body), { status });

describe('unsubscribeFromNotifications', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('NEXT_PUBLIC_API_BASE', 'http://api.test/api/alpha');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it.each([
    ['vide', ''],
    ['absent', undefined],
    ["d'un autre type", 42],
  ])(
    "lève une erreur sans appeler l'API si le jeton est %s",
    async (_, token) => {
      await expect(
        unsubscribeFromNotifications(token as never),
      ).rejects.toThrow('Invalid unsubscribe token argument');
      expect(fetchMock).not.toHaveBeenCalled();
    },
  );

  it("renvoie l'email désinscrit et poste le jeton à l'API", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ status: 200, body: { email: 'auteur@exemple.fr' } }),
    );

    expect(await unsubscribeFromNotifications('jeton')).toEqual({
      status: 'success',
      email: 'auteur@exemple.fr',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/alpha/notifications/unsubscribe/?from=site',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ token: 'jeton' }),
      }),
    );
  });

  it("renvoie invalid_token quand l'API refuse le jeton", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        status: 400,
        body: { token: ['Lien de désinscription invalide.'] },
      }),
    );

    expect(await unsubscribeFromNotifications('jeton')).toEqual({
      status: 'invalid_token',
    });
  });

  it('lève une erreur sans le jeton dans le message sur une erreur serveur', async () => {
    fetchMock.mockResolvedValue(new Response('oops', { status: 500 }));

    const failure = await unsubscribeFromNotifications('jeton-secret').catch(
      (e) => e,
    );

    expect(failure).toBeInstanceOf(Error);
    expect(failure.message).toContain('500');
    expect(failure.message).not.toContain('jeton-secret');
  });

  it("lève une erreur si la réponse 200 ne contient pas d'email", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 200, body: {} }));

    await expect(unsubscribeFromNotifications('jeton')).rejects.toThrow(
      'returned no email',
    );
  });

  it("lève une erreur si l'appel réseau échoue", async () => {
    fetchMock.mockRejectedValue(new TypeError('fetch failed'));

    await expect(unsubscribeFromNotifications('jeton')).rejects.toThrow(
      'fetch failed',
    );
  });
});
