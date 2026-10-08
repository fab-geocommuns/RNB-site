import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const checkCaptcha = vi.hoisted(() => vi.fn());
vi.mock('./captcha', async (importActual) => ({
  ...(await importActual<typeof import('./captcha')>()),
  checkCaptcha,
}));

import { BrevoError } from './brevo';
import { CaptchaCheck } from './captcha';
import { subscribeToNewsletter } from './subscribe';

const subscribe = () =>
  subscribeToNewsletter({ email: 'a@b.fr', captchaSolution: null });

describe('subscribeToNewsletter', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    checkCaptcha.mockReset().mockResolvedValue(CaptchaCheck.PASSED);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('BREVO_API_KEY', 'test-key');
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('lève une erreur si BREVO_API_KEY est absente', async () => {
    vi.stubEnv('BREVO_API_KEY', '');

    await expect(subscribe()).rejects.toThrow(
      'BREVO_API_KEY is not configured',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renvoie une erreur captcha sans appeler Brevo quand il est refusé', async () => {
    checkCaptcha.mockResolvedValue(CaptchaCheck.REFUSED);

    expect(await subscribe()).toEqual({
      status: 'rejected',
      errors: { captcha: 'Vérification anti-robot invalide.' },
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renvoie une erreur email quand Brevo rejette le paramètre', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'invalid_parameter' }), {
        status: 400,
      }),
    );

    expect(await subscribe()).toEqual({
      status: 'rejected',
      errors: { email: 'Adresse email invalide' },
    });
  });

  it('lève la BrevoError sur une erreur 500 de Brevo', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'server_error' }), { status: 500 }),
    );

    const error = await subscribe().catch((e) => e);

    expect(error).toBeInstanceOf(BrevoError);
    expect(error).toMatchObject({ status: 500, code: 'server_error' });
  });

  it("propage l'erreur du captcha sans appeler Brevo", async () => {
    const failure = new Error('Captcha is misconfigured');
    checkCaptcha.mockRejectedValue(failure);

    await expect(subscribe()).rejects.toBe(failure);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('propage la panne réseau', async () => {
    const failure = new Error('network');
    fetchMock.mockRejectedValue(failure);

    await expect(subscribe()).rejects.toBe(failure);
  });

  it('renvoie un succès quand Brevo accepte', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 201 }));

    expect(await subscribe()).toEqual({ status: 'success' });
  });
});
