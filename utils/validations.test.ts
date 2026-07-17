import { describe, it, expect } from 'vitest';
import { hasUserValidated } from './validations';
import { PublicUser } from '@/stores/map/map-slice';

const user = (over: Partial<PublicUser>): PublicUser => ({
  id: 1,
  username: 'jdupont',
  organization_name: 'IGN',
  organization_short_name: null,
  ...over,
});

describe('hasUserValidated', () => {
  it('retourne false si la liste est vide', () => {
    expect(hasUserValidated([], 'jdupont')).toBe(false);
  });

  it('retourne false si username est undefined', () => {
    expect(hasUserValidated([user({ username: 'jdupont' })], undefined)).toBe(
      false,
    );
  });

  it("retourne true si l'utilisateur courant est dans la liste", () => {
    expect(
      hasUserValidated(
        [user({ username: 'autre' }), user({ username: 'jdupont' })],
        'jdupont',
      ),
    ).toBe(true);
  });

  it("retourne false si l'utilisateur courant n'est pas dans la liste", () => {
    expect(hasUserValidated([user({ username: 'autre' })], 'jdupont')).toBe(
      false,
    );
  });
});
