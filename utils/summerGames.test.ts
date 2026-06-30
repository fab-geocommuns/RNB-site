import { describe, expect, it } from 'vitest';
import { formatRanks } from './summerGames';

describe('formatRanks', () => {
  const raw = {
    goal: 50000,
    global: 12345,
    individual: [['jdupont', 1320]],
    organization: [
      [
        "Institut national de l'information géographique et forestière",
        'IGN',
        3120,
      ],
      ['Etalab', null, 980],
    ],
    departement: [['35', 'Ille-et-Vilaine', 2980]],
  };

  it('keeps organization name and shortName separate', () => {
    const { organization } = formatRanks(raw);
    expect(organization[0]).toEqual({
      name: "Institut national de l'information géographique et forestière",
      shortName: 'IGN',
      count: 3120,
    });
  });

  it('sets shortName to null when absent', () => {
    const { organization } = formatRanks(raw);
    expect(organization[1]).toEqual({
      name: 'Etalab',
      shortName: null,
      count: 980,
    });
  });

  it('formats department as "name (code)"', () => {
    expect(formatRanks(raw).department[0]).toEqual({
      name: 'Ille-et-Vilaine (35)',
      count: 2980,
    });
  });

  it('maps individual to name/count', () => {
    expect(formatRanks(raw).individual[0]).toEqual({
      name: 'jdupont',
      count: 1320,
    });
  });

  it('computes shared goal/absolute/percent', () => {
    expect(formatRanks(raw).shared).toEqual({
      goal: 50000,
      absolute: 12345,
      percent: 25,
    });
  });

  it('guards percent against a zero goal', () => {
    expect(formatRanks({ ...raw, goal: 0 }).shared.percent).toBe(0);
  });
});
