import { describe, it, expect } from 'vitest';
import { captchaMode, CaptchaMode } from './captcha';

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
