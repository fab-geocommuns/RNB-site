import { describe, expect, it } from 'vitest';
import { TROPHIES, getUserTrophies, DEMO_TROPHY_USERNAME } from './data';

describe('trophies fixtures', () => {
  it('exposes the 4 backend trophies in order', () => {
    expect(TROPHIES.map((t) => t.trophy)).toEqual([
      'validateur',
      'course_de_fond',
      'tour_de_france',
      'superv',
    ]);
  });

  it('gives every trophy the required fields', () => {
    for (const t of TROPHIES) {
      expect(typeof t.trophy_label).toBe('string');
      expect(typeof t.description).toBe('string');
      expect(typeof t.count).toBe('number');
      expect(t.levels.length).toBeGreaterThan(0);
    }
  });

  it('models superv as a single unnamed level', () => {
    const superv = TROPHIES.find((t) => t.trophy === 'superv')!;
    expect(superv.levels).toEqual([{ level: 1, level_label: null, count: 1 }]);
  });

  it('returns demo user trophies, empty for anyone else', () => {
    expect(getUserTrophies(DEMO_TROPHY_USERNAME).length).toBeGreaterThan(0);
    expect(getUserTrophies('nobody')).toEqual([]);
  });
});
