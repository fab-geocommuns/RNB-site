import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api, apiUrl, createApi, humanizeApiError } from './api';
import { UNEXPECTED_ERROR_MESSAGE } from './actionResult';

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_BASE', 'https://api.test/api/alpha');
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

describe('apiUrl', () => {
  it('préfixe la base, ajoute from=site et ignore les paramètres vides', () => {
    expect(apiUrl('/buildings/ABC/', { withPlots: 1, foo: undefined })).toBe(
      'https://api.test/api/alpha/buildings/ABC/?from=site&withPlots=1',
    );
  });
});

describe('humanizeApiError', () => {
  it('renvoie detail quand il existe', () => {
    expect(humanizeApiError({ detail: 'Interdit' })).toBe('Interdit');
  });

  it('liste les erreurs par champ', () => {
    expect(humanizeApiError({ rnb_ids: ['trop court', 'invalide'] })).toBe(
      'rnb_ids : trop court, invalide',
    );
  });

  it('a un message générique sans contenu affichable', () => {
    expect(humanizeApiError(null)).toBe(UNEXPECTED_ERROR_MESSAGE);
    expect(humanizeApiError('<html>502</html>')).toBe(UNEXPECTED_ERROR_MESSAGE);
  });
});

describe('apiRequest', () => {
  it('sérialise le body, pose le token et parse le JSON', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ rnb_id: 'X' }), { status: 201 }),
    );

    const data = await createApi({ token: 'tok' }).post('/buildings/merge/', {
      rnb_ids: ['A', 'B'],
    });

    expect(data).toEqual({ rnb_id: 'X' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.test/api/alpha/buildings/merge/?from=site');
    expect(init.method).toBe('POST');
    expect(init.body).toBe('{"rnb_ids":["A","B"]}');
    expect(init.headers.get('Authorization')).toBe('Token tok');
    expect(init.headers.get('Content-Type')).toBe('application/json');
  });

  it('renvoie null sur une réponse 204', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(api.delete('/x/')).resolves.toBeNull();
  });

  it("lève une ApiError si un succès n'est pas du JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>maintenance</html>', { status: 200 }),
    );
    await expect(api.get('/x/')).rejects.toMatchObject({
      status: 200,
      message: UNEXPECTED_ERROR_MESSAGE,
      data: '<html>maintenance</html>',
    });
  });

  it('lève une ApiError lisible si la réponse est en erreur', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: 'Non autorisé' }), {
        status: 403,
      }),
    );

    const request = api.get('/x/');
    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({
      status: 403,
      message: 'Non autorisé',
    });
  });

  it("ne plante pas si l'erreur n'est pas du JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response('<html>502</html>', { status: 502 }),
    );
    await expect(api.get('/x/')).rejects.toMatchObject({
      status: 502,
      message: UNEXPECTED_ERROR_MESSAGE,
      data: '<html>502</html>',
    });
  });
});
