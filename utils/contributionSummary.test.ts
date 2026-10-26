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
      { name: 'Commune de Talence', department: gironde, count: 42 },
      { name: 'Syndicat SIG', department: null, count: 18 },
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
  it('décrit les 3 chiffres clés avec leur évolution', () => {
    expect(keyFigures(summary())).toEqual([
      {
        value: 1248,
        label: 'communes déjà améliorées par la communauté',
        detail: '+12 ces 30 derniers jours',
      },
      {
        value: 86,
        label: 'organisations contributrices',
        detail: '+3 ces 30 derniers jours',
      },
      {
        value: 4310,
        label: 'modifications de bâtiments ces 30 derniers jours',
        detail: 'dont 520 par les contributeurs',
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

  it('accorde au singulier', () => {
    const figures = keyFigures(
      summary({
        cities: { total: 1, new: 1 },
        organizations: { total: 1, new: 1 },
        building_changes: { total: 1, contributions: 1 },
      }),
    );
    expect(figures.map((f) => f.label)).toEqual([
      'commune déjà améliorée par la communauté',
      'organisation contributrice',
      'modification de bâtiment ces 30 derniers jours',
    ]);
  });

  it('écrit le département en clair', () => {
    const [, organizations] = windowView(summary()).rankings;
    expect(organizations.rows).toEqual([
      { name: 'Commune de Talence', detail: 'Gironde (33)', count: 42 },
      { name: 'Syndicat SIG', detail: null, count: 18 },
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

  it('demande la fenêtre voulue à l’API', async () => {
    vi.mocked(rnbApi.get).mockResolvedValue(summary());
    await loadContributionSummary(7);
    expect(vi.mocked(rnbApi.get).mock.calls[0][1]?.query).toEqual({ days: 7 });
  });

  it('garde les fenêtres chargées, null si aucune', async () => {
    vi.mocked(rnbApi.get)
      .mockRejectedValueOnce(new Error('503'))
      .mockResolvedValueOnce(summary());
    expect(await loadContributionSummaries()).toEqual([summary()]);

    vi.mocked(rnbApi.get).mockRejectedValue(new Error('503'));
    expect(await loadContributionSummaries()).toBeNull();
  });

  it('rejette une réponse dont un cumul n’est pas un nombre', () => {
    expect(isCompleteSummary(summary())).toBe(true);
    expect(
      isCompleteSummary({ ...summary(), cities: { total: null, new: 1 } }),
    ).toBe(false);
    expect(isCompleteSummary({ ...summary(), top: null })).toBe(false);
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
