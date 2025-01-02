// Background styles
import vector from '@/components/map/mapstyles/vector.json';
import satellite from '@/components/map/mapstyles/satellite.json';

// Maplibre styles
import maplibregl, { StyleSpecification } from 'maplibre-gl';

// React things
import { use, useCallback, useEffect } from 'react';

// Store
import { useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';

const BDGS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';
const ADS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/permis/tiles/{x}/{y}/{z}.pbf';

///////////////////////////////////
///////////////////////////////////
// BUILDINGS

// Buildings source
export const SRC_BDGS = 'bdgtiles';
export const SRC_BDGS_SHAPES_URL = `${process.env.NEXT_PUBLIC_API_BASE}/tiles/shapes/{x}/{y}/{z}.pbf`;
export const SRC_BDGS_POINTS_URL = `${process.env.NEXT_PUBLIC_API_BASE}/tiles/{x}/{y}/{z}.pbf`;

// Buildings layers : point:
export const LAYER_BDGS_POINT = 'bdgs_point';

// Buildings layers : shapes
export const LAYER_BDGS_SHAPE_BORDER = 'bdgs_shape';
export const LAYER_BDGS_SHAPE_FILL = 'bdgs_shape_fill';
export const LAYER_BDGS_SHAPE_POINT = 'bdgs_shape_point';
export const LAYERS_BDGS_SHAPE_ALL = [
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_FILL,
  LAYER_BDGS_SHAPE_POINT,
];

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
export const PLOTS_LAYER = 'plots';
export const PLOTS_SOURCE = 'plots';

// Icons
import { getADSOperationIcons } from '@/logic/ads';
import { BuildingSourceSwitcherControl } from '@/components/map/BuildingSourceSwitcherControl';

export const STYLES = {
  vector: {
    name: 'Plan',
    style: vector as StyleSpecification,
  },

  satellite: {
    name: 'Satellite',
    style: satellite as StyleSpecification,
  },
};

export const DEFAULT_STYLE = STYLES.vector.style;

/**
 * Ajout et gestion des couches de la carte
 * @param map
 */
export const useMapLayers = (map?: maplibregl.Map) => {
  // Get the layers from the store
  const layers = useSelector((state: RootState) => state.map.layers);

  const installAll = (map) => {
    installBuildings(map);
    installADS(map);

    if (layers.extraLayers.includes('plots')) {
      installPlots(map);
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
      tiles: [ADS_TILES_URL + '#' + Math.random()],
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
      id: 'adsicon',
      source: 'ads',
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
  const installBuildings = (map) => {
    // First, we remove buildings layers and source
    removeBuildings(map);

    // Then, we install the source
    installBuildingsSource(map);
    installBuildingsLayers(map);
  };

  const installBuildingsSource = (map) => {
    let tilesUrl = undefined;

    if (layers.buildings == 'point') {
      tilesUrl = SRC_BDGS_POINTS_URL;
    }
    if (layers.buildings == 'polygon') {
      tilesUrl = SRC_BDGS_SHAPES_URL;
    }

    map.addSource(SRC_BDGS, {
      type: 'vector',
      tiles: [tilesUrl],
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'rnb_id',
    });
  };

  const installBuildingsLayers = (map) => {
    console.log(layers.buildings);

    if (layers.buildings == 'point') {
      installBuildingsPointsLayers(map);
    }
    if (layers.buildings == 'polygon') {
      installBuildingsShapesLayers(map);
    }
  };

  const installBuildingsPointsLayers = (map) => {
    map.addLayer({
      id: LAYER_BDGS_POINT,
      type: 'circle',
      source: SRC_BDGS,
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
          '#FF732C',
          '#1452e3',
        ],
      },
    });
  };

  const installBuildingsShapesLayers = (map) => {
    // Polygon border
    map.addLayer({
      id: LAYER_BDGS_SHAPE_BORDER,
      type: 'fill',
      source: SRC_BDGS,
      'source-layer': 'default',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hovered'], false],
          '#132353',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['>', ['get', 'contributions'], 0],
          '#FF732C',
          '#1452e3',
        ],
        'fill-opacity': 0.08,
      },
    });

    // Polygon fill
    map.addLayer({
      id: LAYER_BDGS_SHAPE_FILL,
      type: 'line',
      source: SRC_BDGS,
      'source-layer': 'default',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hovered'], false],
          '#132353',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['>', ['get', 'contributions'], 0],
          '#FF732C',
          '#1452e3',
        ],
        'line-width': 1.5,
      },
    });

    // Points on the polygon source
    map.addLayer({
      id: LAYER_BDGS_SHAPE_POINT,
      type: 'circle',
      source: SRC_BDGS,
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
          '#FF732C',
          '#1452e3',
        ],
      },
    });
  };

  const removeBuildings = (map) => {
    if (layers.buildings == 'point') {
      removeBuildingsPoints(map);
    }
    if (layers.buildings == 'polygon') {
      removeBuildingsShapes(map);
    }
  };

  const removeBuildingsPoints = (map) => {
    if (map.getLayer(LAYER_BDGS_POINT)) {
      map.removeLayer(LAYER_BDGS_POINT);
    }
    removeBuildingsSource(map);
  };

  const removeBuildingsShapes = (map) => {
    LAYERS_BDGS_SHAPE_ALL.forEach((l) => {
      if (map.getLayer(l)) {
        map.removeLayer(l);
      }
    });
    removeBuildingsSource(map);
  };

  const removeBuildingsSource = (map) => {
    if (map.getSource(SRC_BDGS)) {
      map.removeSource(SRC_BDGS);
    }
  };

  ///////////////////////////////////
  ///////////////////////////////////
  // Plots

  const installPlots = useCallback((map: maplibregl.Map) => {
    if (map.getLayer(PLOTS_LAYER)) map.removeLayer(PLOTS_LAYER);
    if (map.getSource(PLOTS_SOURCE)) map.removeSource(PLOTS_SOURCE);

    map.addSource(PLOTS_SOURCE, {
      type: 'vector',
      tiles: [
        process.env.NEXT_PUBLIC_API_BASE + '/plots/tiles/{x}/{y}/{z}.pbf',
      ],
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'id',
    });

    map.addLayer({
      id: PLOTS_LAYER,
      source: PLOTS_SOURCE,
      'source-layer': 'default',
      type: 'line',
      paint: {
        'line-color': '#ea580c',
        'line-opacity': 0.9,
        'line-width': 2,
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
    installAll(map);
  }, [layers]);

  useEffect(() => {
    if (map) {
      if (map.loaded()) {
        installAll(map);
      } else {
        map.once('load', () => installAll(map));
      }
    }
  }, [map]);

  const adsOperationsIcons = getADSOperationIcons();

  const reloadBuildings = useSelector(
    (state: RootState) => state.map.reloadBuildings,
  );

  // Ajout de la couche vectorielle des bâtiments
  const initBuildingLayer = useCallback((map: maplibregl.Map) => {
    // First, remove all layers
    // Remove point layer
    if (map.getLayer(BUILDINGS_LAYER_POINT)) {
      map.removeLayer(BUILDINGS_LAYER_POINT);
    }
    // Remove shape layers
    BUILDINGS_LAYERS_SHAPE.forEach((l) => {
      if (map.getLayer(l)) {
        map.removeLayer(l);
      }
    });

    // Finally remove the source
    if (map.getSource(BUILDINGS_SOURCE)) {
      map.removeSource(BUILDINGS_SOURCE);
    }

    map.addSource(BUILDINGS_SOURCE, {
      type: 'vector',
      tiles: [BDGS_TILES_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'rnb_id',
    });

    // Polygon border
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_BORDER,
      type: 'fill',
      source: BUILDINGS_SOURCE,
      'source-layer': 'default',
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hovered'], false],
          '#132353',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['>', ['get', 'contributions'], 0],
          '#FF732C',
          '#1452e3',
        ],
        'fill-opacity': 0.08,
      },
    });

    // Polygon fill
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_FILL,
      type: 'line',
      source: BUILDINGS_SOURCE,
      'source-layer': 'default',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'hovered'], false],
          '#132353',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['>', ['get', 'contributions'], 0],
          '#FF732C',
          '#1452e3',
        ],
        'line-width': 1.5,
      },
    });

    // Points on the polygon source
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_POINT,
      type: 'circle',
      source: BUILDINGS_SOURCE,
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
          '#FF732C',
          '#1452e3',
        ],
      },
    });

    map.addLayer({
      id: BUILDINGS_LAYER_POINT,
      type: 'circle',
      source: BUILDINGS_SOURCE,
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
          '#FF732C',
          '#1452e3',
        ],
      },
    });

    const buildingSourceControl = map._controls.find(
      (c) => c instanceof BuildingSourceSwitcherControl,
    );
    if (buildingSourceControl) {
      buildingSourceControl.updateStyles();
    }
  }, []);

  // Initialisation des couches vectorielles
  useEffect(() => {
    if (map) {
      if (map.loaded()) {
        //initBuildingLayer(map);
        //initADSLayer(map);
        //initPlotsLayer(map);
      } else {
        //map.once('load', () => initBuildingLayer(map));
        //map.once('load', () => initADSLayer(map));
        //map.once('load', () => initPlotsLayer(map));
      }
    }
  }, [initBuildingLayer, map]);

  // Initialisation de la couche vectorielle et de la synchronisation: reloadBuildings
  useEffect(() => {
    if (map && map.isStyleLoaded()) {
      // initBuildingLayer(map);
    }
  }, [reloadBuildings, map, initBuildingLayer]);
};
