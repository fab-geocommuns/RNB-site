// Contribution summaries (GET /contributions/summaries/) shown in the
// « Participer au RNB » section of the home page, and the full rankings
// (GET /contributions/rankings/) of its details page.

import * as Sentry from '@sentry/nextjs';

import { rnbApi } from '@/utils/rnbApi';

export type SummaryDepartment = {
  code: string;
  name: string;
};

// The most active first. organization: the full name. The short names are
// absent from the API versions that sent a single label (the short name, else
// the name), and from the ones that send no short name at all.
export type Rankings = {
  users: {
    username: string;
    organization: string | null;
    organization_short_name?: string | null;
    count: number;
  }[];
  organizations: {
    name: string;
    short_name?: string | null;
    count: number;
  }[];
  cities: {
    insee_code: string;
    name: string;
    department: SummaryDepartment | null;
    count: number;
  }[];
};

// The full rankings of a period: every contributor and organization, the
// cities capped by the API (CITIES_RANKING_LIMIT)
export type ContributionRankings = Rankings & {
  updated_at: string;
  window_days: number | null;
  // start of the window, null for the whole period
  since: string | null;
};

export type ContributionSummary = {
  updated_at: string;
  // length of the rolling window, null for the whole period
  window_days: number | null;
  // cities where a contribution was made in the period, and how many made
  // their very first one in it
  cities: { total: number; new: number };
  // organizations whose members contributed in the period
  organizations: { total: number; new: number };
  // edition requests of the period, imports excluded: a merge or a split
  // counts once, whatever the number of buildings it touches
  contributions: { total: number };
  // the first rows of each ranking
  top: Rankings;
  // contributors whose very first contribution is in the period, the latest
  // first
  newcomers: {
    users: { username: string }[];
  };
};

// Periods offered by the API, all returned together: the last N days, or the
// whole period. The selected
// one sets every number of the section.
export const ALL_PERIOD = 'all';
export type Period = number | typeof ALL_PERIOD;
export const DEFAULT_PERIOD: Period = 30;

export const periodOf = (summary: { window_days: number | null }): Period =>
  summary.window_days ?? ALL_PERIOD;

export const periodLabel = (period: Period) =>
  period === ALL_PERIOD ? 'Depuis toujours' : `${period} derniers jours`;

// The period in a URL (?periode=7, ?periode=all), so that the details page
// opens on the period chosen in the section; anything else is the default one
export const parsePeriod = (value: unknown): Period => {
  if (value === ALL_PERIOD) return ALL_PERIOD;
  const days = Number(value);
  return typeof value === 'string' && Number.isInteger(days) && days > 0
    ? days
    : DEFAULT_PERIOD;
};

// The summary of a period, else of the default one, else the first one
export const summaryOf = (
  summaries: ContributionSummary[],
  period: Period,
): ContributionSummary =>
  summaries.find((s) => periodOf(s) === period) ??
  summaries.find((s) => periodOf(s) === DEFAULT_PERIOD) ??
  summaries[0];

// The summary is recomputed every hour by the API
export const SUMMARY_REVALIDATE = 3600;
// Timeout so that a slow API does not block the home page. Computing the
// summaries takes about 8 s when they are outdated in the API cache; with no
// cache at all (right after an API deploy), the API may wait up to 20 s for
// another request computing them first.
const FETCH_TIMEOUT_MS = 30000;

// Every value the section reads: a response missing one of them (an older API
// version, a cached response) must hide the section, not break the page
const isNumber = (v: unknown) => typeof v === 'number';
const isText = (v: unknown) => typeof v === 'string';
const isOptionalText = (v: unknown) => v == null || isText(v);
// a list whose every element passes the check: one bad row would break the
// rendering of the whole section
const isList = (v: unknown, isRow: (row: any) => boolean) =>
  Array.isArray(v) && v.every((row) => isRow(row));

const isDepartment = (d: any) =>
  d === null || (isText(d?.code) && isText(d?.name));
const isUser = (u: any) =>
  isText(u?.username) &&
  (u.organization === null || isText(u.organization)) &&
  isOptionalText(u.organization_short_name) &&
  isNumber(u.count);
const isOrganization = (o: any) =>
  isText(o?.name) && isOptionalText(o.short_name) && isNumber(o.count);
const isCity = (c: any) =>
  isText(c?.name) && isDepartment(c.department) && isNumber(c.count);
const isNewcomer = (u: any) => isText(u?.username);

const hasCompleteRankings = (d: Record<string, any> | null | undefined) =>
  isList(d?.users, isUser) &&
  isList(d?.organizations, isOrganization) &&
  isList(d?.cities, isCity);

export function isCompleteRankings(
  data: unknown,
): data is ContributionRankings {
  const d = data as Record<string, any> | null | undefined;
  return (
    (d?.window_days === null || isNumber(d?.window_days)) &&
    hasCompleteRankings(d)
  );
}

export function isCompleteSummary(data: unknown): data is ContributionSummary {
  // optional chaining reads through anything, the checks below say what it is
  const d = data as Record<string, any> | null | undefined;
  return (
    (d?.window_days === null || isNumber(d?.window_days)) &&
    isNumber(d?.cities?.total) &&
    isNumber(d?.cities?.new) &&
    isNumber(d?.organizations?.total) &&
    isNumber(d?.organizations?.new) &&
    isNumber(d?.contributions?.total) &&
    hasCompleteRankings(d?.top) &&
    isList(d?.newcomers?.users, isNewcomer)
  );
}

