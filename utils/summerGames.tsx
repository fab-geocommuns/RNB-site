import { useEffect, useState } from 'react';
import { Trophy } from '@/utils/trophies';
import { rnbApi } from '@/utils/rnbApi';

// Les endpoints du jeu de l'été sont servis par le backend
// (PR fab-geocommuns/RNB-coeur#947) :
//  - `GET /validation/ranking/`          -> classement (individuel/orga/dépt)
//  - `GET /trophies/`                    -> liste des trophées + gagnants
//  - `GET /user/<username>/trophies/`    -> trophées gagnés par un utilisateur

// Objectif partagé de la barre de progression. Le backend ne renvoie pas de
// `goal` : on le fixe côté front (valeur produit, ajustable ici).
export const SUMMER_GAME_GOAL = 100000;

// Les types et hooks de récupération des trophées (`Trophy`, `TrophyData`,
// `getTrophiesData`, `getUserTrophiesData`) vivent dans `@/utils/trophies`
// (source unique). Ce module ne garde que ce qui est propre au jeu de l'été :
// classements, barre de progression et statut d'affichage des badges.

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

export const useSummerGamesData = (limit: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGamesData, setSummerGamesData] = useState<any>();

  useEffect(() => {
    const getData = async () => {
      try {
        const ranks = await rnbApi.get('/validation/ranking/', {
          query: { max_rank: limit },
          cache: 'no-cache',
        });
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
  userTrophies: Trophy[] | undefined,
  trophyKey: string,
): TrophyStatus {
  const owned = (userTrophies ?? []).filter((t) => t.trophy === trophyKey);
  if (owned.length === 0) return { earned: false, levelLabel: null };
  const top = owned.reduce((a, b) => (b.level > a.level ? b : a));
  return { earned: true, levelLabel: top.level_label ?? null };
}
