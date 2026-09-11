import { describe, it, expect } from 'vitest';
import { mapBrevoErrorCode } from './brevo';

describe('mapBrevoErrorCode', () => {
  it('signale une adresse email invalide', () => {
    expect(mapBrevoErrorCode('invalid_parameter')).toBe(
      'Adresse email invalide',
    );
  });

  it('retombe sur un message générique pour un code inconnu', () => {
    expect(mapBrevoErrorCode(undefined)).toBe(
      'Une erreur est survenue. Merci de réessayer plus tard.',
    );
  });
});
