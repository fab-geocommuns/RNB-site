import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const checkCaptcha = vi.hoisted(() => vi.fn());
const sendTransactionalEmail = vi.hoisted(() => vi.fn());
vi.mock('@/components/newsletter/captcha', async (importActual) => ({
  ...(await importActual<typeof import('@/components/newsletter/captcha')>()),
  checkCaptcha,
}));
vi.mock('@/components/newsletter/brevo', async (importActual) => ({
  ...(await importActual<typeof import('@/components/newsletter/brevo')>()),
  sendTransactionalEmail,
}));

import { BrevoError, TransactionalEmail } from '@/components/newsletter/brevo';
import { CaptchaCheck } from '@/components/newsletter/captcha';
import { requestAdsAccess } from './requestAdsAccess';

const validRequest = {
  email: 'maire@commune.fr',
  inseeCodes: ['75056'],
  organisation: 'Mairie de Paris',
  captchaSolution: 'solution',
};

describe('requestAdsAccess', () => {
  beforeEach(() => {
    checkCaptcha.mockReset().mockResolvedValue(CaptchaCheck.PASSED);
    sendTransactionalEmail.mockReset().mockResolvedValue(undefined);
    vi.stubEnv('BREVO_API_KEY', 'test-key');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each([
    ['email', { email: 42 }],
    ['inseeCodes', { inseeCodes: 'abc' }],
    ['un élément de inseeCodes', { inseeCodes: [1] }],
    ['organisation', { organisation: null }],
  ])('lève une erreur si %s a un type invalide', async (_, override) => {
    await expect(
      requestAdsAccess({ ...validRequest, ...override } as never),
    ).rejects.toThrow('Invalid ADS access request arguments');
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it('lève une erreur si BREVO_API_KEY est absente', async () => {
    vi.stubEnv('BREVO_API_KEY', '');

    await expect(requestAdsAccess(validRequest)).rejects.toThrow(
      'BREVO_API_KEY is not configured',
    );
  });

  it('renvoie les erreurs de champs sans captcha ni email', async () => {
    const result = await requestAdsAccess({
      ...validRequest,
      email: 'pas-un-email',
      inseeCodes: [],
    });

    expect(result).toEqual({
      status: 'rejected',
      errors: {
        email: expect.any(String),
        inseeCodes: expect.any(String),
      },
    });
    expect(checkCaptcha).not.toHaveBeenCalled();
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("renvoie l'erreur captcha sans envoyer d'email quand il est refusé", async () => {
    checkCaptcha.mockResolvedValue(CaptchaCheck.REFUSED);

    expect(await requestAdsAccess(validRequest)).toEqual({
      status: 'rejected',
      errors: { captcha: 'Vérification anti-robot invalide.' },
    });
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("propage l'erreur du captcha sans envoyer d'email", async () => {
    const failure = new Error('Captcha is misconfigured');
    checkCaptcha.mockRejectedValue(failure);

    await expect(requestAdsAccess(validRequest)).rejects.toBe(failure);
    expect(sendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("propage l'échec Brevo sans donnée utilisateur dans le message", async () => {
    sendTransactionalEmail.mockRejectedValue(new BrevoError(500, 'server'));

    const failure = await requestAdsAccess(validRequest).catch((e) => e);

    expect(failure).toBeInstanceOf(BrevoError);
    expect(failure.message).not.toContain(validRequest.email);
    expect(failure.message).not.toContain(validRequest.organisation);
  });

  it("envoie l'email avec les paramètres validés et renvoie un succès", async () => {
    expect(await requestAdsAccess(validRequest)).toEqual({
      status: 'success',
    });

    expect(sendTransactionalEmail).toHaveBeenCalledTimes(1);
    expect(sendTransactionalEmail).toHaveBeenCalledWith({
      email: TransactionalEmail.AdsAccessRequest,
      params: {
        REQUESTER_EMAIL: 'maire@commune.fr',
        INSEE_CODES: '75056',
        ORGANISATION: 'Mairie de Paris',
      },
      replyTo: 'maire@commune.fr',
      apiKey: 'test-key',
    });
  });
});
