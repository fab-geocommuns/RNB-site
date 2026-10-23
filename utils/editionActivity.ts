// Edition activity (GET /editions/activity/) and import statistics
// (GET /buildings/change_stats/) displayed on the home page.

import { rnbApi } from '@/utils/rnbApi';

export type EditionActivityDepartment = {
  code: string;
  name: string;
};

export type EditionActivity = {
  period: {
    key: string;
    since: string | null;
  };
  updated_at: string;
  totals: {
    editions: number;
    cities: number;
    editors: number;
  };
  // window of the same length just before, null for "all"
  previous_period: {
    since: string;
    until: string;
    editions: number;
  } | null;
  // last 12 months, current month last ("2026-10")
  monthly: {
    month: string;
    editions: number;
  }[];
  top: {
    users: {
      rank: number;
      username: string;
      organization_short_name: string | null;
      count: number;
    }[];
    organizations: {
      rank: number;
      name: string;
      short_name: string | null;
      count: number;
    }[];
    cities: {
      rank: number;
      insee_code: string;
      name: string;
      department: EditionActivityDepartment | null;
      count: number;
    }[];
    departments: {
      rank: number;
      code: string;
      name: string;
      count: number;
    }[];
  };
  newcomers: {
    users: {
      username: string;
      organization_short_name: string | null;
      first_edition_at: string;
    }[];
    cities: {
      insee_code: string;
      name: string;
      department: EditionActivityDepartment | null;
      first_edition_at: string;
    }[];
    departments: {
      code: string;
      name: string;
      first_edition_at: string;
    }[];
    // total numbers (the lists are limited), null for "all"
    count: {
      users: number;
      cities: number;
      departments: number;
    } | null;
  };
};

type ChangeStatsDay = {
  date: string;
  events_count: {
    import_bdtopo: number;
    import_bal: number;
    contributions: number;
  };
};

// The API rejects change_stats requests starting before this date
export const IMPORT_STATS_SINCE = '2024-01-01';

// Periods offered on the home page: rolling windows, compared with the window
// of the same length just before. Longer windows (12 months, all time) are left
// out until the API computes them fast enough.
export type ActivityPeriod = {
  key: string;
  label: string;
  query: { days: number };
};

export const ACTIVITY_PERIODS: ActivityPeriod[] = [
  { key: 'last_7_days', label: '7 jours', query: { days: 7 } },
  { key: 'last_30_days', label: '30 jours', query: { days: 30 } },
];

export const DEFAULT_PERIOD_KEY = 'last_30_days';

// "last_30_days" → "30 derniers jours"
export function windowLabel(key: string): string | null {
  const days = Number(key.match(/^last_(\d+)_days$/)?.[1]);
  if (!days) return null;
  return days > 1 ? `${days} derniers jours` : 'dernier jour';
}

// Short sentence summing up the period, used as the block title
export function activityHeadline(activity: EditionActivity): string {
  const { editions, cities } = activity.totals;
  const window = windowLabel(activity.period.key);
  const when = window ? `Ces ${window}` : 'Récemment';
  if (editions === 0) {
    return `${when}, aucune contribution`;
  }
  const subject =
    cities > 1
      ? `${cities.toLocaleString('fr-FR')} communes ont amélioré leurs bâtiments`
      : `${cities} commune a amélioré ses bâtiments`;
  return `${when}, ${subject}`;
}

// Evolution of the edition count compared with the previous period, in %
export function editionsTrend(activity: EditionActivity): number | null {
  const previous = activity.previous_period?.editions;
  if (!previous) return null;
  return Math.round(((activity.totals.editions - previous) / previous) * 100);
}

// Number of BD TOPO and BAL imports, contributions left out
export function countImports(days: ChangeStatsDay[]): number {
  return days.reduce(
    (sum, day) =>
      sum + day.events_count.import_bdtopo + day.events_count.import_bal,
    0,
  );
}

// Short timeout so that a slow API does not block the home page
const FETCH_TIMEOUT_MS = 3000;

const fetchOptions = (revalidate?: number) => ({
  signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  ...(revalidate !== undefined && { next: { revalidate } }),
});

// Activity of every period of ACTIVITY_PERIODS, in the same order. A period
// whose request fails is left out; fails only when every request fails.
export async function getEditionActivities(
  revalidate?: number,
): Promise<EditionActivity[]> {
  const results = await Promise.allSettled(
    ACTIVITY_PERIODS.map((p) =>
      rnbApi.get<EditionActivity>('editions/activity/', {
        query: p.query,
        ...fetchOptions(revalidate),
      }),
    ),
  );
  const activities = results.flatMap((r) =>
    r.status === 'fulfilled' ? [r.value] : [],
  );
  if (activities.length === 0) {
    throw (results[0] as PromiseRejectedResult).reason;
  }
  return activities;
}

export async function getImportCount(revalidate?: number): Promise<number> {
  const until = new Date().toISOString().slice(0, 10);
  const days = await rnbApi.get<ChangeStatsDay[]>('buildings/change_stats/', {
    query: { since: IMPORT_STATS_SINCE, until },
    ...fetchOptions(revalidate),
  });
  return countImports(days);
}
