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
  activity: {
    contributions: 118,
    cities: 35,
    contributors: 9,
    new_contributors: 2,
    previous_contributions: 100,
  },
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

describe('summaryView', () => {
  it('décrit les 3 chiffres clés avec leur évolution', () => {
    expect(summaryView(summary()).figures).toEqual([
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

  it('liste les nouveaux contributeurs, 8 au plus', () => {
    expect(summaryView(summary()).newcomers).toEqual(['carol']);
    const users = Array.from({ length: 12 }, (_, i) => ({
      username: `user${i}`,
    }));
    expect(
      summaryView(summary({ newcomers: { users } })).newcomers,
    ).toHaveLength(MAX_NEWCOMERS);
    expect(
      summaryView(summary({ newcomers: { users: [] } })).newcomers,
    ).toEqual([]);
  });
});

describe('summaryView, variante complet', () => {
  it('décrit l’activité de la période avec sa tendance', () => {
    expect(summaryView(summary(), 'complet').figures).toEqual([
      {
        value: 118,
        label: 'contributions ces 30 derniers jours',
        detail: '+18 % par rapport aux 30 jours précédents',
      },
      {
        value: 35,
        label: 'communes éditées',
        detail: 'dont 12 pour la première fois',
      },
      { value: 9, label: 'contributeurs actifs', detail: 'dont 2 nouveaux' },
    ]);
  });

  it('n’affiche pas de tendance sans période précédente', () => {
    const [contributions] = summaryView(
      summary({
        activity: { ...summary().activity, previous_contributions: 0 },
      }),
      'complet',
    ).figures;
    expect(contributions.detail).toBeNull();
  });

  it('garde les 3 classements dès qu’ils ont une ligne', () => {
    const { rankings } = summaryView(
      summary({
        top: {
          ...summary().top,
          users: [{ username: 'alice', organization: null, count: 3 }],
        },
      }),
      'complet',
    );
    expect(rankings).toHaveLength(3);
  });
});

describe('summaryView, variante récit', () => {
  const sentence = (s: ContributionSummary) =>
    summaryView(s, 'recit')
      .story.map((p) => p.text)
      .join('');

  it('raconte la période en une phrase, chiffres à part', () => {
    expect(sentence(summary())).toBe(
      'Ces 30 derniers jours, 118 contributions ont amélioré 35 communes, grâce à 9 contributeurs.',
    );
    expect(
      summaryView(summary(), 'recit')
        .story.filter((p) => p.isNumber)
        .map((p) => p.text),
    ).toEqual(['118', '35', '9']);
  });

  it('accorde au singulier et gère une période vide', () => {
    const one = {
      ...summary().activity,
      contributions: 1,
      cities: 1,
      contributors: 1,
    };
    expect(sentence(summary({ activity: one }))).toBe(
      'Ces 30 derniers jours, 1 contribution a amélioré 1 commune, grâce à 1 contributeur.',
    );
    expect(sentence(summary({ activity: { ...one, contributions: 0 } }))).toBe(
      'Ces 30 derniers jours, aucune contribution pour l’instant.',
    );
  });

  it('met en avant le premier de chaque classement', () => {
    expect(summaryView(summary(), 'recit').podium).toEqual([
      {
        title: 'Contributeur le plus actif',
        name: 'alice',
        detail: 'Mairie',
        count: 9,
      },
      {
        title: 'Organisation la plus active',
        name: 'Commune de Talence',
        detail: 'Gironde (33)',
        count: 42,
      },
      {
        title: 'Commune la plus éditée',
        name: 'Talence',
        detail: 'Gironde (33)',
        count: 7,
      },
    ]);
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
    const { activity: _activity, ...withoutActivity } = summary();
    vi.mocked(rnbApi.get).mockResolvedValue(withoutActivity);
    expect(await loadContributionSummary()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('renvoie null quand l’API échoue, pour masquer la section', async () => {
    vi.mocked(rnbApi.get).mockRejectedValue(new Error('503'));
    expect(await loadContributionSummary()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});
