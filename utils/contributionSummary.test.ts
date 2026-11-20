import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@sentry/nextjs', () => ({ captureException: vi.fn() }));
vi.mock('@/utils/rnbApi', () => ({ rnbApi: { get: vi.fn() } }));

import { rnbApi } from '@/utils/rnbApi';
import {
  CITIES_RANKING_LIMIT,
  ContributionRankings,
  ContributionSummary,
  fullRankingViews,
  isCompleteRankings,
  isCompleteSummary,
  loadContributionRankings,
  loadContributionSummaries,
  MAX_NEWCOMERS,
  keyFigures,
  parsePeriod,
  rankingsOf,
  summaryOf,
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
  contributions: { total: 520 },
  top: {
    users: [
      {
        username: 'alice',
        organization: 'Mairie',
        organization_short_name: null,
        count: 9,
      },
      {
        username: 'bob',
        organization: null,
        organization_short_name: null,
        count: 4,
      },
    ],
    organizations: [
      { name: 'Commune de Talence', short_name: null, count: 42 },
      {
        name: 'Syndicat intercommunal SIG',
        short_name: 'Syndicat SIG',
        count: 18,
      },
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
  it('décrit les chiffres clés de la période', () => {
    expect(keyFigures(summary())).toEqual({
      contributions: { value: 520, label: 'contributions', detail: null },
      organizations: {
        value: 86,
        label: 'organisations contributrices',
        detail: 'dont 3 pour la première fois',
      },
      cities: {
        value: 1248,
        label: 'communes améliorées par la communauté',
        detail: 'dont 12 pour la première fois',
      },
    });
  });

  it('n’affiche pas d’évolution nulle', () => {
    const figures = keyFigures(
      summary({
        cities: { total: 10, new: 0 },
        organizations: { total: 2, new: 0 },
      }),
    );
    expect(figures.organizations.detail).toBeNull();
    expect(figures.cities.detail).toBeNull();
  });

  it('ne parle pas de première fois sur toute la période', () => {
    const figures = keyFigures(summary({ window_days: null }));
    expect(Object.values(figures).map((f) => f.detail)).toEqual([
      null,
      null,
      null,
    ]);
  });

  it('accorde au singulier', () => {
    const figures = keyFigures(
      summary({
        cities: { total: 1, new: 1 },
        organizations: { total: 1, new: 1 },
        contributions: { total: 1 },
      }),
    );
    expect(Object.values(figures).map((f) => f.label)).toEqual([
      'contribution',
      'organisation contributrice',
      'commune améliorée par la communauté',
    ]);
  });

  it('lit la période dans l’URL, la période par défaut sinon', () => {
    expect(parsePeriod('7')).toBe(7);
    expect(parsePeriod('all')).toBe('all');
    expect(parsePeriod(undefined)).toBe(30);
    expect(parsePeriod('abc')).toBe(30);
    expect(parsePeriod('-7')).toBe(30);
    expect(parsePeriod(['7'])).toBe(30);
  });

  it('retombe sur la période par défaut si la période manque', () => {
    const summaries = [summary({ window_days: 7 }), summary()];
    expect(summaryOf(summaries, 7).window_days).toBe(7);
    expect(summaryOf(summaries, 'all').window_days).toBe(30);
    expect(summaryOf([summary({ window_days: 7 })], 'all').window_days).toBe(7);
  });

  it('écrit le département des communes, pas des organisations', () => {
    const [, organizations, cities] = windowView(summary()).rankings;
    expect(organizations.rows.map((r) => r.detail)).toEqual([null, null]);
    expect(cities.rows.map((r) => r.detail)).toEqual([
      { name: 'Gironde (33)', shortName: null },
      { name: 'Gironde (33)', shortName: null },
    ]);
  });

  it('garde le nom court des organisations, pour l’afficher', () => {
    const [users, organizations] = windowView(
      summary({
        top: {
          ...summary().top,
          users: [
            {
              username: 'alice',
              organization: 'Ministère de la Transition écologique',
              organization_short_name: 'MTE',
              count: 9,
            },
            {
              username: 'bob',
              organization: null,
              organization_short_name: null,
              count: 4,
            },
          ],
        },
      }),
    ).rankings;
    expect(users.rows.map((r) => r.detail)).toEqual([
      { name: 'Ministère de la Transition écologique', shortName: 'MTE' },
      null,
    ]);
    expect(organizations.rows.map((r) => r.name)).toEqual([
      { name: 'Commune de Talence', shortName: null },
      { name: 'Syndicat intercommunal SIG', shortName: 'Syndicat SIG' },
    ]);
  });

  it('accepte une réponse sans nom court (ancienne API)', () => {
    const old = {
      ...summary(),
      top: {
        ...summary().top,
        users: [
          { username: 'alice', organization: 'MTE', count: 9 },
          { username: 'bob', organization: null, count: 4 },
        ],
        organizations: [
          { name: 'MTE', count: 9 },
          { name: 'Valoen', count: 4 },
        ],
      },
    };
    expect(isCompleteSummary(old)).toBe(true);
    const [users, organizations] = windowView(old).rankings;
    expect(users.rows[0].detail).toEqual({ name: 'MTE', shortName: null });
    expect(organizations.rows[0].name).toEqual({
      name: 'MTE',
      shortName: null,
    });
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

describe('loadContributionSummaries', () => {
  beforeEach(() => {
    vi.mocked(rnbApi.get).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const periods = () => [
    summary({ window_days: 7 }),
    summary(),
    summary({ window_days: null }),
  ];

  it('charge les 3 périodes en une seule requête', async () => {
    vi.mocked(rnbApi.get).mockResolvedValue({ summaries: periods() });
    expect(await loadContributionSummaries()).toEqual(periods());
    expect(vi.mocked(rnbApi.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(rnbApi.get).mock.calls[0][0]).toBe(
      'contributions/summaries/',
    );
  });

  it('écarte une période incomplète, null si aucune n’est complète', async () => {
    const [week, month] = periods();
    vi.mocked(rnbApi.get).mockResolvedValue({
      summaries: [week, { ...month, top: null }],
    });
    expect(await loadContributionSummaries()).toEqual([week]);

    vi.mocked(rnbApi.get).mockResolvedValue({
      summaries: [{ ...month, top: null }],
    });
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
    expect(isCompleteSummary({ ...summary(), contributions: {} })).toBe(false);
    // the previous format, before contributions
    const { contributions: _, ...previous } = summary();
    expect(
      isCompleteSummary({
        ...previous,
        building_changes: { total: 4310, contributions: 520 },
      }),
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
        withTop({
          organizations: [{ name: 'Syndicat', short_name: 3, count: 1 }],
        }),
      ),
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

  it('renvoie null pour une réponse sans liste de synthèses, sans planter', async () => {
    vi.mocked(rnbApi.get).mockResolvedValue(summary());
    expect(await loadContributionSummaries()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('renvoie null quand l’API échoue, pour masquer la section', async () => {
    vi.mocked(rnbApi.get).mockRejectedValue(new Error('503'));
    expect(await loadContributionSummaries()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });
});

// the full rankings of the details page, as GET /contributions/rankings/ sends
// them: no short name
const rankings = (
  overrides: Partial<ContributionRankings> = {},
): ContributionRankings => ({
  updated_at: '2026-10-15T14:10:00+02:00',
  window_days: 30,
  since: '2026-09-15T14:10:00+02:00',
  users: [
    { username: 'alice', organization: 'Mairie', count: 9 },
    { username: 'bob', organization: null, count: 4 },
    { username: 'dave', organization: null, count: 1 },
  ],
  organizations: [{ name: 'Mairie', count: 9 }],
  cities: [
    { insee_code: '33522', name: 'Talence', department: gironde, count: 7 },
  ],
  ...overrides,
});

describe('classements complets', () => {
  beforeEach(() => {
    vi.mocked(rnbApi.get).mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('charge les classements des 3 périodes en une requête', async () => {
    const periods = [
      rankings({ window_days: 7 }),
      rankings(),
      rankings({ window_days: null, since: null }),
    ];
    vi.mocked(rnbApi.get).mockResolvedValue({ rankings: periods });
    expect(await loadContributionRankings()).toEqual(periods);
    expect(vi.mocked(rnbApi.get)).toHaveBeenCalledTimes(1);
    expect(vi.mocked(rnbApi.get).mock.calls[0][0]).toBe(
      'contributions/rankings/',
    );
  });

  it('écarte une période incomplète, null si l’API échoue', async () => {
    vi.mocked(rnbApi.get).mockResolvedValue({
      rankings: [rankings({ window_days: 7 }), { ...rankings(), cities: null }],
    });
    expect(await loadContributionRankings()).toEqual([
      rankings({ window_days: 7 }),
    ]);

    vi.mocked(rnbApi.get).mockResolvedValue({ summaries: [] });
    expect(await loadContributionRankings()).toBeNull();

    vi.mocked(rnbApi.get).mockRejectedValue(new Error('500'));
    expect(await loadContributionRankings()).toBeNull();
  });

  it('rejette des classements incomplets', () => {
    expect(isCompleteRankings(rankings())).toBe(true);
    expect(isCompleteRankings(rankings({ window_days: null }))).toBe(true);
    expect(isCompleteRankings({ ...rankings(), window_days: undefined })).toBe(
      false,
    );
    expect(isCompleteRankings({ ...rankings(), users: [{ count: 1 }] })).toBe(
      false,
    );
    expect(
      isCompleteRankings({ ...rankings(), organizations: [{ name: 'X' }] }),
    ).toBe(false);
    expect(
      isCompleteRankings({
        ...rankings(),
        cities: [{ name: 'Talence', department: { code: '33' }, count: 1 }],
      }),
    ).toBe(false);
    expect(isCompleteRankings(null)).toBe(false);
  });

  it('trouve les classements de la période, sinon rien', () => {
    const week = rankings({ window_days: 7 });
    const all = rankings({ window_days: null, since: null });
    expect(rankingsOf([week, all], 7)).toBe(week);
    expect(rankingsOf([week, all], 'all')).toBe(all);
    expect(rankingsOf([week, all], 30)).toBeNull();
    expect(rankingsOf(null, 30)).toBeNull();
  });

  it('garde toutes les lignes, même une seule, et masque les listes vides', () => {
    const views = fullRankingViews(rankings({ organizations: [] }));
    expect(views.map((v) => v.shortTitle)).toEqual([
      'Contributeurs',
      'Communes',
    ]);
    expect(views[0].rows).toHaveLength(3);
    expect(views[1].rows).toHaveLength(1);
    expect(views[1].title).toBe('Communes les plus éditées');
  });

  it('dit que la liste des communes est plafonnée', () => {
    const cities = Array.from({ length: CITIES_RANKING_LIMIT }, (_, i) => ({
      insee_code: String(i),
      name: `Commune ${i}`,
      department: null,
      count: 1,
    }));
    const [, , cityView] = fullRankingViews(rankings({ cities }));
    expect(cityView.title).toBe('Les 100 communes les plus éditées');
    expect(cityView.rows[0].detail).toBeNull();
  });
});
