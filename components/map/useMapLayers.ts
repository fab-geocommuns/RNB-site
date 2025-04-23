// Background styles
import vectorOsm from '@/components/map/mapstyles/vector-osm.json';
import vectorIgnStandard from '@/components/map/mapstyles/vector-ign-standard.json';
import satellite from '@/components/map/mapstyles/satellite.json';

// Maplibre styles
import maplibregl, { StyleSpecification } from 'maplibre-gl';

// React things
import { useCallback, useEffect, useRef } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, RootState } from '@/stores/store';

///////////////////////////////////
///////////////////////////////////
// BUILDINGS

// Buildings source
export const SRC_BDGS_POINTS = 'bdgtiles_points';
export const SRC_BDGS_SHAPES = 'bdgtiles_shapes';
export const SRC_BDGS_SHAPES_URL = `${process.env.NEXT_PUBLIC_API_BASE}/tiles/shapes/{x}/{y}/{z}.pbf`;
export const SRC_BDGS_POINTS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/tiles/{x}/{y}/{z}.pbf`;

// Buildings layers : point:
export const LAYER_BDGS_POINT = 'bdgs_point';
export const LAYER_BDGS_POINT_SHAPE_BORDER = 'bdgs_bdgs_point_shape_border';
export const LAYER_BDGS_POINT_SHAPE_FILL = 'bdgs_bdgs_point_shape_fill';
export const LAYERS_BDGS_POINT_ALL = [
  LAYER_BDGS_POINT,
  LAYER_BDGS_POINT_SHAPE_BORDER,
  LAYER_BDGS_POINT_SHAPE_FILL,
];

// Buildings layers : shapes
export const LAYER_BDGS_SHAPE_BORDER = 'bdgs_shape';
export const LAYER_BDGS_SHAPE_FILL = 'bdgs_shape_fill';
export const LAYER_BDGS_SHAPE_POINT = 'bdgs_shape_point';
export const LAYERS_BDGS_SHAPE_ALL = [
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_FILL,
  LAYER_BDGS_SHAPE_POINT,
];

const CONTRIBUTIONS_COLOR = '#f767ef';

///////////////////////////////////
///////////////////////////////////
// ADS

// ADS source
export const SRC_ADS = 'ads';
export const SRC_ADS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/permis/tiles/{x}/{y}/{z}.pbf`;

// ADS Layers
export const LAYER_ADS_CIRCLE = 'adscircle';
export const LAYER_ADS_ICON = 'adsicon';

// Plots
export const LAYER_PLOTS_SHAPE = 'plots_shape';
export const LAYER_PLOTS_TXT = 'plots_txt';
export const SRC_PLOTS = 'plotstiles';

// Icons
import { getADSOperationIcons } from '@/logic/ads';
import {
  MapBackgroundLayer,
  MapLayer,
  MapBuildingsLayer,
} from '@/stores/map/map-slice';

export const STYLES: Record<
  MapBackgroundLayer,
  { name: string; style: StyleSpecification }
> = {
  vectorOsm: {
    name: 'OSM',
    style: vectorOsm as StyleSpecification,
  },
  vectorIgnStandard: {
    name: 'IGN standard',
    style: vectorIgnStandard as StyleSpecification,
  },
  satellite: {
    name: 'Satellite',
    style: satellite as StyleSpecification,
  },
};

export const DEFAULT_STYLE =
  STYLES[
    (process.env.FOND_DE_CARTE_PAR_DEFAUT as keyof typeof STYLES) ||
      'vectorIgnStandard'
  ].style;

// C.f. discussion here https://github.com/mapbox/mapbox-gl-js/issues/6707#issuecomment-1942879968
// and https://github.com/mapbox/mapbox-gl-draw/blob/main/src/setup.js#L66
function onMapReady(map: maplibregl.Map, callback: () => void) {
  if (map.loaded()) {
    callback();
  } else {
    const mapLoadedInterval = setInterval(() => {
      if (map.loaded()) {
        clearInterval(mapLoadedInterval);
        callback();
      }
    }, 16);

    map.on('load', () => {
      clearInterval(mapLoadedInterval);
      callback();
    });
  }
}

/**
 * Ajout et gestion des couches de la carte
 * @param map
 */
