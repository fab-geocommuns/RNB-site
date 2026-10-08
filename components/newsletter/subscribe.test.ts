import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const captureException = vi.hoisted(() => vi.fn());
const checkCaptcha = vi.hoisted(() => vi.fn());
vi.mock('@sentry/nextjs', () => ({ captureException }));
vi.mock('./captcha', async (importActual) => ({
  ...(await importActual<typeof import('./captcha')>()),
  checkCaptcha,
}));

import { BrevoError, GENERIC_ERROR } from './brevo';
import { CaptchaCheck } from './captcha';
import { subscribeToNewsletter } from './subscribe';

const subscribe = () =>
  subscribeToNewsletter({ email: 'a@b.fr', captchaSolution: null });

describe('subscribeToNewsletter', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    captureException.mockReset();
    checkCaptcha.mockReset().mockResolvedValue(CaptchaCheck.PASSED);
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('BREVO_API_KEY', 'test-key');
    vi.stubEnv('NEXTAUTH_URL', 'http://localhost:3000');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('signale la panne réseau à Sentry et renvoie le message générique', async () => {
    const failure = new Error('network');
    fetchMock.mockRejectedValue(failure);

    expect(await subscribe()).toBe(GENERIC_ERROR);
    expect(captureException).toHaveBeenCalledWith(failure);
  });

  it('signale une erreur 500 de Brevo à Sentry', async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'server_error' }), { status: 500 }),
    );

    expect(await subscribe()).toBe(GENERIC_ERROR);
    expect(captureException).toHaveBeenCalledTimes(1);
    const reported = captureException.mock.calls[0][0];
    expect(reported).toBeInstanceOf(BrevoError);
    expect(reported).toMatchObject({ status: 500, code: 'server_error' });
  });

  it('signale une erreur Brevo sans corps lisible', async () => {
    fetchMock.mockResolvedValue(new Response('<html>', { status: 502 }));

    expect(await subscribe()).toBe(GENERIC_ERROR);
    expect(captureException.mock.calls[0][0]).toMatchObject({ status: 502 });
  });

  it("n'envoie pas à Sentry une adresse email invalide", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ code: 'invalid_parameter' }), {
        status: 400,
      }),
    );

    expect(await subscribe()).toBe('Adresse email invalide');
    expect(captureException).not.toHaveBeenCalled();
  });

  it('signale une clé Brevo absente', async () => {
    vi.stubEnv('BREVO_API_KEY', '');

    expect(await subscribe()).toBe("La newsletter n'est pas configurée.");
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('signale un captcha mal configuré', async () => {
    checkCaptcha.mockResolvedValue(CaptchaCheck.MISCONFIGURED);

    expect(await subscribe()).toBe("La newsletter n'est pas configurée.");
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renvoie null quand Brevo accepte', async () => {
    fetchMock.mockResolvedValue(new Response('{}', { status: 201 }));

    expect(await subscribe()).toBeNull();
    expect(captureException).not.toHaveBeenCalled();
  });
});
