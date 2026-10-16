// Edition activity (GET /editions/activity/) and import statistics
// (GET /buildings/change_stats/) displayed on the home page.

export type EditionActivityDepartment = {
  code: string;
  name: string;
};

export type EditionActivity = {
  period: {
    key: string;
    since: string | null;
    until: string | null;
  };
  available_periods: string[];
  updated_at: string;
  totals: {
    editions: number;
    cities: number;
    editors: number;
  };
  // period the edition count is compared with, null for "all"
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

export type ImportStatsYear = {
  year: number;
  bdtopo: number;
  bal: number;
};

export type ImportStats = {
  total: number;
  years: ImportStatsYear[];
};

// The API rejects change_stats requests starting before this date
export const IMPORT_STATS_SINCE = '2024-01-01';

const PERIOD_LABELS: Record<string, string> = {
  current_month: 'Ce mois-ci',
  last_month: 'Le mois dernier',
  all: 'Depuis toujours',
};

export function periodLabel(key: string): string {
  return PERIOD_LABELS[key] ?? key;
}

// "2026-09-01" or "2026-09" → "septembre"
export function monthName(date: string): string {
  const [year, month] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString('fr-FR', {
    month: 'long',
    timeZone: 'UTC',
  });
}

// Short sentence summing up the period, used as the block title
export function activityHeadline(activity: EditionActivity): string {
  const { editions, cities } = activity.totals;
  const when = activity.period.since
    ? `En ${monthName(activity.period.since)}`
    : 'Depuis le lancement de l’édition';
  if (editions === 0) {
    return `${when}, aucune édition pour l’instant`;
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

// The current month is nearly empty during its first days: show the last month instead
export function defaultPeriod(activities: EditionActivity[]): string | null {
  if (activities.length === 0) return null;
  const current = activities.find((a) => a.period.key === 'current_month');
  const last = activities.find((a) => a.period.key === 'last_month');
  if (current && current.totals.editions === 0 && last) {
    return last.period.key;
  }
  return activities[0].period.key;
}

export function aggregateImportsByYear(days: ChangeStatsDay[]): ImportStats {
  const byYear = new Map<number, ImportStatsYear>();
  for (const day of days) {
    const year = Number(day.date.slice(0, 4));
    const entry = byYear.get(year) ?? { year, bdtopo: 0, bal: 0 };
    entry.bdtopo += day.events_count.import_bdtopo;
    entry.bal += day.events_count.import_bal;
    byYear.set(year, entry);
  }
  const years = Array.from(byYear.values())
    .filter((y) => y.bdtopo + y.bal > 0)
    .sort((a, b) => a.year - b.year);
  const total = years.reduce((sum, y) => sum + y.bdtopo + y.bal, 0);
  return { total, years };
}

// Server-side fetches: cached for 10 minutes, and short timeout so that
// a slow API does not block the home page
const FETCH_OPTIONS = {
  next: { revalidate: 600 },
};
const FETCH_TIMEOUT_MS = 3000;

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    ...FETCH_OPTIONS,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`${url} responded ${res.status}`);
  }
  return res.json();
}

async function getEditionActivity(period?: string): Promise<EditionActivity> {
  const params = period ? `?period=${period}` : '';
  return fetchJson(
    `${process.env.NEXT_PUBLIC_API_BASE}/editions/activity/${params}`,
  );
}

// Returns the activity of every available period, in the order given by the API
export async function getEditionActivities(): Promise<EditionActivity[]> {
  const first = await getEditionActivity();
  const others = await Promise.all(
    first.available_periods
      .filter((key) => key !== first.period.key)
      .map((key) => getEditionActivity(key)),
  );
  const byKey = new Map(
    [first, ...others].map((activity) => [activity.period.key, activity]),
  );
  return first.available_periods
    .map((key) => byKey.get(key))
    .filter((activity): activity is EditionActivity => !!activity);
}

export async function getImportStats(): Promise<ImportStats> {
  const until = new Date().toISOString().slice(0, 10);
  const days = await fetchJson<ChangeStatsDay[]>(
    `${process.env.NEXT_PUBLIC_API_BASE}/buildings/change_stats/?since=${IMPORT_STATS_SINCE}&until=${until}`,
  );
  return aggregateImportsByYear(days);
}
