// Contribution summary (GET /contributions/summary/) shown in the
// « Participer au RNB » section of the home page.

import * as Sentry from '@sentry/nextjs';

import { rnbApi } from '@/utils/rnbApi';

export type SummaryDepartment = {
  code: string;
  name: string;
};

export type ContributionSummary = {
  updated_at: string;
  // length of the rolling window, null for the whole period (since the
  // opening of the collaborative edition)
  window_days: number | null;
  // cities where a contribution was made in the period, and how many made
  // their very first one in it
  cities: { total: number; new: number };
  // organizations whose members contributed in the period
  organizations: { total: number; new: number };
  // building changes of the period, all sources (imports included)
  building_changes: { total: number; contributions: number };
  top: {
    users: { username: string; organization: string | null; count: number }[];
    organizations: { name: string; count: number }[];
    cities: {
      insee_code: string;
      name: string;
      department: SummaryDepartment | null;
      count: number;
    }[];
  };
  // contributors whose very first contribution is in the period, the latest
  // first
  newcomers: {
    users: { username: string }[];
  };
};

// Periods offered by the API (?days=…): the last N days, or the whole period
// since the opening of the collaborative edition. The selected one sets every
// number of the section.
export const ALL_PERIOD = 'all';
export type Period = number | typeof ALL_PERIOD;
export const PERIODS: Period[] = [7, 30, ALL_PERIOD];
export const DEFAULT_PERIOD: Period = 30;

export const periodOf = (summary: ContributionSummary): Period =>
  summary.window_days ?? ALL_PERIOD;

export const periodLabel = (period: Period) =>
  period === ALL_PERIOD ? 'Depuis toujours' : `${period} derniers jours`;

// The summary is recomputed every hour by the API
export const SUMMARY_REVALIDATE = 3600;
// Timeout so that a slow API does not block the home page: computing the
// summary takes about 2 s when it is not in the API cache, up to 5 s for the
// whole period
const FETCH_TIMEOUT_MS = 10000;

// Every value the section reads: a response missing one of them (an older API
// version, a cached response) must hide the section, not break the page
const isNumber = (v: unknown) => typeof v === 'number';
const isText = (v: unknown) => typeof v === 'string';
// a list whose every element passes the check: one bad row would break the
// rendering of the whole section
const isList = (v: unknown, isRow: (row: any) => boolean) =>
  Array.isArray(v) && v.every((row) => isRow(row));

const isDepartment = (d: any) =>
  d === null || (isText(d?.code) && isText(d?.name));
const isUser = (u: any) =>
  isText(u?.username) &&
  (u.organization === null || isText(u.organization)) &&
  isNumber(u.count);
const isOrganization = (o: any) => isText(o?.name) && isNumber(o.count);
const isCity = (c: any) =>
  isText(c?.name) && isDepartment(c.department) && isNumber(c.count);
const isNewcomer = (u: any) => isText(u?.username);

export function isCompleteSummary(data: unknown): data is ContributionSummary {
  // optional chaining reads through anything, the checks below say what it is
  const d = data as Record<string, any> | null | undefined;
  return (
    (d?.window_days === null || isNumber(d?.window_days)) &&
    isNumber(d?.cities?.total) &&
    isNumber(d?.cities?.new) &&
    isNumber(d?.organizations?.total) &&
    isNumber(d?.organizations?.new) &&
    isNumber(d?.building_changes?.total) &&
    isNumber(d?.building_changes?.contributions) &&
    isList(d?.top?.users, isUser) &&
    isList(d?.top?.organizations, isOrganization) &&
    isList(d?.top?.cities, isCity) &&
    isList(d?.newcomers?.users, isNewcomer)
  );
}

