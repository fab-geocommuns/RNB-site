import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/utils/rnbApi', () => ({ rnbApi: { get: vi.fn() } }));

import { rnbApi } from '@/utils/rnbApi';
import {
  ContributionSummary,
  isCompleteSummary,
  loadContributionSummaries,
  loadContributionSummary,
  MAX_NEWCOMERS,
  keyFigures,
  windowView,
} from './contributionSummary';

const gironde = { code: '33', name: 'Gironde' };

const summary = (
  overrides: Partial<ContributionSummary> = {},
): ContributionSummary => ({
  updated_at: '2026-10-15T14:10:00+02:00',
  window_days: 30,
  cities: { total: 1248, new: 12 },
  organizations: { total: 86, new: 3 },
  building_changes: { total: 4310, contributions: 520 },
  top: {
    users: [
      { username: 'alice', organization: 'Mairie', count: 9 },
      { username: 'bob', organization: null, count: 4 },
    ],
    organizations: [
      { name: 'Commune de Talence', count: 42 },
      { name: 'Syndicat SIG', count: 18 },
    ],
    cities: [
      { insee_code: '33522', name: 'Talence', department: gironde, count: 7 },
      { insee_code: '33281', name: 'Mérignac', department: gironde, count: 2 },
    ],
  },
  newcomers: { users: [{ username: 'carol' }] },
  ...overrides,
});

describe('keyFigures et windowView', () => {
  it('décrit les 3 chiffres clés de la période', () => {
    expect(keyFigures(summary())).toEqual([
      {
        value: 4310,
        label: 'modifications de bâtiments',
        detail: 'dont 520 par les contributeurs',
      },
      {
        value: 86,
        label: 'organisations contributrices',
        detail: 'dont 3 pour la première fois',
      },
      {
        value: 1248,
        label: 'communes améliorées par la communauté',
        detail: 'dont 12 pour la première fois',
      },
    ]);
  });

  it('n’affiche pas d’évolution nulle', () => {
    const figures = keyFigures(
      summary({
        cities: { total: 10, new: 0 },
        organizations: { total: 2, new: 0 },
        building_changes: { total: 50, contributions: 0 },
      }),
    );
    expect(figures.map((f) => f.detail)).toEqual([null, null, null]);
  });

  it('ne parle pas de première fois sur toute la période', () => {
    const figures = keyFigures(summary({ window_days: null }));
    expect(figures.map((f) => f.detail)).toEqual([
      'dont 520 par les contributeurs',
      null,
      null,
    ]);
  });

  it('accorde au singulier', () => {
    const figures = keyFigures(
      summary({
        cities: { total: 1, new: 1 },
        organizations: { total: 1, new: 1 },
        building_changes: { total: 1, contributions: 1 },
      }),
    );
    expect(figures.map((f) => f.label)).toEqual([
      'modification de bâtiment',
      'organisation contributrice',
      'commune améliorée par la communauté',
    ]);
  });

  it('écrit le département des communes, pas des organisations', () => {
    const [, organizations, cities] = windowView(summary()).rankings;
    expect(organizations.rows.map((r) => r.detail)).toEqual([null, null]);
    expect(cities.rows.map((r) => r.detail)).toEqual([
      'Gironde (33)',
      'Gironde (33)',
    ]);
  });

  it('masque un classement de moins de 2 lignes', () => {
    const { rankings } = windowView(
      summary({
        top: {
          ...summary().top,
          users: [{ username: 'alice', organization: null, count: 3 }],
          cities: [],
        },
      }),
    );
    expect(rankings.map((r) => r.title)).toEqual([
      'Organisations les plus actives',
    ]);
  });

  it('titre les nouveaux contributeurs selon la période', () => {
    expect(windowView(summary()).newcomersTitle).toBe(
      'Nouveaux contributeurs ces 30 derniers jours',
    );
    expect(windowView(summary({ window_days: null })).newcomersTitle).toBe(
      'Derniers contributeurs arrivés',
    );
  });

  it('liste les nouveaux contributeurs, 8 au plus', () => {
    expect(windowView(summary()).newcomers).toEqual(['carol']);
    const users = Array.from({ length: 12 }, (_, i) => ({
      username: `user${i}`,
    }));
    expect(
      windowView(summary({ newcomers: { users } })).newcomers,
    ).toHaveLength(MAX_NEWCOMERS);
    expect(windowView(summary({ newcomers: { users: [] } })).newcomers).toEqual(
      [],
    );
  });
});

