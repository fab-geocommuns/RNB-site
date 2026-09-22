import { describe, it, expect } from 'vitest';
import { mapBrevoErrorCode, GENERIC_ERROR } from './brevo';

describe('mapBrevoErrorCode', () => {
  it('signale une adresse email invalide', () => {
    expect(mapBrevoErrorCode('invalid_parameter')).toBe(
      'Adresse email invalide',
    );
  });

  it('retombe sur un message générique pour un code inconnu', () => {
    expect(mapBrevoErrorCode(undefined)).toBe(GENERIC_ERROR);
  });
});
