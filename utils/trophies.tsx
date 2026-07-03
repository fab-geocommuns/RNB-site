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
import type { MedalColor } from '@/components/games/summerGames/Medal';

export interface Trophy {
  trophy: string; // identifiant stable du type (ex: "validateur")
  trophy_label: string; // libellé d'affichage du trophée
  level: number; // palier atteint
  level_label: string; // libellé du palier (ex: "apprenti")
  unlocked_at: string; // date ISO de déblocage du palier courant
}

/**
 * URL de l'image d'un trophée. L'image ne dépend que du type de trophée : le
 * palier atteint n'est pas matérialisé par un visuel différent mais par la
 * couleur de la médaille (cf. `trophyMedalColor`).
 */
export function trophyImageUrl(trophy: Trophy): string {
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
