import { describe, expect, it } from 'vitest';
import {
  activityHeadline,
  aggregateImportsByYear,
  defaultPeriod,
  EditionActivity,
  editionsTrend,
} from './editionActivity';

const day = (date: string, bdtopo: number, bal: number) => ({
  date,
  events_count: { import_bdtopo: bdtopo, import_bal: bal, contributions: 5 },
});

const activity = (key: string, editions: number) =>
  ({
    period: { key, since: null, until: null },
    totals: { editions, cities: 0, editors: 0 },
  }) as EditionActivity;

describe('aggregateImportsByYear', () => {
  it('additionne les imports par année, sans les contributions', () => {
    const stats = aggregateImportsByYear([
      day('2024-01-01', 10, 1),
      day('2024-12-31', 5, 0),
      day('2025-06-01', 0, 3),
    ]);

    expect(stats).toEqual({
      total: 19,
      years: [
        { year: 2024, bdtopo: 15, bal: 1 },
        { year: 2025, bdtopo: 0, bal: 3 },
      ],
    });
  });

  it('ignore les années sans import', () => {
    const stats = aggregateImportsByYear([
      day('2024-03-01', 0, 0),
      day('2025-03-01', 2, 0),
    ]);

    expect(stats.years).toEqual([{ year: 2025, bdtopo: 2, bal: 0 }]);
  });

  it('renvoie un total nul sans données', () => {
    expect(aggregateImportsByYear([])).toEqual({ total: 0, years: [] });
  });
});

const withTotals = (
  since: string | null,
  editions: number,
  cities: number,
  previous: number | null = null,
) =>
  ({
    period: { key: 'x', since, until: null },
    totals: { editions, cities, editors: 1 },
    previous_period:
      previous === null ? null : { since: '', until: '', editions: previous },
  }) as EditionActivity;

describe('activityHeadline', () => {
  it('résume le mois avec le nombre de communes', () => {
    expect(activityHeadline(withTotals('2026-10-01', 50, 235))).toBe(
      'En octobre, 235 communes ont amélioré leurs bâtiments',
    );
  });

  it('accorde au singulier', () => {
    expect(activityHeadline(withTotals('2026-09-01', 2, 1))).toBe(
      'En septembre, 1 commune a amélioré ses bâtiments',
    );
  });

  it('parle du lancement pour « depuis toujours »', () => {
    expect(activityHeadline(withTotals(null, 10, 3))).toBe(
      'Depuis le lancement de l’édition, 3 communes ont amélioré leurs bâtiments',
    );
  });

  it('gère une période sans édition', () => {
    expect(activityHeadline(withTotals('2026-10-01', 0, 0))).toBe(
      'En octobre, aucune édition pour l’instant',
    );
  });
});

describe('editionsTrend', () => {
  it('calcule l’évolution en pourcentage arrondi', () => {
    expect(editionsTrend(withTotals('2026-10-01', 118, 1, 100))).toBe(18);
    expect(editionsTrend(withTotals('2026-10-01', 90, 1, 100))).toBe(-10);
  });

  it('ne calcule rien sans période de comparaison ou à partir de zéro', () => {
    expect(editionsTrend(withTotals(null, 10, 1))).toBeNull();
    expect(editionsTrend(withTotals('2026-10-01', 10, 1, 0))).toBeNull();
  });
});

describe('defaultPeriod', () => {
  it('prend la première période donnée par l’API', () => {
    expect(
      defaultPeriod([activity('current_month', 3), activity('last_month', 8)]),
    ).toBe('current_month');
  });

  it('bascule sur le mois dernier quand le mois en cours est vide', () => {
    expect(
      defaultPeriod([activity('current_month', 0), activity('last_month', 8)]),
    ).toBe('last_month');
  });

  it('renvoie null sans période', () => {
    expect(defaultPeriod([])).toBeNull();
  });
});