describe('loadContributionSummary', () => {
  beforeEach(() => {
    vi.mocked(rnbApi.get).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renvoie la synthèse de l’API', async () => {
    vi.mocked(rnbApi.get).mockResolvedValue(summary());
    expect(await loadContributionSummary()).toEqual(summary());
  });

  it('demande la période voulue à l’API', async () => {
    vi.mocked(rnbApi.get).mockResolvedValue(summary());
    await loadContributionSummary(7);
    await loadContributionSummary('all');
    expect(vi.mocked(rnbApi.get).mock.calls.map((c) => c[1]?.query)).toEqual([
      { days: 7 },
      { days: 'all' },
    ]);
  });

  it('garde les périodes chargées, null si aucune', async () => {
    vi.mocked(rnbApi.get)
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce(summary())
      .mockRejectedValueOnce(new Error('503'));
    expect(await loadContributionSummaries()).toEqual([summary()]);

    vi.mocked(rnbApi.get).mockRejectedValue(new Error('503'));
    expect(await loadContributionSummaries()).toBeNull();
  });

  it('rejette une réponse dont un cumul n’est pas un nombre', () => {
    expect(isCompleteSummary(summary())).toBe(true);
    expect(isCompleteSummary(summary({ window_days: null }))).toBe(true);
    expect(
      isCompleteSummary({ ...summary(), cities: { total: null, new: 1 } }),
    ).toBe(false);
    expect(isCompleteSummary({ ...summary(), top: null })).toBe(false);
    // a nested list or number missing: the component would read it
    expect(
      isCompleteSummary({
        ...summary(),
        top: { users: [], organizations: [] },
      }),
    ).toBe(false);
    expect(isCompleteSummary({ ...summary(), newcomers: { cities: [] } })).toBe(
      false,
    );
    expect(
      isCompleteSummary({ ...summary(), building_changes: { total: 3 } }),
    ).toBe(false);
    expect(isCompleteSummary({ ...summary(), window_days: undefined })).toBe(
      false,
    );
    expect(isCompleteSummary(null)).toBe(false);
  });

  it('rejette une réponse dont une ligne de liste est incomplète', () => {
    const { top, newcomers } = summary();
    const withTop = (patch: Record<string, unknown>) => ({
      ...summary(),
      top: { ...top, ...patch },
    });
    expect(isCompleteSummary(withTop({ users: [null] }))).toBe(false);
    expect(
      isCompleteSummary(withTop({ users: [{ username: 'alice', count: 2 }] })),
    ).toBe(false);
    expect(
      isCompleteSummary(withTop({ organizations: [{ name: 'Syndicat' }] })),
    ).toBe(false);
    expect(
      isCompleteSummary(
        withTop({ cities: [{ ...top.cities[0], department: { code: '33' } }] }),
      ),
    ).toBe(false);
    expect(
      isCompleteSummary({
        ...summary(),
        newcomers: { users: [...newcomers.users, { username: null }] },
      }),
    ).toBe(false);
  });

  it('renvoie null pour une réponse incomplète, sans planter', async () => {
    const { newcomers: _newcomers, ...withoutNewcomers } = summary();
    vi.mocked(rnbApi.get).mockResolvedValue(withoutNewcomers);
    expect(await loadContributionSummary()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('renvoie null quand l’API échoue, pour masquer la section', async () => {
    vi.mocked(rnbApi.get).mockRejectedValue(new Error('503'));
    expect(await loadContributionSummary()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
