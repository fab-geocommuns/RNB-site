import { describe, expect, it } from 'vitest';
import { parseCsv, toCsv } from '@/utils/verification/csv';
import {
  createSession,
  exportFileName,
  exportSession,
  parseVerdictList,
} from '@/utils/verification/session';

describe('parseCsv / toCsv', () => {
  it('lit les champs entre guillemets, les retours à la ligne et le BOM', () => {
    const table = parseCsv('﻿a,b\r\n1,"x, ""y""\nz"\r\n\r\n');
    expect(table.header).toEqual(['a', 'b']);
    expect(table.rows).toEqual([['1', 'x, "y"\nz']]);
    expect(toCsv(table)).toBe('a,b\n1,"x, ""y""\nz"\n');
  });

  it('détecte le point-virgule', () => {
    const table = parseCsv('rnb_id;note\nA;1,5\n');
    expect(table.delimiter).toBe(';');
    expect(table.rows).toEqual([['A', '1,5']]);
  });
});

const CSV =
  'tranche,rnb_id,verdict,commentaire,ratio\n>=10,AAA,,,64.1\n>=10,BBB,debout,déjà vu,3\n';

describe('createSession', () => {
  it('refuse un CSV sans rnb_id', () => {
    expect(() => createSession('f.csv', 'id\n1\n', null)).toThrow(/rnb_id/);
  });

  it('reprend les verdicts du fichier', () => {
    const session = createSession('f.csv', CSV, null);
    expect(session.results).toEqual([
      { verdict: '', commentaire: '' },
      { verdict: 'debout', commentaire: 'déjà vu' },
    ]);
  });

  it('garde les verdicts sauvegardés pour le même fichier', () => {
    const saved = createSession('f.csv', CSV, null);
    saved.results[0] = { verdict: 'demoli', commentaire: 'parking' };
    saved.current = 1;
    const session = createSession('f.csv', CSV, saved);
    expect(session.results[0]).toEqual({
      verdict: 'demoli',
      commentaire: 'parking',
    });
    expect(session.results[1].verdict).toBe('debout');
    expect(session.current).toBe(1);
  });

  it('ignore une sauvegarde dont les cas diffèrent', () => {
    const saved = createSession('f.csv', CSV, null);
    saved.results[0] = { verdict: 'demoli', commentaire: '' };
    const other = CSV.replace('AAA', 'CCC');
    expect(createSession('f.csv', other, saved).results[0].verdict).toBe('');
  });
});

describe('exportSession', () => {
  it('garde les colonnes et leur ordre, remplit verdict et commentaire', () => {
    const session = createSession('f.csv', CSV, null);
    session.results[0] = { verdict: 'demoli', commentaire: 'vu, rasé' };
    expect(exportSession(session)).toBe(
      'tranche,rnb_id,verdict,commentaire,ratio\n' +
        '>=10,AAA,demoli,"vu, rasé",64.1\n' +
        '>=10,BBB,debout,déjà vu,3\n',
    );
  });

  it('ajoute les colonnes absentes', () => {
    const session = createSession('f.csv', 'rnb_id\nAAA\n', null);
    session.results[0] = { verdict: 'doute', commentaire: '' };
    expect(exportSession(session)).toBe(
      'rnb_id,verdict,commentaire\nAAA,doute,\n',
    );
  });

  it('nomme le fichier exporté', () => {
    expect(exportFileName('echantillon.csv')).toBe('echantillon-verifie.csv');
  });
});

describe('verdicts', () => {
  it('propose les verdicts par défaut et ceux déjà présents dans le fichier', () => {
    const session = createSession('f.csv', CSV.replace('debout', 'rase'), null);
    expect(session.verdicts).toEqual(['demoli', 'debout', 'doute', 'rase']);
  });

  it('garde la liste sauvegardée pour le fichier', () => {
    const saved = createSession('f.csv', CSV, null);
    saved.verdicts = ['bon', 'mauvais'];
    expect(createSession('f.csv', CSV, saved).verdicts).toEqual([
      'bon',
      'mauvais',
      'debout',
    ]);
  });

  it('lit une liste saisie, sans vide ni doublon, au plus 9', () => {
    expect(parseVerdictList(' bon, mauvais,, bon ,doute ')).toEqual([
      'bon',
      'mauvais',
      'doute',
    ]);
    expect(parseVerdictList('a,b,c,d,e,f,g,h,i,j')).toHaveLength(9);
  });
});
