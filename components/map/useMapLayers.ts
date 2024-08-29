import vector from '@/components/map/mapstyles/vector.json';
import satellite from '@/components/map/mapstyles/satellite.json';

import maplibregl, { StyleSpecification } from 'maplibre-gl';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/map/store';

const TILES_URL = process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';
export const BUILDINGS_SOURCE = 'bdgs_tiles';
export const BUILDINGS_LAYER = 'bdgs_layer';

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
export const useMapLayers = (map: maplibregl.Map) => {
  // check if mapBackground change in the store
  const mapBackground = useSelector((state: RootState) => state.mapBackground);

  const reloadBuildings = useSelector(
    (state: RootState) => state.reloadBuildings,
  );

  // function to change the background style on map
  const setMapBackground = useCallback(
    (map: maplibregl.Map, styleName: string) => {
      // The background is the foundation of the style. It means we have to switch it and then
      // rebuild data layers and building layer

      // get current style and extract buildings source and layer
      const currentStyle = map.getStyle();
      const buildingsSource = getBuildingsSource(currentStyle);
      const buildingsLayer = getBuildingsLayer(currentStyle);

      // Init a new style with the new background
      const newStyle = STYLES[styleName].style;
      if (buildingsSource && buildingsLayer) {
        newStyle.sources[BUILDINGS_SOURCE] = buildingsSource;
        newStyle.layers.push(buildingsLayer);
      }

      // Finally set the new style
      map.setStyle(newStyle);

      map.setStyle(STYLES[styleName].style);
    },
    [],
  );

  const getBuildingsSource = (style) => {
    return style.sources[BUILDINGS_SOURCE];
  };
  const getBuildingsLayer = (style) => {
    return style.layers.find((l) => l.id === BUILDINGS_LAYER);
  };

  // Ajout de la couche vectorielle des bâtiments
  const initBuildingLayer = useCallback((map: maplibregl.Map) => {
    if (map.getLayer(BUILDINGS_LAYER)) map.removeLayer(BUILDINGS_LAYER);
    if (map.getSource(BUILDINGS_SOURCE)) map.removeSource(BUILDINGS_SOURCE);

    map.addSource(BUILDINGS_SOURCE, {
      type: 'vector',
      tiles: [TILES_URL + '#' + Math.random()], // Ajout d'un fragment aléatoire pour éviter le cache du navigateur lors du rechargement de cette couche
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
      if (map.loaded()) initBuildingLayer(map);
      else map.once('load', () => initBuildingLayer(map));
    }
  }, [initBuildingLayer, map]);

  // Initialisation de la couche vectorielle et de la synchronisation: reloadBuildings
  useEffect(() => {
    if (map && map.isStyleLoaded()) {
      initBuildingLayer(map);
    }
  }, [reloadBuildings, map, initBuildingLayer]);

  // Change style when mapBackground change
  useEffect(() => {
    if (map && mapBackground) {
      setMapBackground(map, mapBackground);
    }
  }, [mapBackground]);
};
