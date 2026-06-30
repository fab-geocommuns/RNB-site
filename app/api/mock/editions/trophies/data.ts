/**
 * Données mockées des trophées du jeu de l'été 2026.
 *
 * Forme identique aux endpoints réels (PR fab-geocommuns/RNB-coeur#947) :
 *  - `GET /editions/trophies`            -> liste des trophées + nombre de gagnants
 *  - `GET /editions/user/<username>/trophies` -> trophées gagnés par un utilisateur
 *
 * Libellés et descriptions repris à l'identique du modèle `Trophy` backend.
 * Pour basculer sur la vraie API : retirer `NEXT_PUBLIC_SUMMER_GAME_API_BASE`
 * (cf. `utils/summerGames.tsx`).
 */

export type TrophyLevel = {
  level: number;
  level_label: string | null;
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

export const TROPHIES: Trophy[] = [
  {
    trophy: 'validateur',
    trophy_label: 'validateur',
    description:
      'Gagnez ce trophée en validant des bâtiments dans le RNB. Plus vous validez, plus votre niveau augmente.',
    count: 128,
    levels: [
      { level: 1, level_label: 'apprenti', count: 128 },
      { level: 2, level_label: 'maçon', count: 34 },
      { level: 3, level_label: 'entreprise du bâtiment', count: 5 },
    ],
  },
  {
    trophy: 'course_de_fond',
    trophy_label: 'course de fond',
    description:
      'Gagnez ce trophée en validant des bâtiments pendant plusieurs jours consécutifs.',
    count: 41,
    levels: [
      { level: 1, level_label: 'coureur du dimanche', count: 41 },
      { level: 2, level_label: 'semi-marathonien', count: 12 },
      { level: 3, level_label: 'marathonien', count: 3 },
    ],
  },
  {
    trophy: 'tour_de_france',
    trophy_label: 'tour de france',
    description:
      'Gagnez ce trophée en validant des bâtiments dans les villes-étapes du Tour de France 2026.',
    count: 17,
    levels: [
      { level: 1, level_label: "vainqueur d'étape", count: 17 },
      { level: 2, level_label: 'maillot jaune', count: 4 },
      { level: 3, level_label: 'vainqueur du tour', count: 1 },
    ],
  },
  {
    trophy: 'superv',
    trophy_label: 'superV',
    description:
      'Gagnez ce trophée en étant la personne qui a fait le plus de validation dans le RNB.',
    count: 1,
    levels: [{ level: 1, level_label: null, count: 1 }],
  },
];

// Utilisateur de démo qui possède quelques trophées ; tout autre username n'en a
// aucun. Aligné avec le 1er du classement individuel mocké (cf. ranking/data.ts).
export const DEMO_TROPHY_USERNAME = 'jdupont';

const DEMO_USER_TROPHIES: UserTrophy[] = [
  {
    trophy: 'validateur',
    trophy_label: 'validateur',
    level: 2,
    level_label: 'maçon',
    unlocked_at: '2026-06-20T10:00:00Z',
  },
  {
    trophy: 'validateur',
    trophy_label: 'validateur',
    level: 1,
    level_label: 'apprenti',
    unlocked_at: '2026-06-10T10:00:00Z',
  },
  {
    trophy: 'superv',
    trophy_label: 'superV',
    level: 1,
    level_label: null,
    unlocked_at: '2026-06-25T09:00:00Z',
  },
];

/**
 * Trophées gagnés par un utilisateur. Seul `DEMO_TROPHY_USERNAME` en possède ;
 * pour tout autre username on renvoie une liste vide.
 */
export function getUserTrophies(username: string): UserTrophy[] {
  return username === DEMO_TROPHY_USERNAME ? DEMO_USER_TROPHIES : [];
}
