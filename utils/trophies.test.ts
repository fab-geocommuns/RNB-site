import { describe, expect, it } from 'vitest';
import {
  trophyLevelName,
  wonByLabel,
  getUserTrophyData,
  getUserTrophieDetails,
  TrophyData,
  Trophy,
} from './trophies';

const catalogTrophy: TrophyData = {
  trophy: 'validateur',
  trophy_label: 'validateur',
  description: 'Gagnez ce trophée en validant des bâtiments.',
  count: 2,
  levels: [
    {
      level: 1,
      level_label: 'apprenti',
      condition: 'Valider 10 bâtiments',
      count: 2,
    },
    {
      level: 2,
      level_label: 'maçon',
      condition: 'Valider 100 bâtiments',
      count: 1,
    },
    {
      level: 3,
      level_label: 'entreprise du bâtiment',
      condition: 'Valider 250 bâtiments',
      count: 1,
    },
  ],
};

describe('trophyLevelName', () => {
  it('nomme les paliers Bronze, Argent puis Or', () => {
    expect(trophyLevelName(1)).toBe('Bronze');
    expect(trophyLevelName(2)).toBe('Argent');
    expect(trophyLevelName(3)).toBe('Or');
    expect(trophyLevelName(4)).toBe('Or');
  });
});

describe('wonByLabel', () => {
  it('gère zéro, un et plusieurs gagnants', () => {
    expect(wonByLabel(0)).toBe('Pas encore gagné');
    expect(wonByLabel(1)).toBe('Gagné par 1 personne');
    expect(wonByLabel(3)).toBe('Gagné par 3 personnes');
    expect(wonByLabel(undefined)).toBe('Pas encore gagné');
    expect(wonByLabel(null)).toBe('Pas encore gagné');
  });
});

describe('getUserTrophyData', () => {
  const userTrophy: Trophy = {
    trophy: 'validateur',
    trophy_label: 'validateur',
    level: 2,
    level_label: 'maçon',
  };

  it('expose les paliers du catalogue et le palier atteint', () => {
    const details = getUserTrophyData([catalogTrophy], userTrophy);
    expect(details.levels).toEqual(catalogTrophy.levels);
    expect(details.userLevel).toBe(2);
    expect(details.count).toBe(2); // compteur du trophée, pas du palier
  });

  it('reste utilisable si le trophée est absent du catalogue', () => {
    const details = getUserTrophyData([], userTrophy);
    expect(details.levels).toEqual([]);
    expect(details.userLevel).toBe(2);
  });
});

describe('getUserTrophieDetails', () => {
  it('expose les paliers du catalogue et un palier utilisateur nul', () => {
    const details = getUserTrophieDetails(catalogTrophy);
    expect(details.levels).toEqual(catalogTrophy.levels);
    expect(details.userLevel).toBe(0);
    expect(details.count).toBe(2);
  });
});
