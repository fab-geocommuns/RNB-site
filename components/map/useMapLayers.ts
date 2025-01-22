import vector from '@/components/map/mapstyles/vector.json';
import satellite from '@/components/map/mapstyles/satellite.json';

import maplibregl, { MapMouseEvent, StyleSpecification } from 'maplibre-gl';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';

const BDGS_TILES_POINTS_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';
const BDGS_TILES_SHAPES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/shapes/{x}/{y}/{z}.pbf';
const ADS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/permis/tiles/{x}/{y}/{z}.pbf';

export const BUILDINGS_SOURCE_POINTS = 'bdg_source_points';
export const BUILDINGS_SOURCE_SHAPES = 'bdg_source_shapes';

export const BUILDINGS_LAYER_POINT = 'bdgs';
export const BUILDINGS_LAYER_SHAPE_BORDER_READ = 'bdgs_shape_read';
export const BUILDINGS_LAYER_SHAPE_FILL_READ = 'bdgs_shape_read_fill';
export const LIST_BUILDINGS_LAYERS_POINT = [
  BUILDINGS_LAYER_POINT,
  BUILDINGS_LAYER_SHAPE_BORDER_READ,
  BUILDINGS_LAYER_SHAPE_FILL_READ,
];

export const BUILDINGS_LAYER_SHAPE_BORDER = 'bdgs_shape';
export const BUILDINGS_LAYER_SHAPE_FILL = 'bdgs_shape_fill';
export const BUILDINGS_LAYER_SHAPE_POINT = 'bdgs_shape_point';
export const LIST_BUILDINGS_LAYERS_SHAPE = [
  BUILDINGS_LAYER_SHAPE_BORDER,
  BUILDINGS_LAYER_SHAPE_FILL,
  BUILDINGS_LAYER_SHAPE_POINT,
];

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
  const adsOperationsIcons = getADSOperationIcons();

  const reloadBuildings = useSelector(
    (state: RootState) => state.map.reloadBuildings,
  );

  const initADSLayer = useCallback(async (map: maplibregl.Map) => {
    if (map.getLayer('ads')) map.removeLayer('ads');
    if (map.getSource('ads')) map.removeSource('ads');

    // Icons for ADS
    // build icon

    const adsBuild = await map.loadImage(adsOperationsIcons.build.src);
    map.addImage('adsBuild', adsBuild.data, { sdf: true });
    // modify icon
    const adsModify = await map.loadImage(adsOperationsIcons.modify.src);
    map.addImage('adsModify', adsModify.data, { sdf: true });

    // demolish icon
    const adsDemo = await map.loadImage(adsOperationsIcons.demolish.src);
    map.addImage('adsDemo', adsDemo.data, { sdf: true });

    map.addSource('ads', {
      type: 'vector',
      tiles: [ADS_TILES_URL + '#' + Math.random()],
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'file_number',
    });

    map.addLayer({
      id: 'adscircle',
      source: 'ads',
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

  // Ajout de la couche vectorielle des bâtiments
  const initBuildingLayer = useCallback((map: maplibregl.Map) => {
    LIST_BUILDINGS_LAYERS_POINT.forEach((l) => {
      if (map.getLayer(l)) map.removeLayer(l);
    });
    LIST_BUILDINGS_LAYERS_SHAPE.forEach((l) => {
      if (map.getLayer(l)) map.removeLayer(l);
    });
    if (map.getSource(BUILDINGS_SOURCE_POINTS))
      map.removeSource(BUILDINGS_SOURCE_POINTS);
    if (map.getSource(BUILDINGS_SOURCE_SHAPES))
      map.removeSource(BUILDINGS_SOURCE_SHAPES);

    map.addSource(BUILDINGS_SOURCE_POINTS, {
      type: 'vector',
      tiles: [BDGS_TILES_POINTS_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'rnb_id',
    });
    map.addSource(BUILDINGS_SOURCE_SHAPES, {
      type: 'vector',
      tiles: [BDGS_TILES_SHAPES_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'rnb_id',
    });

    // Polygon mode: border
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_BORDER,
      type: 'fill',
      source: BUILDINGS_SOURCE_SHAPES,
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
    // Polygon mode: fill
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_FILL,
      type: 'line',
      source: BUILDINGS_SOURCE_SHAPES,
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
    // Polygon mode: points if no shape
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_POINT,
      type: 'circle',
      source: BUILDINGS_SOURCE_SHAPES,
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

    // Points mode: polygon fill
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_BORDER_READ,
      type: 'fill',
      source: BUILDINGS_SOURCE_SHAPES,
      'source-layer': 'default',
      paint: {
        'fill-color': '#DDDDDD',
      },
    });
    // Points mode: polygon border
    map.addLayer({
      id: BUILDINGS_LAYER_SHAPE_FILL_READ,
      type: 'line',
      source: BUILDINGS_SOURCE_SHAPES,
      'source-layer': 'default',
      paint: {
        'line-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['>', ['get', 'contributions'], 0],
          '#FF732C',
          '#999999',
        ],
        'line-width': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          2,
          1,
        ],
      },
    });
    // Points mode: points
    map.addLayer({
      id: BUILDINGS_LAYER_POINT,
      type: 'circle',
      source: BUILDINGS_SOURCE_POINTS,
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
        initBuildingLayer(map);
        initADSLayer(map);
      } else {
        map.once('load', () => initBuildingLayer(map));
        map.once('load', () => initADSLayer(map));
      }
    }
  }, [initBuildingLayer, map]);

  // Initialisation de la couche vectorielle et de la synchronisation: reloadBuildings
  useEffect(() => {
    if (map && map.isStyleLoaded()) {
      initBuildingLayer(map);
    }
  }, [reloadBuildings, map, initBuildingLayer]);
};
