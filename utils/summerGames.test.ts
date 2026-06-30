import { describe, expect, it } from 'vitest';
import { formatRanks, userTrophyStatus } from './summerGames';

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

describe('userTrophyStatus', () => {
  const owned = [
    {
      trophy: 'validateur',
      trophy_label: 'validateur',
      level: 1,
      level_label: 'apprenti',
      unlocked_at: 'x',
    },
    {
      trophy: 'validateur',
      trophy_label: 'validateur',
      level: 2,
      level_label: 'maçon',
      unlocked_at: 'x',
    },
    {
      trophy: 'superv',
      trophy_label: 'superV',
      level: 1,
      level_label: null,
      unlocked_at: 'x',
    },
  ];

  it('returns the highest-level label for an earned trophy', () => {
    expect(userTrophyStatus(owned, 'validateur')).toEqual({
      earned: true,
      levelLabel: 'maçon',
    });
  });

  it('marks an earned trophy with no level label (superv) as earned, null label', () => {
    expect(userTrophyStatus(owned, 'superv')).toEqual({
      earned: true,
      levelLabel: null,
    });
  });

  it('reports not earned for a trophy the user lacks', () => {
    expect(userTrophyStatus(owned, 'tour_de_france')).toEqual({
      earned: false,
      levelLabel: null,
    });
  });

  it('handles undefined input', () => {
    expect(userTrophyStatus(undefined, 'validateur')).toEqual({
      earned: false,
      levelLabel: null,
    });
  });
});
