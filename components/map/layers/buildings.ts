import maplibregl from 'maplibre-gl';
import { MapLayers } from '@/stores/map/map-slice';
import checkGreenIcon from '@/public/images/map/check-green.png';

// Buildings source
export const SRC_BDGS_POINTS = 'bdgtiles_points';
export const SRC_BDGS_SHAPES = 'bdgtiles_shapes';
export const SRC_BDGS_SHAPES_URL = `${process.env.NEXT_PUBLIC_API_BASE}/tiles/shapes/{x}/{y}/{z}.pbf?only_active_and_real=false`;
export const SRC_BDGS_POINTS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/tiles/{x}/{y}/{z}.pbf?only_active_and_real=false`;

// Buildings layers : point:
export const LAYER_BDGS_POINT = 'bdgs_point';
export const LAYER_BDGS_POINT_SHAPE_BORDER = 'bdgs_bdgs_point_shape_border';
export const LAYER_BDGS_POINT_SHAPE_FILL = 'bdgs_bdgs_point_shape_fill';
export const LAYER_BDGS_POINT_SHAPE_VALIDATED_CHECK =
  'bdgs_point_shape_marked_green_check';
export const LAYERS_BDGS_POINT_ALL = [
  LAYER_BDGS_POINT,
  LAYER_BDGS_POINT_SHAPE_BORDER,
  LAYER_BDGS_POINT_SHAPE_FILL,
  LAYER_BDGS_POINT_SHAPE_VALIDATED_CHECK,
];

// Buildings layers : shapes
export const LAYER_BDGS_SHAPE_BORDER = 'bdgs_shape';
export const LAYER_BDGS_SHAPE_FILL = 'bdgs_shape_fill';
export const LAYER_BDGS_SHAPE_POINT = 'bdgs_shape_point';
export const LAYER_BDGS_SHAPE_MARKED_GREEN_CHECK =
  'bdgs_shape_marked_green_check';
export const LAYERS_BDGS_SHAPE_ALL = [
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_FILL,
  LAYER_BDGS_SHAPE_POINT,
  LAYER_BDGS_SHAPE_MARKED_GREEN_CHECK,
];

type BuildingsOptions = {
  layers: MapLayers;
  selectedBuildingisGreen?: Boolean;
  // In edition mode, the "validated" display is toggled via the extra layer.
  // In visu mode it is always on (non conditional).
  editionMode?: boolean;
};

export const installBuildings = (
  map: maplibregl.Map,
  options: BuildingsOptions,
) => {
  // First, we remove buildings layers and source
  removeBuildings(map, options.layers);

  // Then, we install the source
  installBuildingsSource(map);
  installBuildingsLayers(map, options);
};

const installBuildingsSource = (map: maplibregl.Map) => {
  map.addSource(SRC_BDGS_POINTS, {
    type: 'vector',
    tiles: [SRC_BDGS_POINTS_URL],
    minzoom: 16,
    maxzoom: 22,
    promoteId: 'rnb_id',
  });

  map.addSource(SRC_BDGS_SHAPES, {
    type: 'vector',
    // the random element is used to bypass the browser caching
    // when a building's shape is updated, we change the random element
    // to force a clean re-render of the data on the map
    tiles: [SRC_BDGS_SHAPES_URL + '#' + Math.random()],
    minzoom: 16,
    maxzoom: 22,
    promoteId: 'rnb_id',
  });
};

type BuildingFeatureFilter = ['all', ...maplibregl.ExpressionSpecification[]];

const getDefaultBuildingFeatureFilter = (): BuildingFeatureFilter => {
  return ['all', ['==', 'is_active', true], ['!=', 'status', 'demolished']];
};

const installBuildingsLayers = (
  map: maplibregl.Map,
  options: BuildingsOptions,
) => {
  if (options.layers.buildings == 'point') {
    installBuildingsPointsLayers(map, options);
  }
  if (options.layers.buildings == 'polygon') {
    installBuildingsShapesLayers(map, options);
  }
};

const installBuildingsPointsLayers = async (
  map: maplibregl.Map,
  { layers }: BuildingsOptions,
) => {
  const defaultBuildingFeatureFilter = getDefaultBuildingFeatureFilter();
  const validatedActive = layers.extraLayers.includes('validated');
  const isSatellite = ['satellite', 'satellite_2016_2020'].includes(
    layers.background,
  );

  if (!map.hasImage('checkGreen')) {
    const check = await map.loadImage(checkGreenIcon.src);
    if (!map.hasImage('checkGreen')) {
      map.addImage('checkGreen', check.data);
    }
  }

  // Building shapes for vector background
  if (['vectorIgnStandard', 'vectorOsm'].includes(layers.background)) {
    map.addLayer({
      id: LAYER_BDGS_POINT_SHAPE_FILL,
      type: 'fill',
      filter: defaultBuildingFeatureFilter,
      source: SRC_BDGS_SHAPES,
      'source-layer': 'default',
      paint: {
        'fill-color': '#dcdcdc',
        'fill-opacity': 1,
      },
    });

    // add check marks in the consultation map
    if (validatedActive) {
      map.addLayer({
        id: LAYER_BDGS_POINT_SHAPE_VALIDATED_CHECK,
        type: 'fill',
        source: SRC_BDGS_SHAPES,
        'source-layer': 'default',
        filter: [...defaultBuildingFeatureFilter, ['==', 'is_validated', true]],
        paint: {
          'fill-pattern': 'checkGreen',
          'fill-opacity': 0.9,
        },
      });
    }

    map.addLayer({
      id: LAYER_BDGS_POINT_SHAPE_BORDER,
      type: 'line',
      filter: defaultBuildingFeatureFilter,
      source: SRC_BDGS_SHAPES,
      'source-layer': 'default',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          '#00000033',
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          3,
          1.5,
        ],
      },
    });
  }

  map.addLayer({
    id: LAYER_BDGS_POINT,
    type: 'circle',
    source: SRC_BDGS_POINTS,
    'source-layer': 'default',
    filter: defaultBuildingFeatureFilter,
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['==', ['feature-state', 'hovered'], true]],
        6,
        5,
      ],
      'circle-stroke-color':
        isSatellite && validatedActive
          ? [
              'case',
              ['boolean', ['get', 'is_validated'], false],
              '#e6feda',
              '#ffffff',
            ]
          : '#ffffff',
      'circle-stroke-width':
        isSatellite && validatedActive
          ? ['case', ['boolean', ['get', 'is_validated'], false], 5, 3]
          : 3,
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'in_panel'], false],
        '#31e060',
        '#1452e3',
      ],
    },
  });
};

const installBuildingsShapesLayers = async (
  map: maplibregl.Map,
  { layers, selectedBuildingisGreen, editionMode }: BuildingsOptions,
) => {
  const defaultBuildingFeatureFilter = getDefaultBuildingFeatureFilter();
  const selectedBuildingColor = selectedBuildingisGreen ? '#31e060' : '#1452e3';
  const validatedActive = layers.extraLayers.includes('validated');
  const isSatellite = ['satellite', 'satellite_2016_2020'].includes(
    layers.background,
  );

  if (validatedActive && !map.hasImage('greenCheck')) {
    const greenCheck = await map.loadImage(checkGreenIcon.src);
    if (!map.hasImage('greenCheck')) {
      map.addImage('greenCheck', greenCheck.data);
    }
  }

  map.addLayer({
    id: LAYER_BDGS_SHAPE_BORDER,
    type: 'fill',
    source: SRC_BDGS_SHAPES,
    'source-layer': 'default',
    filter: defaultBuildingFeatureFilter,
    paint: {
      'fill-color': [
        'case',
        ['boolean', ['feature-state', 'in_panel'], false],
        selectedBuildingColor,
        ['boolean', ['feature-state', 'hovered'], false],
        '#132353',
        '#1452e3',
      ],
      'fill-opacity': validatedActive
        ? [
            'case',
            ['boolean', ['feature-state', 'in_panel'], false],
            0.15,
            ['boolean', ['get', 'is_validated'], false],
            0.2,
            0.08,
          ]
        : 0.08,
    },
  });

  // Green check overlay for buildings marked as correct
  if (validatedActive) {
    map.addLayer({
      id: LAYER_BDGS_SHAPE_MARKED_GREEN_CHECK,
      type: 'fill',
      source: SRC_BDGS_SHAPES,
      'source-layer': 'default',
      filter: [
        ...defaultBuildingFeatureFilter,
        ['==', 'is_validated', true],
      ] as any,
      paint: {
        'fill-pattern': 'greenCheck',
        'fill-opacity': isSatellite ? 0.5 : 0.9,
      },
    });
  }

  // Polygon border
  map.addLayer({
    id: LAYER_BDGS_SHAPE_FILL,
    type: 'line',
    source: SRC_BDGS_SHAPES,
    'source-layer': 'default',
    filter: defaultBuildingFeatureFilter,
    paint: {
      'line-color': [
        'case',
        ['boolean', ['feature-state', 'in_panel'], false],
        selectedBuildingColor,
        ['boolean', ['feature-state', 'hovered'], false],
        '#87d443',
        '#1452e3',
      ],
      'line-width': 2.1,
    },
  });

  // Points on the polygon source
  map.addLayer({
    id: LAYER_BDGS_SHAPE_POINT,
    type: 'circle',
    source: SRC_BDGS_SHAPES,
    'source-layer': 'default',
    filter: ['all', ['==', '$type', 'Point'], defaultBuildingFeatureFilter],
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['==', ['feature-state', 'hovered'], true]],
        6,
        5,
      ],
      'circle-stroke-color': validatedActive
        ? [
            'case',
            ['boolean', ['get', 'is_validated'], false],
            '#31e060',
            '#ff0000',
          ]
        : '#ff0000',
      'circle-stroke-width': 3,
      'circle-color': [
        'case',
        ['boolean', ['feature-state', 'in_panel'], false],
        '#31e060',
        '#1452e3',
      ],
    },
  });
};

export const removeBuildings = (map: maplibregl.Map, layers: MapLayers) => {
  if (layers.buildings == 'point') {
    removeBuildingsPoints(map);
  }
  if (layers.buildings == 'polygon') {
    removeBuildingsShapes(map);
  }
};

const removeBuildingsPoints = (map: maplibregl.Map) => {
  LAYERS_BDGS_POINT_ALL.forEach((l) => {
    if (map.getLayer(l)) {
      map.removeLayer(l);
    }
  });
  removeBuildingsSource(map);
};

const removeBuildingsShapes = (map: maplibregl.Map) => {
  LAYERS_BDGS_SHAPE_ALL.forEach((l) => {
    if (map.getLayer(l)) {
      map.removeLayer(l);
    }
  });
  removeBuildingsSource(map);
};

const removeBuildingsSource = (map: maplibregl.Map) => {
  if (map.getSource(SRC_BDGS_POINTS)) {
    map.removeSource(SRC_BDGS_POINTS);
  }
  if (map.getSource(SRC_BDGS_SHAPES)) {
    map.removeSource(SRC_BDGS_SHAPES);
  }
};
