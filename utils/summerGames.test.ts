import { describe, expect, it } from 'vitest';
import { SUMMER_GAME_GOAL, formatRanks, userTrophyStatus } from './summerGames';

describe('formatRanks', () => {
  // Format objet du backend réel (PR fab-geocommuns/RNB-coeur#947) : chaque
  // entrée est un objet et `rank` porte en fait le SCORE (nb de validations).
  const raw = {
    global: 12345,
    individual: [{ username: 'jdupont', rank: 1320 }],
    organization: [
      {
        name: "Institut national de l'information géographique et forestière",
        short_name: 'IGN',
        rank: 3120,
      },
      // `short_name` absent -> shortName doit valoir null
      { name: 'Etalab', rank: 980 },
    ],
    departement: [{ name: 'Ille-et-Vilaine', code: '35', rank: 2980 }],
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

  it('computes shared goal/absolute/percent from SUMMER_GAME_GOAL', () => {
    expect(formatRanks(raw).shared).toEqual({
      goal: SUMMER_GAME_GOAL,
      absolute: 12345,
      percent: Math.round((12345 / SUMMER_GAME_GOAL) * 100),
    });
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
