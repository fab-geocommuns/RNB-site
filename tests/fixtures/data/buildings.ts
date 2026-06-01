/**
 * Canned building responses for e2e tests. Shapes mirror `SelectedBuilding`
 * (see stores/map/map-slice.tsx) and the `/buildings/{id}/?from=site` endpoint.
 */

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
    },
  ],
  ext_ids: [],
  plots: [],
};

export const buildingToSplit = {
  rnb_id: '6NFTV4Z6DP92',
  status: 'constructed',
  is_active: true,
  point: { type: 'Point', coordinates: [2.4245, 48.8455] },
  shape: {
    type: 'Polygon',
    coordinates: [
      [
        [2.423, 48.844],
        [2.426, 48.844],
        [2.426, 48.847],
        [2.423, 48.847],
        [2.423, 48.844],
      ],
    ],
  },
  addresses: [],
  ext_ids: [],
  plots: [],
};

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
