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
  // length of the rolling window of the rankings and of the "new" counts
  window_days: number;
  // cities where at least one contribution was ever made (null until the
  // nightly computation), and how many made their very first one in the window
  cities: { total: number | null; new: number };
  // organizations whose members contributed at least once
  organizations: { total: number | null; new: number };
  // building changes of the window, all sources (imports included)
  building_changes: { total: number; contributions: number };
  top: {
    users: { username: string; organization: string | null; count: number }[];
    organizations: {
      name: string;
      department: SummaryDepartment | null;
      count: number;
    }[];
    cities: {
      insee_code: string;
      name: string;
      department: SummaryDepartment | null;
      count: number;
    }[];
  };
  // cities whose very first contribution is in the window, the latest first
  new_cities: {
    insee_code: string;
    name: string;
    department: SummaryDepartment | null;
  }[];
};

// The summary is recomputed every hour by the API
export const SUMMARY_REVALIDATE = 3600;
// Short timeout so that a slow API does not block the home page: computing the
// summary takes about 2 s when it is not in the API cache
const FETCH_TIMEOUT_MS = 5000;

// The summary, or null when the API fails: the section is then hidden, the
// error only goes to the server logs and to Sentry
export async function loadContributionSummary(): Promise<ContributionSummary | null> {
  try {
    return await rnbApi.get<ContributionSummary>('contributions/summary/', {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: SUMMARY_REVALIDATE },
    });
  } catch (error) {
    console.error('Error fetching contribution summary:', error);
    Sentry.captureException(error, {
      tags: { source: 'contribution summary' },
    });
    return null;
  }
}

// What the section shows, decided from the data: kept apart from the
// component so that the edge cases can be tested

export const MAX_NEW_CITIES = 8;
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

export type SummaryView = {
  figures: FigureView[];
  rankings: RankingView[];
  newCities: { name: string; department: string | null }[];
};

export function summaryView(summary: ContributionSummary): SummaryView {
  const { cities, organizations, building_changes, top } = summary;
  const days = summary.window_days;

  // a cumulative count is missing until the API computed it for the first time
  const candidates: (Omit<FigureView, 'value'> & { value: number | null })[] = [
    {
      value: cities.total,
      label: plural(
        cities.total ?? 0,
        'commune déjà améliorée par la communauté',
        'communes déjà améliorées par la communauté',
      ),
      detail: cities.new > 0 ? `+${formatNumber(cities.new)} ce mois-ci` : null,
    },
    {
      value: organizations.total,
      label: plural(
        organizations.total ?? 0,
        'organisation contributrice',
        'organisations contributrices',
      ),
      detail:
        organizations.new > 0
          ? `+${formatNumber(organizations.new)} ce mois-ci`
          : null,
    },
    {
      value: building_changes.total,
      label: `${plural(
        building_changes.total,
        'modification de bâtiment',
        'modifications de bâtiments',
      )} ces ${days} derniers jours`,
      detail:
        building_changes.contributions > 0
          ? `dont ${formatNumber(building_changes.contributions)} par les contributeurs`
          : null,
    },
  ];
  const figures = candidates.filter((f): f is FigureView => f.value !== null);

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
        detail: departmentLabel(o.department),
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
  ].filter((r) => r.rows.length >= MIN_RANKING_ROWS);

  return {
    figures,
    rankings,
    newCities: summary.new_cities.slice(0, MAX_NEW_CITIES).map((c) => ({
      name: c.name,
      department: departmentLabel(c.department),
    })),
  };
}
