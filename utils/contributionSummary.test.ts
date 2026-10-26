import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/utils/rnbApi', () => ({ rnbApi: { get: vi.fn() } }));

import { rnbApi } from '@/utils/rnbApi';
import {
  ContributionSummary,
  loadContributionSummary,
  MAX_NEW_CITIES,
  summaryView,
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
  new_cities: [{ insee_code: '33522', name: 'Talence', department: gironde }],
  ...overrides,
});

describe('summaryView', () => {
  it('décrit les 3 chiffres clés avec leur évolution', () => {
    expect(summaryView(summary()).figures).toEqual([
      {
        value: 1248,
        label: 'communes déjà améliorées par la communauté',
        detail: '+12 ce mois-ci',
      },
      {
        value: 86,
        label: 'organisations contributrices',
        detail: '+3 ce mois-ci',
      },
      {
        value: 4310,
        label: 'modifications de bâtiments ces 30 derniers jours',
        detail: 'dont 520 par les contributeurs',
      },
    ]);
  });

  it('masque un cumul pas encore calculé', () => {
    const { figures } = summaryView(
      summary({
        cities: { total: null, new: 2 },
        organizations: { total: null, new: 0 },
      }),
    );
    expect(figures.map((f) => f.value)).toEqual([4310]);
  });

  it('n’affiche pas d’évolution nulle', () => {
    const { figures } = summaryView(
      summary({
        cities: { total: 10, new: 0 },
        organizations: { total: 2, new: 0 },
        building_changes: { total: 50, contributions: 0 },
      }),
    );
    expect(figures.map((f) => f.detail)).toEqual([null, null, null]);
  });

  it('accorde au singulier', () => {
    const { figures } = summaryView(
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
    const [, organizations] = summaryView(summary()).rankings;
    expect(organizations.rows).toEqual([
      { name: 'Commune de Talence', detail: 'Gironde (33)', count: 42 },
      { name: 'Syndicat SIG', detail: null, count: 18 },
    ]);
  });

  it('masque un classement de moins de 2 lignes', () => {
    const { rankings } = summaryView(
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

  it('limite les nouvelles communes à 8 et accepte une liste vide', () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      insee_code: `${i}`,
      name: `Commune ${i}`,
      department: null,
    }));
    expect(summaryView(summary({ new_cities: many })).newCities).toHaveLength(
      MAX_NEW_CITIES,
    );
    expect(summaryView(summary({ new_cities: [] })).newCities).toEqual([]);
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

  it('renvoie null quand l’API échoue, pour masquer la section', async () => {
    vi.mocked(rnbApi.get).mockRejectedValue(new Error('503'));
    expect(await loadContributionSummary()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
