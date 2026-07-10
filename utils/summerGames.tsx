import { useEffect, useState } from 'react';
import { Trophy } from '@/utils/trophies';

// Base de l'API RNB (cf. `NEXT_PUBLIC_API_BASE`). Les endpoints du jeu de l'été
// sont désormais servis par le vrai backend (PR fab-geocommuns/RNB-coeur#947) :
//  - `GET /validation/ranking/`          -> classement (individuel/orga/dépt)
//  - `GET /trophies/`                    -> liste des trophées + gagnants
//  - `GET /user/<username>/trophies/`    -> trophées gagnés par un utilisateur
// NB : `/editions/ranking/<username>/` existe aussi mais compte les ÉDITIONS,
// pas les validations — il ne doit pas servir au score du jeu (cf.
// `deriveUserScore`).
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Objectif partagé de la barre de progression. Le backend ne renvoie pas de
// `goal` : on le fixe côté front (valeur produit, ajustable ici).
export const SUMMER_GAME_GOAL = 100000;

// Construit l'URL d'un endpoint à partir d'un chemin AVEC son slash final
// (ex. `/trophies/`). `window.location.origin` n'est qu'une base de repli :
// `API_BASE` étant absolue, elle est ignorée.
const buildUrl = (path: string) =>
  new URL(`${API_BASE}${path}`, window.location.origin);

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

export type SummerGameScore = {
  global: number;
  goal: number;
  user_score: number;
  user_rank: number | null; // null si l'utilisateur n'apparaît pas au classement
};

// Dérive le score du jeu pour un utilisateur à partir de la réponse brute de
// `GET /validation/ranking/` — la même source que le bloc d'accueil. Le jeu
// compte les VALIDATIONS ; `/editions/ranking/` compte les éditions, ce qui
// donnait un score global incohérent entre la home et la carte d'édition.
// `rank` porte le score et `individual` est trié par score décroissant : la
// position dans la liste donne le rang.
export function deriveUserScore(ranks: any, username: string): SummerGameScore {
  const individual: any[] = ranks.individual ?? [];
  const index = individual.findIndex((r) => r.username === username);
  return {
    global: ranks.global,
    goal: SUMMER_GAME_GOAL,
    user_score: index >= 0 ? individual[index].rank : 0,
    user_rank: index >= 0 ? index + 1 : null,
  };
}

// Score du jeu affiché sur la carte d'édition. `updatedAt` est bumpé après
// chaque édition réussie pour rafraîchir le score (cf. `EditMapSummerScore`).
export const useSummerGameScore = (username: string, updatedAt: number) => {
  const [loading, setLoading] = useState(true);
  const [summerGameScore, setSummerGameScore] = useState<SummerGameScore>();

  useEffect(() => {
    const getData = async () => {
      try {
        const url = buildUrl('/validation/ranking/');
        // L'API ne renvoie pas de score individuel direct : on demande un
        // classement assez large pour que l'utilisateur y figure même loin
        // du podium.
        url.searchParams.append('max_rank', '10000');

        const response = await fetch(url, {
          cache: 'no-cache',
          headers: { 'Content-Type': 'application/json' },
        });
        const ranks = await response.json();

        setSummerGameScore(deriveUserScore(ranks, username));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [username, updatedAt]);

  return {
    summerGameScore,
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
  userTrophies: Trophy[] | undefined,
  trophyKey: string,
): TrophyStatus {
  const owned = (userTrophies ?? []).filter((t) => t.trophy === trophyKey);
  if (owned.length === 0) return { earned: false, levelLabel: null };
  const top = owned.reduce((a, b) => (b.level > a.level ? b : a));
  return { earned: true, levelLabel: top.level_label ?? null };
}
