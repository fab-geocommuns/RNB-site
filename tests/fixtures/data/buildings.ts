/**
 * Canned building responses for e2e tests. Shapes mirror what the
 * `/buildings/{id}/?from=site` endpoint returns — i.e. `SelectedBuilding`
 * minus the client-only `_type` discriminator that `fetchBuilding` adds.
 *
 * Typed with `satisfies` so TypeScript flags drift when the upstream
 * `SelectedBuilding` interface gains a new required field.
 */
import type { SelectedBuilding, PublicUser } from '@/stores/map/map-slice';

type BuildingFixture = Omit<SelectedBuilding, '_type'>;

export const buildingSegur = {
  rnb_id: 'NHDE2W8HE3X3',
  status: 'constructed',
  is_active: true,
  point: { type: 'Point', coordinates: [2.305, 48.85] },
  shape: {
    type: 'Polygon',
    coordinates: [
      [
        [2.305, 48.85],
        [2.3055, 48.85],
        [2.3055, 48.8505],
        [2.305, 48.8505],
        [2.305, 48.85],
      ],
    ],
  },
  addresses: [
    {
      id: '75107_8909_00020',
      source: 'BAN',
      street_number: '20',
      street_rep: '',
      street: 'avenue de Ségur',
      city_zipcode: '75007',
      city_name: 'Paris 7e Arrondissement',
      city_insee_code: '75107',
    },
  ],
  validated_by: [],
  ext_ids: [],
  plots: [],
} satisfies BuildingFixture;

// Tight rectangle sized so the test's cut line (vertical at x=2.424, going
// from y=48.8449 to y=48.8456) starts and ends outside the polygon and fully
// bisects it.
export const buildingToSplit = {
  rnb_id: '6NFTV4Z6DP92',
  status: 'constructed',
  is_active: true,
  point: { type: 'Point', coordinates: [2.4245, 48.8453] },
  shape: {
    type: 'Polygon',
    coordinates: [
      [
        [2.4237, 48.8452],
        [2.4253, 48.8452],
        [2.4253, 48.8454],
        [2.4237, 48.8454],
        [2.4237, 48.8452],
      ],
    ],
  },
  addresses: [],
  validated_by: [],
  ext_ids: [],
  plots: [],
} satisfies BuildingFixture;

export const banFeatureSegur = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [2.305, 48.85] },
  properties: {
    label: '73 Avenue de Paris 94160 Saint-Mandé',
    score: 0.95,
    type: 'housenumber',
    name: '73 Avenue de Paris',
    postcode: '94160',
    citycode: '94067',
    city: 'Saint-Mandé',
    context: '94, Val-de-Marne, Île-de-France',
    importance: 0.8,
    x: 657000,
    y: 6859000,
  },
};

/** Un validateur fictif (utilisé pour les listes `validated_by`). */
export function makeValidator(over: Partial<PublicUser> = {}): PublicUser {
  return {
    id: 1,
    username: 'ctemoin',
    organization_name: 'Organisation Test',
    ...over,
  };
}

/**
 * Bâtiment servant aux tests de validation depuis l'édition. `validated_by`
 * est paramétrable car ces tests assertent les états verrouillé / déverrouillé.
 */
export function buildingValidatedBy(
  validated_by: PublicUser[] = [],
): BuildingFixture {
  return {
    rnb_id: 'PG46YY6YWCX8',
    status: 'constructed',
    is_active: true,
    point: { type: 'Point', coordinates: [2.424, 48.8452] },
    shape: {
      type: 'Polygon',
      coordinates: [
        [
          [2.423721634213109, 48.84523835886833],
          [2.4237562502758863, 48.84539782325717],
          [2.4242824144108397, 48.84534770593274],
          [2.4242477983494553, 48.84518368524684],
          [2.423721634213109, 48.84523835886833],
        ],
      ],
    },
    addresses: [],
    validated_by,
    ext_ids: [],
    plots: [],
  };
}
