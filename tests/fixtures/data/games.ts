import { DEFAULT_USERNAME } from '@/tests/fixtures/utils/auth-mock';

// Réponse brute de `GET /validation/ranking/` : `rank` est le score.
export const ranking = {
  global: 345,
  individual: [{ username: 'alice', rank: 42 }],
  organization: [
    {
      name: "Institut national de l'information géographique",
      short_name: 'IGN',
      rank: 30,
    },
  ],
  departement: [{ name: 'Paris', code: '75', rank: 50 }],
};

export const trophies = [
  {
    trophy: 'validateur',
    trophy_label: 'Validateur',
    description: 'Valider des bâtiments du RNB',
    count: 3,
    levels: [
      {
        level: 1,
        level_label: 'apprenti',
        condition: '10 validations',
        count: 3,
      },
      {
        level: 2,
        level_label: 'expert',
        condition: '100 validations',
        count: 1,
      },
    ],
  },
  {
    trophy: 'signaleur',
    trophy_label: 'Signaleur',
    description: 'Signaler des erreurs sur la carte',
    count: 0,
    levels: [],
  },
];

export const userTrophies = [
  {
    trophy: 'validateur',
    trophy_label: 'Validateur',
    level: 1,
    level_label: 'apprenti',
    unlocked_at: '2026-07-02T14:51:52Z',
  },
];

export const feves = [
  {
    department_code: '75',
    department_name: 'Paris',
    found_datetime: '2026-01-06T10:00:00Z',
    found_by_username: DEFAULT_USERNAME,
  },
  {
    department_code: '69',
    department_name: 'Rhône',
    found_datetime: '2026-01-07T10:00:00Z',
    found_by_username: 'quelqu-un-d-autre',
  },
  {
    department_code: '33',
    department_name: 'Gironde',
    found_datetime: null,
    found_by_username: null,
  },
];
