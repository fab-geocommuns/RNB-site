import { describe, expect, it } from 'vitest';
import {
  activitySummary,
  EditionActivity,
  editionsTrend,
  windowLabel,
} from './editionActivity';

const withTotals = (
  key: string,
  editions: number,
  cities: number,
  previous: number | null = null,
  editors = 1,
) =>
  ({
    period: { key, since: null },
    totals: { editions, cities, editors },
    previous_period:
      previous === null ? null : { since: '', until: '', editions: previous },
  }) as EditionActivity;

describe('windowLabel', () => {
  it('nomme une fenêtre glissante', () => {
    expect(windowLabel('last_7_days')).toBe('7 derniers jours');
    expect(windowLabel('last_30_days')).toBe('30 derniers jours');
    expect(windowLabel('last_1_days')).toBe('dernier jour');
  });

  it('ne nomme rien pour une période qui n’est pas une fenêtre', () => {
    expect(windowLabel('all')).toBeNull();
  });
});

describe('activitySummary', () => {
  it('résume la fenêtre en une phrase', () => {
    expect(
      activitySummary(withTotals('last_30_days', 1234, 235, null, 20)),
    ).toBe(
      'Ces 30 derniers jours : 1\u202f234 contributions dans 235 communes par 20 contributeurs',
    );
  });

  it('accorde au singulier', () => {
    expect(activitySummary(withTotals('last_7_days', 1, 1, null, 1))).toBe(
      'Ces 7 derniers jours : 1 contribution dans 1 commune par 1 contributeur',
    );
  });

  it('gère une période sans contribution', () => {
    expect(activitySummary(withTotals('last_7_days', 0, 0))).toBe(
      'Ces 7 derniers jours : aucune contribution pour l’instant',
    );
  });
});

describe('editionsTrend', () => {
  it('calcule l’évolution en pourcentage arrondi', () => {
    expect(editionsTrend(withTotals('last_30_days', 118, 1, 100))).toBe(18);
    expect(editionsTrend(withTotals('last_30_days', 90, 1, 100))).toBe(-10);
  });

  it('ne calcule rien sans période de comparaison ou à partir de zéro', () => {
    expect(editionsTrend(withTotals('all', 10, 1))).toBeNull();
    expect(editionsTrend(withTotals('last_30_days', 10, 1, 0))).toBeNull();
  });
});
