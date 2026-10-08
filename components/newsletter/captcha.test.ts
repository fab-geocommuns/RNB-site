import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const verify = vi.fn();
vi.mock('@private-captcha/private-captcha-js', () => ({
  createClient: () => ({ verify }),
}));

import {
  captchaMode,
  CaptchaMode,
  checkCaptcha,
  CaptchaCheck,
} from './captcha';

describe('captchaMode', () => {
  it('ignore la vérification quand le captcha est désactivé', () => {
    expect(
      captchaMode({ enabled: false, hasApiKey: true, hasSitekey: true }),
    ).toBe(CaptchaMode.SKIP);
  });

  it('vérifie quand le captcha est activé avec clé API et sitekey', () => {
    expect(
      captchaMode({ enabled: true, hasApiKey: true, hasSitekey: true }),
    ).toBe(CaptchaMode.VERIFY);
  });

  it('signale une mauvaise configuration quand la clé API est absente', () => {
    expect(
      captchaMode({ enabled: true, hasApiKey: false, hasSitekey: true }),
    ).toBe(CaptchaMode.MISCONFIGURED);
  });

  it('signale une mauvaise configuration quand la sitekey est absente', () => {
    expect(
      captchaMode({ enabled: true, hasApiKey: true, hasSitekey: false }),
    ).toBe(CaptchaMode.MISCONFIGURED);
  });
});

describe('checkCaptcha', () => {
  beforeEach(() => {
    verify.mockReset();
    vi.stubEnv('NEXT_PUBLIC_ENABLE_CAPTCHA', 'true');
    vi.stubEnv('PRIVATE_CAPTCHA_API_KEY', 'api-key');
    vi.stubEnv('NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY', 'sitekey');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('passe sans vérifier quand le captcha est désactivé', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENABLE_CAPTCHA', 'false');
    expect(await checkCaptcha({ captchaSolution: null })).toBe(
      CaptchaCheck.PASSED,
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it('lève une erreur quand le captcha est mal configuré', async () => {
    vi.stubEnv('PRIVATE_CAPTCHA_API_KEY', '');
    await expect(checkCaptcha({ captchaSolution: 'abc' })).rejects.toThrow(
      'Captcha is misconfigured',
    );
  });

  it('refuse sans appel réseau quand la solution est absente', async () => {
    expect(await checkCaptcha({ captchaSolution: null })).toBe(
      CaptchaCheck.REFUSED,
    );
    expect(verify).not.toHaveBeenCalled();
  });

  it("propage l'exception du SDK", async () => {
    const failure = new Error('network');
    verify.mockRejectedValue(failure);
    await expect(checkCaptcha({ captchaSolution: 'abc' })).rejects.toBe(
      failure,
    );
  });

  it('passe quand la solution est valide', async () => {
    verify.mockResolvedValue({ ok: () => true });
    expect(await checkCaptcha({ captchaSolution: 'abc' })).toBe(
      CaptchaCheck.PASSED,
    );
  });

  it('refuse quand la solution est invalide', async () => {
    verify.mockResolvedValue({ ok: () => false });
    expect(await checkCaptcha({ captchaSolution: 'abc' })).toBe(
      CaptchaCheck.REFUSED,
    );
  });
});
