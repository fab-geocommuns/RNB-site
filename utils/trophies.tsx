/**
 * Un trophée gagné par un utilisateur, tel que renvoyé par l'API
 * `/user/<username>/trophies/`.
 *
 * Exemple de réponse :
 * [{"trophy":"validateur","trophy_label":"validateur","level":1,
 *   "level_label":"apprenti","unlocked_at":"2026-07-02T14:51:52.063528Z"}]
 *
 * Un trophée est identifié par `trophy` (son type) et possède un `level` qui
 * peut augmenter : il n'y a qu'une entrée par type de trophée, correspondant au
 * palier courant. « Gagner » un trophée = débloquer un nouveau type OU passer à
 * un palier supérieur.
 */
import { useEffect, useState } from 'react';
import type { MedalColor } from '@/components/games/summerGames/Medal';

export interface Trophy {
  trophy: string; // identifiant stable du type (ex: "validateur")
  trophy_label: string; // libellé d'affichage du trophée
  level: number; // palier atteint
  level_label: string | null; // libellé du palier (ex: "apprenti"), null pour superv
  unlocked_at?: string; // date ISO de déblocage du palier courant
}

/**
 * URL de l'image d'un trophée. L'image ne dépend que du type de trophée : le
 * palier atteint n'est pas matérialisé par un visuel différent mais par la
 * couleur de la médaille (cf. `trophyMedalColor`). Accepte aussi bien un
 * trophée gagné (`Trophy`) qu'une définition de catalogue (`TrophyData`).
 */
export function trophyImageUrl(trophy: { trophy: string }): string {
  return `/images/trophies/${trophy.trophy}.png`;
}

/**
 * Couleur de la médaille (bordure) selon le palier atteint : bronze pour le
 * premier, argent pour le deuxième, or au-delà.
 */
export function trophyMedalColor(level: number): MedalColor {
  if (level <= 1) return 'bronze';
  if (level === 2) return 'silver';
  return 'gold';
}

/**
 * Compare deux instantanés de trophées et renvoie ceux nouvellement gagnés :
 * un type de trophée absent avant, ou dont le palier a augmenté.
 */
export function findNewlyWonTrophies(
  before: Trophy[],
  after: Trophy[],
): Trophy[] {
  const beforeLevels = new Map<string, number>();
  for (const t of before) {
    beforeLevels.set(
      t.trophy,
      Math.max(beforeLevels.get(t.trophy) ?? 0, t.level),
    );
  }
  return after.filter((t) => (beforeLevels.get(t.trophy) ?? 0) < t.level);
}

/**
 * Récupère la liste des trophées gagnés par un utilisateur.
 *
 * @param username utilisateur ciblé
 * @param fetchFn fetch à utiliser (permet de passer le fetch authentifié de
 *   `useRNBFetch`). Par défaut, le fetch global.
 */
export async function fetchUserTrophies(
  username: string,
  fetchFn: typeof fetch = fetch,
): Promise<Trophy[]> {
  const url = new URL(
    process.env.NEXT_PUBLIC_API_BASE +
      `/user/${encodeURIComponent(username)}/trophies/`,
  );

  const response = await fetchFn(url, {
    cache: 'no-cache',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `Impossible de récupérer les trophées (statut ${response.status})`,
    );
  }

  return await response.json();
}

/**
 * Variante qui n'échoue jamais : renvoie `[]` en cas d'erreur. Utile pour ne
 * pas casser un flux (ex: validation d'un bâtiment) si l'API des trophées est
 * momentanément indisponible.
 */