// The summary, or null when the API fails or answers an incomplete summary:
// the section is then hidden, the error only goes to the server logs and to
// Sentry
export async function loadContributionSummary(
  period: Period = DEFAULT_PERIOD,
): Promise<ContributionSummary | null> {
  try {
    const data = await rnbApi.get<unknown>('contributions/summary/', {
      query: { days: period },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: SUMMARY_REVALIDATE },
    });
    if (!isCompleteSummary(data)) {
      throw new Error('Incomplete contribution summary');
    }
    return data;
  } catch (error) {
    console.error('Error fetching contribution summary:', error);
    Sentry.captureException(error, {
      tags: { source: 'contribution summary' },
    });
    return null;
  }
}

// One summary per period, in PERIODS order; null when none could be loaded
export async function loadContributionSummaries(): Promise<
  ContributionSummary[] | null
> {
  const summaries = await Promise.all(
    PERIODS.map((period) => loadContributionSummary(period)),
  );
  const loaded = summaries.filter((s): s is ContributionSummary => s !== null);
  return loaded.length ? loaded : null;
}

// What the section shows, decided from the data: kept apart from the
// component so that the edge cases can be tested

export const MAX_NEWCOMERS = 8;
// A ranking with fewer rows does not look like a ranking: its card is hidden
export const MIN_RANKING_ROWS = 2;

export const formatNumber = (n: number) => n.toLocaleString('fr-FR');

const plural = (n: number, singular: string, pluralForm: string) =>
  n > 1 ? pluralForm : singular;

// "Gironde (33)"
export const departmentLabel = (d: SummaryDepartment | null) =>
  d ? `${d.name} (${d.code})` : null;

export type FigureView = {
  value: number;
  label: string;
  // shown only when there is something to show: never "+0"
  detail: string | null;
};

export type RankingView = {
  title: string;
  rows: { name: string; detail: string | null; count: number }[];
};

// The key figures of the period, in the order of the rankings below them:
// building changes (contributors), organizations, cities. The first
// contributions are only told for a rolling window: over the whole period,
// every one is a first one.
export function keyFigures(summary: ContributionSummary): FigureView[] {
  const { cities, organizations, building_changes } = summary;
  const firstTimes = (n: number) =>
    summary.window_days !== null && n > 0
      ? `dont ${formatNumber(n)} pour la première fois`
      : null;
  return [
    {
      value: building_changes.total,
      label: plural(
        building_changes.total,
        'modification de bâtiment',
        'modifications de bâtiments',
      ),
      detail:
        building_changes.contributions > 0
          ? `dont ${formatNumber(building_changes.contributions)} par les contributeurs`
          : null,
    },
    {
      value: organizations.total,
      label: plural(
        organizations.total,
        'organisation contributrice',
        'organisations contributrices',
      ),
      detail: firstTimes(organizations.new),
    },
    {
      value: cities.total,
      label: plural(
        cities.total,
        'commune améliorée par la communauté',
        'communes améliorées par la communauté',
      ),
      detail: firstTimes(cities.new),
    },
  ];
}

// What follows the key figures: the rankings of 2 rows or more, and the
// usernames of the contributors who made their very first contribution
export function windowView(summary: ContributionSummary): {
  rankings: RankingView[];
  newcomersTitle: string;
  newcomers: string[];
} {
  const { top } = summary;
  const rankings: RankingView[] = [
    {
      title: 'Contributeurs les plus actifs',
      rows: top.users.map((u) => ({
        name: u.username,
        detail: u.organization,
        count: u.count,
      })),
    },
    {
      title: 'Organisations les plus actives',
      rows: top.organizations.map((o) => ({
        name: o.name,
        detail: null,
        count: o.count,
      })),
    },
    {
      title: 'Communes les plus éditées',
      rows: top.cities.map((c) => ({
        name: c.name,
        detail: departmentLabel(c.department),
        count: c.count,
      })),
    },
  ];
  return {
    rankings: rankings.filter((r) => r.rows.length >= MIN_RANKING_ROWS),
    // over the whole period, the latest of them
    newcomersTitle:
      summary.window_days === null
        ? 'Derniers contributeurs arrivés'
        : `Nouveaux contributeurs ces ${summary.window_days} derniers jours`,
    newcomers: summary.newcomers.users
      .slice(0, MAX_NEWCOMERS)
      .map((u) => u.username),
  };
}
