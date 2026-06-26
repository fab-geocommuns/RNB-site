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

        let formatted = {
          individual: [],
          department: [],
          organization: [],
          shared: {
            goal: ranks.goal,
            absolute: 0,
            percent: 0,
          },
        };

        // individual
        formatted.individual = ranks.individual.map((rank: any) => {
          return {
            name: rank[0],
            count: rank[1],
          };
        });

        // organization : [name, short_name, count]
        formatted.organization = ranks.organization.map((rank: any) => {
          const [name, shortName, count] = rank;
          return {
            name: shortName ? `${name} (${shortName})` : name,
            count,
          };
        });

        // department
        formatted.department = ranks.departement.map((rank: any) => {
          return {
            name: rank[1] + ' (' + rank[0] + ')',
            count: rank[2],
          };
        });

        // global
        formatted.shared['absolute'] = ranks.global;

        formatted.shared.percent = Math.round(
          (ranks.global / formatted.shared.goal) * 100,
        );

        setSummerGamesData(formatted);
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