export async function fetchUserTrophiesSafe(
  username: string,
  fetchFn: typeof fetch = fetch,
): Promise<Trophy[]> {
  try {
    return await fetchUserTrophies(username, fetchFn);
  } catch (e) {
    console.error(e);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/* Catalogue des trophées (page « Mes trophées »)                             */
/* -------------------------------------------------------------------------- */

/**
 * Un trophée du catalogue, tel que renvoyé par l'API `/trophies/` : la
 * définition d'un type de trophée et de ses paliers, indépendamment d'un
 * utilisateur.
 */
export interface TrophyData {
  trophy: string;
  trophy_label: string;
  description: string;
  count: number; // nombre de personnes ayant gagné ce trophée
  levels: LevelData[];
}

export interface LevelData {
  level: number;
  level_label: string | null;
  condition?: string | null;
  count: number; // nombre de personnes ayant atteint ce palier
}

/**
 * Informations d'affichage dérivées pour un trophée sur la page « Mes trophées ».
 */
export interface TrophyDetails {
  description: string;
  currentLevel: LevelData | undefined;
  nextLevel: LevelData | undefined;
  count: number | null | undefined;
}

/**
 * Hook : catalogue complet des trophées (`/trophies/`).
 */
export const getTrophiesData = () => {
  const [loadingTrophies, setLoading] = useState(true);
  const [data, setData] = useState<TrophyData[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = new URL(process.env.NEXT_PUBLIC_API_BASE + `/trophies/`);

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const jsonData = await response.json();

        setData(jsonData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, []);
  return {
    data,
    loadingTrophies,
  };
};

/**
 * Hook : trophées gagnés par un utilisateur (`/user/<username>/trophies/`).
 * Réutilise `fetchUserTrophies` pour ne pas dupliquer la logique de requête.
 */
export const getUserTrophiesData = (username: string | null | undefined) => {
  const [loadingUserTrophies, setLoading] = useState(true);
  const [data, setData] = useState<Trophy[]>();

  useEffect(() => {
    const getData = async () => {
      if (!username) {
        setLoading(false);
        return;
      }
      try {
        setData(await fetchUserTrophies(username));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [username]);

  return {
    data,
    loadingUserTrophies,
  };
};

/**
 * Croise un trophée gagné par l'utilisateur avec le catalogue pour en déduire
 * la description, le palier courant, le palier suivant et le nombre de gagnants.
 */
export const getUserTrophyData = (
  trophies: TrophyData[],
  userTrophy: Trophy,
): TrophyDetails => {
  const trophyInfos = trophies?.find(
    (t) => t.trophy_label === userTrophy.trophy_label,
  );

  const currentLevelIndex = trophyInfos?.levels.findIndex(
    (l) => l.level === userTrophy.level,
  );

  const currentLevel =
    currentLevelIndex !== undefined && currentLevelIndex >= 0
      ? trophyInfos?.levels[currentLevelIndex]
      : undefined;

  const nextLevel =
    currentLevelIndex !== undefined &&
    currentLevelIndex >= 0 &&
    trophyInfos?.levels[currentLevelIndex + 1]
      ? trophyInfos.levels[currentLevelIndex + 1]
      : undefined;

  const count =
    currentLevelIndex !== undefined && currentLevelIndex >= 0
      ? trophyInfos?.levels[currentLevelIndex].count
      : undefined;

  return {
    description: trophyInfos?.description || '',
    currentLevel,
    nextLevel,
    count,
  };
};

/**
 * Détails d'affichage d'un trophée du catalogue non encore gagné (on se base
 * sur son premier palier).
 */
export const getUserTrophieDetails = (trophy: TrophyData): TrophyDetails => {
  const firstLevel = trophy.levels[0];
  const description = trophy.description;
  const currentLevel = firstLevel;
  const nextLevel = undefined;
  const count = firstLevel.count;

  return {
    description: description || '',
    currentLevel,
    nextLevel,
    count,
  };
};

/**
 * Trophées du catalogue que l'utilisateur n'a pas encore gagnés.
 */
export const getTrophiesToWin = (
  trophies: TrophyData[] | undefined,
  userTrophies: Trophy[] | undefined,
): TrophyData[] => {
  const safeTrophies = Array.isArray(trophies) ? trophies : [];
  const safeUserTrophies = Array.isArray(userTrophies) ? userTrophies : [];

  const wonTrophyIds = new Set(
    safeUserTrophies.map((userTrophy) => userTrophy.trophy),
  );

  return safeTrophies.filter((trophy) => !wonTrophyIds.has(trophy.trophy));
};