export const useMapLayers = ({
  map,
  defaultBackgroundLayer,
  defaultBuildingLayer,
  selectedBuildingisGreen,
}: {
  map?: maplibregl.Map;
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
  selectedBuildingisGreen?: Boolean;
}) => {
  // Get the layers from the store
  const layers = useSelector((state: RootState) => state.map.layers);
  const reloadBuildings = useSelector(
    (state: RootState) => state.map.reloadBuildings,
  );
  const dispatch = useDispatch();
  const installAllRunning = useRef(false);

  const installAll = async (map: maplibregl.Map) => {
    // We don't want concurrent calls running
    if (installAllRunning.current) return;
    installAllRunning.current = true;

    try {
      installBuildings(map);
      await installADS(map);

      if (layers.extraLayers.includes('plots')) {
        installPlots(map);
      }
    } catch (e) {
      throw e;
    } finally {
      installAllRunning.current = false;
    }

    if (process.env.NEXT_PUBLIC_ENABLE_MAPGRAB === 'true' && map) {
      console.log('Installing MapGrab');
      import('@mapgrab/map-interface').then(({ installMapGrab }) => {
        installMapGrab(map, 'mainMap');
      });
    }
  };

  ///////////////////////////////////
  ///////////////////////////////////
  // ADS

  const installADS = useCallback(async (map: maplibregl.Map) => {
    if (map.getLayer(LAYER_ADS_CIRCLE)) map.removeLayer(LAYER_ADS_CIRCLE);
    if (map.getLayer(LAYER_ADS_ICON)) map.removeLayer(LAYER_ADS_ICON);
    if (map.getSource(SRC_ADS)) map.removeSource(SRC_ADS);

    // Icons for ADS
    // build icon
    if (!map.hasImage('adsBuild')) {
      const adsBuild = await map.loadImage(adsOperationsIcons.build.src);
      map.addImage('adsBuild', adsBuild.data, { sdf: true });
    }

    // modify icon
    if (!map.hasImage('adsModify')) {
      const adsModify = await map.loadImage(adsOperationsIcons.modify.src);
      map.addImage('adsModify', adsModify.data, { sdf: true });
    }

    // demolish icon
    if (!map.hasImage('adsDemo')) {
      const adsDemo = await map.loadImage(adsOperationsIcons.demolish.src);
      map.addImage('adsDemo', adsDemo.data, { sdf: true });
    }

    map.addSource(SRC_ADS, {
      type: 'vector',
      tiles: [SRC_ADS_URL + '#' + Math.random()],
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'file_number',
    });

    map.addLayer({
      id: LAYER_ADS_CIRCLE,
      source: SRC_ADS,
      'source-layer': 'default',
      type: 'circle',
      paint: {
        'circle-radius': [
          'case',
          ['boolean', ['==', ['feature-state', 'hovered'], true]],
          12,
          10,
        ],
        'circle-stroke-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#431407',
          '#ffffff',
        ],
        'circle-stroke-width': 2,
        'circle-color': '#fbbf24',
      },
    });

    map.addLayer({
      id: LAYER_ADS_ICON,
      source: SRC_ADS,
      'source-layer': 'default',
      type: 'symbol',
      layout: {
        'icon-image': [
          'match',
          ['get', 'operation'],
          'build',
          'adsBuild',
          'demolish',
          'adsDemo',
          'modify',
          'adsModify',
          'adsBuild',
        ],
        'icon-size': 0.2,
        'icon-allow-overlap': true,
        'icon-ignore-placement': true,
      },
      paint: {
        'icon-color': '#431407',
      },
    });
  }, []);

  ///////////////////////////////////
  ///////////////////////////////////
  // Buildings
  const installBuildings = (map: maplibregl.Map) => {
    // First, we remove buildings layers and source
    removeBuildings(map);

    // Then, we install the source
    installBuildingsSource(map);
    installBuildingsLayers(map);
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

  const installBuildingsLayers = (map: maplibregl.Map) => {
    if (layers.buildings == 'point') {
      installBuildingsPointsLayers(map);
    }
    if (layers.buildings == 'polygon') {
      installBuildingsShapesLayers(map);
    }
  };

  const installBuildingsPointsLayers = (map: maplibregl.Map) => {
    // Shape for vector background
    if (['vectorIgnStandard', 'vectorOsm'].includes(layers.background)) {
      map.addLayer({
        id: LAYER_BDGS_POINT_SHAPE_FILL,
        type: 'fill',
        source: SRC_BDGS_SHAPES,
        'source-layer': 'default',
        paint: {
          'fill-color': '#cccccc',
          'fill-opacity': 1,
        },
      });

      map.addLayer({
        id: LAYER_BDGS_POINT_SHAPE_BORDER,
        type: 'line',
        source: SRC_BDGS_SHAPES,
        'source-layer': 'default',
        paint: {
          'line-color': [
            'case',
            ['boolean', ['feature-state', 'in_panel'], false],
            '#31e060',
            ['>', ['get', 'contributions'], 0],
            CONTRIBUTIONS_COLOR,
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
      paint: {
        'circle-radius': [
          'case',
          ['boolean', ['==', ['feature-state', 'hovered'], true]],
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
          CONTRIBUTIONS_COLOR,
          '#1452e3',
        ],
      },
    });
  };

  const installBuildingsShapesLayers = (map: maplibregl.Map) => {
    // Polygon fill
    map.addLayer({
      id: LAYER_BDGS_SHAPE_BORDER,
      type: 'fill',
      source: SRC_BDGS_SHAPES,
      'source-layer': 'default',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['boolean', ['feature-state', 'hovered'], false],
          '#132353',
          ['>', ['get', 'contributions'], 0],
          CONTRIBUTIONS_COLOR,
          '#1452e3',
        ],
        'fill-opacity': 0.08,
      },
    });

    const selectedBuildingColor = selectedBuildingisGreen
      ? '#31e060'
      : '#f57200';

    // Polygon border
    map.addLayer({
      id: LAYER_BDGS_SHAPE_FILL,
      type: 'line',
      source: SRC_BDGS_SHAPES,
      'source-layer': 'default',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          selectedBuildingColor,
          ['boolean', ['feature-state', 'hovered'], false],
          '#132353',
          ['>', ['get', 'contributions'], 0],
          CONTRIBUTIONS_COLOR,
          '#1452e3',
        ],
        'line-width': 1.5,
      },
    });

    // Points on the polygon source
    map.addLayer({
      id: LAYER_BDGS_SHAPE_POINT,
      type: 'circle',
      source: SRC_BDGS_SHAPES,
      'source-layer': 'default',
      filter: ['==', '$type', 'Point'],
      paint: {
        'circle-radius': [
          'case',
          ['boolean', ['==', ['feature-state', 'hovered'], true]],
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
          CONTRIBUTIONS_COLOR,
          '#1452e3',
        ],
      },
    });
  };

  const removeBuildings = (map: maplibregl.Map) => {
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

  ///////////////////////////////////
  ///////////////////////////////////
  // Plots

  const installPlots = useCallback((map: maplibregl.Map) => {
    if (map.getLayer(LAYER_PLOTS_SHAPE)) map.removeLayer(LAYER_PLOTS_SHAPE);
    if (map.getLayer(LAYER_PLOTS_TXT)) map.removeLayer(LAYER_PLOTS_TXT);
    if (map.getSource(SRC_PLOTS)) map.removeSource(SRC_PLOTS);

    map.addSource(SRC_PLOTS, {
      type: 'vector',
      tiles: [
        process.env.NEXT_PUBLIC_API_BASE + '/plots/tiles/{x}/{y}/{z}.pbf',
      ],
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'id',
    });

    map.addLayer({
      id: LAYER_PLOTS_SHAPE,
      source: SRC_PLOTS,
      'source-layer': 'default',
      type: 'line',
      paint: {
        'line-color': '#ea580c',
        'line-opacity': 0.9,
        'line-width': 2,
      },
    });

    // Display the plot id in the middle of the plot
    map.addLayer({
      id: LAYER_PLOTS_TXT,
      source: SRC_PLOTS,
      'source-layer': 'default',
      type: 'symbol',
      layout: {
        'text-field': ['get', 'plot_number'],
        'text-size': 12,
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': false,
      },
      paint: {
        'text-halo-color': '#ffffff',
        'text-halo-width': 2,
      },
    });
  }, []);

  // When layers change, we rebuild the style and the layers
  useEffect(() => {
    // If no map, we stop here
    if (!map) return;

    // First the background
    const newBckg = JSON.parse(JSON.stringify(STYLES[layers.background].style));
    map.setStyle(newBckg);

    // Install other data after the background
    onMapReady(map, () => {
      installAll(map);
    });
  }, [layers, map]);

  useEffect(() => {
    if (map) {
      onMapReady(map, () => {
        installAll(map);
      });
    }
  }, [map]);

  useEffect(() => {
    if (defaultBackgroundLayer)
      dispatch(Actions.map.setLayersBackground(defaultBackgroundLayer));
    if (defaultBuildingLayer)
      dispatch(Actions.map.setLayersBuildings(defaultBuildingLayer));
  }, [defaultBackgroundLayer, defaultBuildingLayer]);

  useEffect(() => {
    if (map) {
      installBuildings(map);
    }
  }, [reloadBuildings]);

  const adsOperationsIcons = getADSOperationIcons();
};
