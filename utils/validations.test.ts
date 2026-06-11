import { describe, it, expect } from 'vitest';
import { hasUserValidated, formatValidatorNames } from './validations';
import { PublicUser } from '@/stores/map/map-slice';

const user = (over: Partial<PublicUser>): PublicUser => ({
  id: 1,
  display_name: 'Jean Dupont',
  username: 'jdupont',
  organization_name: 'IGN',
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

describe('formatValidatorNames', () => {
  it('retourne une chaîne vide pour une liste vide', () => {
    expect(formatValidatorNames([])).toBe('');
  });

  it('affiche le username suivi de l’organisation entre parenthèses', () => {
    expect(
      formatValidatorNames([
        user({ username: 'jdupont', organization_name: 'IGN' }),
      ]),
    ).toBe('jdupont (IGN)');
  });

  it('omet les parenthèses en l’absence d’organisation', () => {
    expect(
      formatValidatorNames([
        user({ username: 'jdupont', organization_name: '' }),
      ]),
    ).toBe('jdupont');
  });

  it('sépare par des virgules sauf le dernier, introduit par « et »', () => {
    expect(
      formatValidatorNames([
        user({ id: 1, username: 'jdupont', organization_name: 'IGN' }),
        user({
          id: 2,
          username: 'mmartin',
          organization_name: 'INSEE',
        }),
        user({ id: 3, username: 'lpetit', organization_name: 'BAN' }),
      ]),
    ).toBe('jdupont (IGN), mmartin (INSEE) et lpetit (BAN)');
  });
});