// The periods of an endpoint, shortest first, or null when the API fails or
// answers no complete period: the error only goes to the server logs and to
// Sentry. A single request: the API computes the periods at the same instant,
// so that a shorter period never counts more than a longer one; separate
// requests could get periods computed an hour apart.
async function loadPeriods<T>(
  path: string,
  key: string,
  isComplete: (data: unknown) => data is T,
): Promise<T[] | null> {
  try {
    const data = await rnbApi.get<Record<string, unknown>>(path, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: SUMMARY_REVALIDATE },
    });
    const periods = Array.isArray(data?.[key]) ? (data[key] as unknown[]) : [];
    // a period the API answers incompletely is left out, the others shown
    const complete = periods.filter(isComplete);
    if (!complete.length) {
      throw new Error(`No complete period in ${path}`);
    }
    return complete;
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    Sentry.captureException(error, {
      tags: { source: 'contribution summary' },
    });
    return null;
  }
}

// The summary of every period; null hides the section
export const loadContributionSummaries = () =>
  loadPeriods('contributions/summaries/', 'summaries', isCompleteSummary);

// The full rankings of every period, for the details page; null shows the
// first rows of the summaries instead
export const loadContributionRankings = () =>
  loadPeriods('contributions/rankings/', 'rankings', isCompleteRankings);

// The rankings of a period, if the API answered them
export const rankingsOf = (
  rankings: ContributionRankings[] | null,
  period: Period,
): ContributionRankings | null =>
  rankings?.find((r) => periodOf(r) === period) ?? null;

// What the section shows, decided from the data: kept apart from the
// component so that the edge cases can be tested

export const MAX_NEWCOMERS = 8;
// A ranking with fewer rows does not look like a ranking: its card is hidden
export const MIN_RANKING_ROWS = 2;

export const formatNumber = (n: number) => n.toLocaleString('fr-FR');

const plural = (n: number, singular: string, pluralForm: string) =>
  n > 1 ? pluralForm : singular;

// "Gironde (33)"
export const departmentLabel = (d: SummaryDepartment) =>
  `${d.name} (${d.code})`;

export type FigureView = {
  value: number;
  label: string;
  // shown only when there is something to show: never "+0"
  detail: string | null;
};

// A name and, for an organization, its short name: shown in place of the
// name, which then goes into a tooltip (OrganizationName)
export type RowName = { name: string; shortName: string | null };

const plainName = (name: string): RowName => ({ name, shortName: null });

export type RankingView = {
  title: string;
  // what is ranked, as a tab label
  shortTitle: string;
  // headers of a table of the ranking: the name column, the detail column
  // (none for the organizations)
  nameHeader: string;
  detailHeader: string | null;
  rows: { name: RowName; detail: RowName | null; count: number }[];
};

// The API sends at most this many cities in the full rankings, there are
// thousands of them
export const CITIES_RANKING_LIMIT = 100;

// The 3 rankings: contributors, organizations, cities
export function rankingViews(rankings: Rankings): RankingView[] {
  const { users, organizations, cities } = rankings;
  return [
    {
      title: 'Contributeurs les plus actifs',
      shortTitle: 'Contributeurs',
      nameHeader: 'Contributeur',
      detailHeader: 'Organisation',
      rows: users.map((u) => ({
        name: plainName(u.username),
        detail: u.organization
          ? {
              name: u.organization,
              shortName: u.organization_short_name ?? null,
            }
          : null,
        count: u.count,
      })),
    },
    {
      title: 'Organisations les plus actives',
      shortTitle: 'Organisations',
      nameHeader: 'Organisation',
      detailHeader: null,
      rows: organizations.map((o) => ({
        name: { name: o.name, shortName: o.short_name ?? null },
        detail: null,
        count: o.count,
      })),
    },
    {
      title: 'Communes les plus éditées',
      shortTitle: 'Communes',
      nameHeader: 'Commune',
      detailHeader: 'Département',
      rows: cities.map((c) => ({
        name: plainName(c.name),
        detail: c.department ? plainName(departmentLabel(c.department)) : null,
        count: c.count,
      })),
    },
  ];
}

// The full rankings of the details page, for its tables: every one with a
// row. The capped list of cities says so in its title.
export function fullRankingViews(rankings: Rankings): RankingView[] {
  return rankingViews(rankings)
    .map((ranking, i) =>
      i === 2 && ranking.rows.length >= CITIES_RANKING_LIMIT
        ? {
            ...ranking,
            title: `Les ${CITIES_RANKING_LIMIT} communes les plus éditées`,
          }
        : ranking,
    )
    .filter((r) => r.rows.length > 0);
}

// The key figures of the period. The first contributions are only told for a
// rolling window: over the whole period, every one is a first one.
export function keyFigures(summary: ContributionSummary): {
  contributions: FigureView;
  organizations: FigureView;
  cities: FigureView;
} {
  const { cities, organizations, contributions } = summary;
  const firstTimes = (n: number) =>
    summary.window_days !== null && n > 0
      ? `dont ${formatNumber(n)} pour la première fois`
      : null;
  return {
    contributions: {
      value: contributions.total,
      label: plural(contributions.total, 'contribution', 'contributions'),
      detail: null,
    },
    organizations: {
      value: organizations.total,
      label: plural(
        organizations.total,
        'organisation contributrice',
        'organisations contributrices',
      ),
      detail: firstTimes(organizations.new),
    },
    cities: {
      value: cities.total,
      label: plural(
        cities.total,
        'commune améliorée par la communauté',
        'communes améliorées par la communauté',
      ),
      detail: firstTimes(cities.new),
    },
  };
}

// The details of the period: the rankings of 2 rows or more, and the
// usernames of the contributors who made their very first contribution
export function windowView(summary: ContributionSummary): {
  rankings: RankingView[];
  newcomersTitle: string;
  newcomers: string[];
} {
  return {
    rankings: rankingViews(summary.top).filter(
      (r) => r.rows.length >= MIN_RANKING_ROWS,
    ),
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
