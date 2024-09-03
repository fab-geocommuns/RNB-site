const RNB_POINTS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';
const RNB_POLYGONS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/shapes/{x}/{y}/{z}.pbf';

export const BUILDINGS_SOURCE = 'rnb_bdgs_tiles';
export const BUILDINGS_LAYER = 'rnb_bdgs_layer';

export const getBuildingsDisplay = (shape: string) => {
  if (shape === 'point') {
    return _getPointBuildingsDisplay();
  }

  if (shape === 'polygon') {
    return _getPolygonBuildingsDisplay();
  }
};

const _getPolygonBuildingsDisplay = () => {
  const bdgsSource = {
    type: 'vector',
    tiles: [RNB_POLYGONS_TILES_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
    minzoom: 16,
    maxzoom: 22,
    promoteId: 'rnb_id',
  };

  const bdgsLayer = {
    id: BUILDINGS_LAYER,
    type: 'fill',
    source: BUILDINGS_SOURCE,
    'source-layer': 'default',
    paint: {
      'fill-color': 'blue',
      'fill-opacity': 0.4,
      'fill-outline-color': '#000000',
    },
  };

  return { bdgsSource, bdgsLayer };
};

const _getPointBuildingsDisplay = () => {
  const bdgsSource = {
    type: 'vector',
    tiles: [RNB_POINTS_TILES_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
    minzoom: 16,
    maxzoom: 22,
    promoteId: 'rnb_id',
  };

  const bdgsLayer = {
    id: BUILDINGS_LAYER,
    type: 'circle',
    source: BUILDINGS_SOURCE,
    'source-layer': 'default',
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'hovered']],
        6,
        5,
      ],
      'circle-stroke-color': [
        'case',
        ['boolean', ['feature-state', 'in_panel'], false],
        '#ffffff',
        ['>', ['get', 'contributions'], 0],
        '#fef4f4',
        '#ffffff',
      ],
      'circle-stroke-width': 3,
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'in_panel'], false],
        '#31e060',
        ['>', ['get', 'contributions'], 0],
        '#FF732C',
        '#1452e3',
      ],
    },
  };

  return { bdgsSource, bdgsLayer };
};
