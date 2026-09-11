import { describe, it, expect } from 'vitest';
import { captchaMode } from './captcha';

describe('captchaMode', () => {
  it('vérifie quand clé API et sitekey sont présentes, en prod', () => {
    expect(captchaMode(true, true, true)).toBe('verify');
  });

  it('vérifie quand clé API et sitekey sont présentes, hors prod', () => {
    expect(captchaMode(true, true, false)).toBe('verify');
  });

  it('signale une mauvaise configuration quand la clé API est absente, en prod', () => {
    expect(captchaMode(false, true, true)).toBe('misconfigured');
  });

  it('signale une mauvaise configuration quand la sitekey est absente, en prod', () => {
    expect(captchaMode(true, false, true)).toBe('misconfigured');
  });

  it('ignore la vérification quand clé API et sitekey sont absentes, hors prod', () => {
    expect(captchaMode(false, false, false)).toBe('skip');
  });

  it('ignore la vérification quand seule la sitekey est absente, hors prod', () => {
    expect(captchaMode(true, false, false)).toBe('skip');
  });
});
