import { useEffect, useState } from 'react';

// Base des endpoints du jeu de l'été. Par défaut on tape l'API RNB ; si
// `NEXT_PUBLIC_SUMMER_GAME_API_BASE` est défini (ex. `/api/mock` en dev), on
// tape les route handlers locaux qui mockent `/editions/ranking/`. Pour
// revenir à la vraie API, il suffit de retirer cette variable d'environnement.
const SUMMER_GAME_API_BASE =
  process.env.NEXT_PUBLIC_SUMMER_GAME_API_BASE ||
  process.env.NEXT_PUBLIC_API_BASE;

// Base relative (`/api/...`) => route handlers mock locaux ; base absolue
// (`https://...`) => vraie API.
const isRelativeBase = SUMMER_GAME_API_BASE?.startsWith('/');

// Construit l'URL de classement à partir d'un chemin SANS slash final, p.ex.
// `/editions/ranking` ou `/editions/ranking/<username>`.
// - Vraie API (base absolue) : on rajoute le slash final attendu par le backend.
// - Mock local (base relative) : on n'en met pas. Un slash final déclencherait
//   une redirection 308 de Next, que la CSP `upgrade-insecure-requests` casse
//   en dev (http -> https -> ERR_SSL_PROTOCOL_ERROR). Les route handlers sont
//   servis à l'URL exacte sans slash.
// `window.location.origin` sert de base pour résoudre une base relative.
const buildRankingUrl = (path: string) =>
  new URL(
    `${SUMMER_GAME_API_BASE}${path}${isRelativeBase ? '' : '/'}`,
    window.location.origin,
  );

export type Rank = { name: string; count: number; shortName?: string | null };
export type FormattedRanks = {
  individual: Rank[];
  organization: Rank[];
  department: Rank[];
  shared: { goal: number; absolute: number; percent: number };
};

// Met en forme la réponse brute du classement (cf. mock
// `app/api/mock/editions/ranking/data.ts`) en gardant, pour les organisations,
// le nom long et le nom court séparés (affichage du nom court + survol).
export function formatRanks(ranks: any): FormattedRanks {
  return {
    individual: ranks.individual.map((r: any[]) => ({
      name: r[0],
      count: r[1],
    })),
    organization: ranks.organization.map((r: any[]) => {
      const [name, shortName, count] = r;
      return { name, shortName: shortName || null, count };
    }),
    department: ranks.departement.map((r: any[]) => ({
      name: `${r[1]} (${r[0]})`,
      count: r[2],
    })),
    shared: {
      goal: ranks.goal,
      absolute: ranks.global,
      percent: ranks.goal ? Math.round((ranks.global / ranks.goal) * 100) : 0,
    },
  };
}

export const useSummerGameUserData = (username: string, updatedAt: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGameUserData, setSummerGameUserData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildRankingUrl(
          `/editions/ranking/${encodeURIComponent(username)}`,
        );

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        setSummerGameUserData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [updatedAt]);

  return {
    summerGameUserData,
    loading,
  };
};

export const useSummerGamesData = (limit: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGamesData, setSummerGamesData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildRankingUrl('/editions/ranking');
        url.searchParams.append('max_rank', limit.toString());

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const ranks = await response.json();
        setSummerGamesData(formatRanks(ranks));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [limit]);

  return {
    summerGamesData,
    loading,
  };
};
