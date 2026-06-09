import maplibregl from 'maplibre-gl';

// BAN source
export const SRC_BAN = 'ban';
export const SRC_BAN_URL = `https://plateforme.adresse.data.gouv.fr/tiles/ban/{z}/{x}/{y}.pbf`;

// BAN layer
export const LAYER_BAN_POINT = 'ban_points';
export const LAYER_BAN_TXT = 'ban_txt';

export const installBAN = async (map: maplibregl.Map) => {
  const certifiedColor = '#049c04';
  const notCertifiedColor = '#777777';

  if (map.getLayer(LAYER_BAN_POINT)) map.removeLayer(LAYER_BAN_POINT);
  if (map.getLayer(LAYER_BAN_TXT)) map.removeLayer(LAYER_BAN_TXT);
  if (map.getSource(SRC_BAN)) map.removeSource(SRC_BAN);

  map.addSource(SRC_BAN, {
    type: 'vector',
    tiles: [SRC_BAN_URL],
    minzoom: 10,
    maxzoom: 14,

    promoteId: 'id',
  });

  map.addLayer({
    id: LAYER_BAN_POINT,
    source: SRC_BAN,
    'source-layer': 'adresses',
    type: 'circle',
    minzoom: 16,
    paint: {
      'circle-radius': 4,
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 2,
      'circle-color': [
        'case',
        ['==', ['get', 'certifie'], true],
        certifiedColor,
        notCertifiedColor,
      ],
    },
  });

  map.addLayer({
    id: LAYER_BAN_TXT,
    source: SRC_BAN,
    'source-layer': 'adresses',
    type: 'symbol',
    minzoom: 16,
    paint: {
      // change text color if 'certifie' is true
      'text-color': [
        'case',
        ['==', ['get', 'certifie'], true],
        certifiedColor,
        notCertifiedColor,
      ],

      'text-halo-color': '#ffffff',
      'text-halo-width': 2,
    },
    layout: {
      'text-font': ['Noto Sans Bold'],
      'text-size': 14,

      'text-field': [
        'case',
        ['has', 'suffixe'],
        ['format', ['get', 'numero'], {}, ' ', {}, ['get', 'suffixe'], {}],
        ['get', 'numero'],
      ],
      'text-ignore-placement': false,
      'text-variable-anchor': ['bottom'],
      'text-radial-offset': 1,
    },
  });
};
