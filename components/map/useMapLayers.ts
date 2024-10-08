import vector from '@/components/map/mapstyles/vector.json';
import satellite from '@/components/map/mapstyles/satellite.json';

import maplibregl, { MapMouseEvent, StyleSpecification } from 'maplibre-gl';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/map/store';

const BDGS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';
const ADS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/ads/tiles/{x}/{y}/{z}.pbf';
export const BUILDINGS_SOURCE = 'bdgtiles';
export const BUILDINGS_LAYER = 'bdgs';

// Icons
//import adsIcon from '@/public/images/map/triangle.png';
//import adsIcon from '@/public/images/map/cat.png';
import adsIcon from '@/public/images/map/hammer.png';

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
  const reloadBuildings = useSelector(
    (state: RootState) => state.reloadBuildings,
  );

  const initADSLayer = useCallback(async (map: maplibregl.Map) => {
    if (map.getLayer('ads')) map.removeLayer('ads');
    if (map.getSource('ads')) map.removeSource('ads');

    const img = await map.loadImage(adsIcon.src);

    map.addImage('cat', img.data);

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
        'circle-radius': 12,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-color': [
          'match',
          ['get', 'operation'],
          'build',
          '#15803d',
          'demolish',
          '#be123c',
          'modify',
          '#4338ca',
          '#000000',
        ],
      },
    });

    map.addLayer({
      id: 'adsicon',
      source: 'ads',
      'source-layer': 'default',
      type: 'symbol',
      layout: {
        'text-field': 'ADS',
        'text-size': 10,
        'icon-allow-overlap': false,

        // 'icon-image': 'cat',
        // 'icon-size': 0.19,
        // 'icon-allow-overlap': true,
        // 'icon-ignore-placement': true,
      },
      paint: {
        'text-color': '#ffffff',
      },
    });
  }, []);

  // Ajout de la couche vectorielle des bâtiments
  const initBuildingLayer = useCallback((map: maplibregl.Map) => {
    console.log('initBuildingLayer');

    if (map.getLayer(BUILDINGS_LAYER)) map.removeLayer(BUILDINGS_LAYER);
    if (map.getSource(BUILDINGS_SOURCE)) map.removeSource(BUILDINGS_SOURCE);

    map.addSource(BUILDINGS_SOURCE, {
      type: 'vector',
      tiles: [BDGS_TILES_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'rnb_id',
    });

    map.addLayer({
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
    });
  }, []);

  // Initialisation de la couche vectorielle
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
