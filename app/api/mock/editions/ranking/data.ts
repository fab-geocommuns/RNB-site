/**
 * Données mockées du jeu de l'été 2026 (mise en avant des bâtiments validés).
 *
 * Ces fixtures alimentent les deux route handlers locaux qui imitent les
 * endpoints `/editions/ranking/` de l'API RNB, le temps que le vrai backend
 * soit prêt. Format volontairement identique à l'API réelle : voir
 * `utils/summerGames.tsx` pour la consommation côté front.
 *
 * Pour basculer sur la vraie API : retirer `NEXT_PUBLIC_SUMMER_GAME_API_BASE`
 * de l'environnement (cf. fallback dans `utils/summerGames.tsx`).
 */

// Score global partagé entre la liste et le score par utilisateur : les deux
// route handlers doivent renvoyer la même valeur pour rester cohérents.
export const GOAL = 50000;
export const GLOBAL = 12345;

// Classement individuel : [username, count]
export const individual: [string, number][] = [
  ['jdupont', 1320],
  ['mleroy', 980],
  ['cbernard', 845],
  ['arousseau', 712],
  ['pmartin', 610],
  ['lfontaine', 503],
  ['sgirard', 421],
  ['nmoreau', 318],
  ['vlefevre', 254],
  ['hgarnier', 187],
];

// Classement par organisation : [name, short_name, count]
export const organization: [string, string, number][] = [
  [
    "Institut national de l'information géographique et forestière",
    'IGN',
    3120,
  ],
  ['Métropole de Rennes', 'Rennes Métropole', 2140],
  ['Eurométropole de Strasbourg', 'EMS', 1760],
  ['Communauté urbaine de Bordeaux', 'Bordeaux Métropole', 1340],
  ['Etalab', 'Etalab', 980],
  ['Ville de Lyon', 'Lyon', 760],
];

// Classement par département : [code, name, count]
export const departement: [string, string, number][] = [
  ['35', 'Ille-et-Vilaine', 2980],
  ['67', 'Bas-Rhin', 2410],
  ['33', 'Gironde', 1870],
  ['69', 'Rhône', 1560],
  ['75', 'Paris', 1290],
  ['44', 'Loire-Atlantique', 1010],
  ['31', 'Haute-Garonne', 870],
  ['13', 'Bouches-du-Rhône', 640],
];

/**
 * Score et rang d'un joueur. On le déduit du classement individuel mocké :
 * si le username y figure, on renvoie son score et son rang (1-indexé) ;
 * sinon le joueur est considéré comme n'ayant pas encore de score.
 */
export function getUserRanking(username: string): {
  user_score: number;
  user_rank: number;
} {
  const index = individual.findIndex(([name]) => name === username);
  if (index === -1) {
    return { user_score: 0, user_rank: 0 };
  }
  return { user_score: individual[index][1], user_rank: index + 1 };
}
