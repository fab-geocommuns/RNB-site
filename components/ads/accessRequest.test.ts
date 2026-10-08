import { describe, it, expect } from 'vitest';
import { validateAdsAccessRequest, validateInseeCode } from './accessRequest';

const valid = {
  email: 'moi@exemple.fr',
  inseeCodes: ['75056'],
  organisation: 'Mairie de Test',
};

const fieldErrors = (input: Partial<typeof valid>) => {
  const result = validateAdsAccessRequest({ ...valid, ...input });
  return result.ok ? {} : result.fieldErrors;
};

describe('validateAdsAccessRequest', () => {
  it('accepte une demande valide et normalise les valeurs', () => {
    expect(
      validateAdsAccessRequest({
        email: '  moi@exemple.fr ',
        inseeCodes: [' 2a004', '75056', '2A004 '],
        organisation: ' Mairie de Test ',
      }),
    ).toEqual({
      ok: true,
      value: {
        email: 'moi@exemple.fr',
        inseeCodes: ['2A004', '75056'],
        organisation: 'Mairie de Test',
      },
    });
  });

  it('signale les trois champs vides', () => {
    expect(
      Object.keys(
        fieldErrors({ email: ' ', inseeCodes: [], organisation: '' }),
      ),
    ).toEqual(['email', 'inseeCodes', 'organisation']);
  });

  it('refuse un email mal formé', () => {
    expect(fieldErrors({ email: 'abc' }).email).toBeDefined();
  });

  it.each([
    'a@b.co,c@d.fr',
    '<x>@y.fr',
    'a@b.fr;c@d.fr',
    'a@b..fr',
    'a@b.c',
    'a@b.fr.',
  ])("refuse l'email %s", (email) => {
    expect(fieldErrors({ email }).email).toBe(
      "L'adresse email n'est pas valide.",
    );
  });

  it.each([
    'a@mairie.fr',
    'a@sous.domaine.fr',
    'prenom.nom+rnb@mairie-nantes.fr',
    "o'brien@mairie.fr",
  ])("accepte l'email %s", (email) => {
    expect(fieldErrors({ email }).email).toBeUndefined();
  });

  it('refuse une organisation contenant < ou >', () => {
    expect(fieldErrors({ organisation: '<b>x</b>' }).organisation).toBe(
      "L'organisation ne doit pas contenir les caractères < et >.",
    );
  });

  it.each(['2A004', '2B033', '97411', '75101'])('accepte %s', (code) => {
    expect(fieldErrors({ inseeCodes: [code] }).inseeCodes).toBeUndefined();
  });

  it.each(['1234', '123456', '2C001', 'ABCDE', '00001', '20001', '99001'])(
    'refuse %s',
    (code) => {
      expect(fieldErrors({ inseeCodes: [code] }).inseeCodes).toContain(code);
    },
  );

  it('nomme les codes invalides', () => {
    expect(
      fieldErrors({ inseeCodes: ['75056', '2C001', '20001'] }).inseeCodes,
    ).toBe('Codes INSEE invalides : 2C001, 20001');
  });

  it('refuse plus de 100 codes après dédoublonnage', () => {
    const codes = Array.from({ length: 101 }, (_, i) => String(10000 + i));
    expect(fieldErrors({ inseeCodes: codes }).inseeCodes).toBeDefined();
  });

  it('accepte 100 codes', () => {
    const codes = Array.from({ length: 100 }, (_, i) => String(10000 + i));
    expect(fieldErrors({ inseeCodes: codes }).inseeCodes).toBeUndefined();
  });

  it('refuse une organisation trop longue', () => {
    expect(
      fieldErrors({ organisation: 'a'.repeat(201) }).organisation,
    ).toBeDefined();
  });
});

describe('validateInseeCode', () => {
  it('refuse un code mal formé en le nommant', () => {
    expect(validateInseeCode('20001')).toBe('Code INSEE invalide : 20001');
  });
});
