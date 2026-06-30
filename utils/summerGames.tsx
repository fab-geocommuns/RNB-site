import { useEffect, useState } from 'react';
import type { Trophy, UserTrophy } from '@/app/api/mock/editions/trophies/data';

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

export type TrophyStatus = { earned: boolean; levelLabel: string | null };

// Statut du trophée pour l'utilisateur connecté : gagné ou non, et le label du
// plus haut niveau atteint (null pour superv qui n'a pas de label de niveau).
export function userTrophyStatus(
  userTrophies: UserTrophy[] | undefined,
  trophyKey: string,
): TrophyStatus {
  const owned = (userTrophies ?? []).filter((t) => t.trophy === trophyKey);
  if (owned.length === 0) return { earned: false, levelLabel: null };
  const top = owned.reduce((a, b) => (b.level > a.level ? b : a));
  return { earned: true, levelLabel: top.level_label ?? null };
}

export const useTrophies = () => {
  const [loading, setLoading] = useState(true);
  const [trophies, setTrophies] = useState<Trophy[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildRankingUrl('/editions/trophies');
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        setTrophies(await response.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);

  return { trophies, loading };
};

export const useUserTrophies = (username?: string | null) => {
  const [loading, setLoading] = useState(true);
  const [userTrophies, setUserTrophies] = useState<UserTrophy[]>();

  useEffect(() => {
    if (!username) {
      setUserTrophies([]);
      setLoading(false);
      return;
    }
    const getData = async () => {
      setLoading(true);
      try {
        const url = buildRankingUrl(
          `/editions/user/${encodeURIComponent(username)}/trophies`,
        );
        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        setUserTrophies(await response.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [username]);

  return { userTrophies, loading };
};
