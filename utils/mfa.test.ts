import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  MfaError,
  declineMfaSetup,
  hasDeclinedMfaSetup,
  mfaErrorOf,
} from './mfa';
import { RnbApiError } from './rnbApi';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const DECLINED_AT = new Date('2026-01-01T00:00:00Z');

// Minimal in-memory localStorage: the vitest environment is node, without jsdom
function memoryStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

describe('declineMfaSetup / hasDeclinedMfaSetup', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.useFakeTimers();
    vi.setSystemTime(DECLINED_AT);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('reste refusé jusqu’à la dernière milliseconde des 30 jours', () => {
    declineMfaSetup('alice');
    vi.setSystemTime(DECLINED_AT.getTime() + THIRTY_DAYS_MS - 1);
    expect(hasDeclinedMfaSetup('alice')).toBe(true);
  });

  it('expire pile à 30 jours et au-delà', () => {
    declineMfaSetup('alice');
    vi.setSystemTime(DECLINED_AT.getTime() + THIRTY_DAYS_MS);
    expect(hasDeclinedMfaSetup('alice')).toBe(false);
    vi.setSystemTime(DECLINED_AT.getTime() + THIRTY_DAYS_MS + 1);
    expect(hasDeclinedMfaSetup('alice')).toBe(false);
  });

  it('ne vaut que pour le compte qui a refusé', () => {
    declineMfaSetup('alice');
    expect(hasDeclinedMfaSetup('alice')).toBe(true);
    expect(hasDeclinedMfaSetup('bob')).toBe(false);
  });

  it('renvoie false pour un compte qui n’a jamais refusé', () => {
    expect(hasDeclinedMfaSetup('alice')).toBe(false);
  });

  it('renvoie false pour une valeur stockée illisible', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => 'pas-une-date',
      setItem: () => {},
    });
    expect(hasDeclinedMfaSetup('alice')).toBe(false);
  });

  it('ne lève pas quand le stockage refuse l’écriture', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    });
    expect(() => declineMfaSetup('alice')).not.toThrow();
  });

  it('renvoie false quand le stockage refuse la lecture', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem: () => {},
    });
    expect(hasDeclinedMfaSetup('alice')).toBe(false);
  });
});

describe('mfaErrorOf', () => {
  it('renvoie null pour une erreur qui ne vient pas de l’API', () => {
    expect(mfaErrorOf(new Error('boom'))).toBeNull();
    expect(mfaErrorOf({ status: 429 })).toBeNull();
  });

  it('renvoie Throttled sur un 429, quel que soit le corps', () => {
    expect(mfaErrorOf(new RnbApiError(429, 'x'))).toBe(MfaError.Throttled);
    expect(
      mfaErrorOf(new RnbApiError(429, 'x', { error: MfaError.Invalid })),
    ).toBe(MfaError.Throttled);
  });

  // Throttled is not an API error code: it only comes from a 429 status
  const apiCodes = Object.values(MfaError).filter(
    (code) => code !== MfaError.Throttled,
  );

  it.each(apiCodes)('reconnaît le code %s', (code) => {
    expect(mfaErrorOf(new RnbApiError(400, 'x', { error: code }))).toBe(code);
  });

  it.each([
    ['un code inconnu', { error: 'other_error' }],
    ['data null', null],
    ['data texte', 'mfa_required'],
    ['un objet sans error', { detail: 'mfa_required' }],
  ])('renvoie null pour %s', (_label, data) => {
    expect(mfaErrorOf(new RnbApiError(400, 'x', data))).toBeNull();
  });
});
