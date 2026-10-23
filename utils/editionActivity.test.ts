import { describe, expect, it } from 'vitest';
import {
  activityHeadline,
  EditionActivity,
  editionsTrend,
  windowLabel,
} from './editionActivity';

const withTotals = (
  key: string,
  editions: number,
  cities: number,
  previous: number | null = null,
) =>
  ({
    period: { key, since: null },
    totals: { editions, cities, editors: 1 },
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

describe('activityHeadline', () => {
  it('résume la fenêtre avec le nombre de communes', () => {
    expect(activityHeadline(withTotals('last_30_days', 50, 235))).toBe(
      'Ces 30 derniers jours, 235 communes ont amélioré leurs bâtiments',
    );
  });

  it('accorde au singulier', () => {
    expect(activityHeadline(withTotals('last_7_days', 2, 1))).toBe(
      'Ces 7 derniers jours, 1 commune a amélioré ses bâtiments',
    );
  });

  it('gère une période sans contribution', () => {
    expect(activityHeadline(withTotals('last_7_days', 0, 0))).toBe(
      'Ces 7 derniers jours, aucune contribution',
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
