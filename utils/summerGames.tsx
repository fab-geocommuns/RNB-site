import { useEffect, useState } from 'react';

// Base de l'API RNB (cf. `NEXT_PUBLIC_API_BASE`). Les endpoints du jeu de l'été
// sont désormais servis par le vrai backend (PR fab-geocommuns/RNB-coeur#947) :
//  - `GET /validation/ranking/`          -> classement (individuel/orga/dépt)
//  - `GET /trophies/`                    -> liste des trophées + gagnants
//  - `GET /user/<username>/trophies/`    -> trophées gagnés par un utilisateur
//  - `GET /editions/ranking/<username>/` -> score & rang d'un utilisateur
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Objectif partagé de la barre de progression. Le backend ne renvoie pas de
// `goal` : on le fixe côté front (valeur produit, ajustable ici).
export const SUMMER_GAME_GOAL = 5000;

// Construit l'URL d'un endpoint à partir d'un chemin AVEC son slash final
// (ex. `/trophies/`). `window.location.origin` n'est qu'une base de repli :
// `API_BASE` étant absolue, elle est ignorée.
const buildUrl = (path: string) =>
  new URL(`${API_BASE}${path}`, window.location.origin);

// Types des trophées, alignés sur les endpoints réels `/trophies/` et
// `/user/<username>/trophies/`.
export type TrophyLevel = {
  level: number;
  level_label: string | null;
  condition?: string;
  count: number;
};

export type Trophy = {
  trophy: string;
  trophy_label: string;
  description: string;
  count: number;
  levels: TrophyLevel[];
};

export type UserTrophy = {
  trophy: string;
  trophy_label: string;
  level: number;
  level_label: string | null;
  unlocked_at: string;
};

export type Rank = { name: string; count: number; shortName?: string | null };
export type FormattedRanks = {
  individual: Rank[];
  organization: Rank[];
  department: Rank[];
  shared: { goal: number; absolute: number; percent: number };
};

// Met en forme la réponse brute de `GET /validation/ranking/`. Le backend
// renvoie des objets `{ username|name|code, rank }` où `rank` est en fait le
// SCORE (nombre de validations). Pour les organisations on garde le nom long et
// le nom court séparés (affichage du nom court + survol). L'objectif `goal`
// n'est pas fourni par l'API : on utilise la constante front `SUMMER_GAME_GOAL`.
export function formatRanks(ranks: any): FormattedRanks {
  return {
    individual: (ranks.individual ?? []).map((r: any) => ({
      name: r.username,
      count: r.rank,
    })),
    organization: (ranks.organization ?? []).map((r: any) => ({
      name: r.name,
      shortName: r.short_name || null,
      count: r.rank,
    })),
    department: (ranks.departement ?? []).map((r: any) => ({
      name: `${r.name} (${r.code})`,
      count: r.rank,
    })),
    shared: {
      goal: SUMMER_GAME_GOAL,
      absolute: ranks.global,
      percent: SUMMER_GAME_GOAL
        ? Math.round((ranks.global / SUMMER_GAME_GOAL) * 100)
        : 0,
    },
  };
}

export const useSummerGameUserData = (username: string, updatedAt: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGameUserData, setSummerGameUserData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildUrl(
          `/editions/ranking/${encodeURIComponent(username)}/`,
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
        const url = buildUrl('/validation/ranking/');
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
        const url = buildUrl('/trophies/');
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
        const url = buildUrl(`/user/${encodeURIComponent(username)}/trophies/`);
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
