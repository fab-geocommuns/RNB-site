import cadastre from '@/components/map/mapstyles/cadastre.json';
import osm from '@/components/map/mapstyles/osm.json';
import ign from '@/components/map/mapstyles/ign.json';
import satellite from '@/components/map/mapstyles/satellite.json';

import {
  getBuildingsDisplay,
  BUILDINGS_SOURCE,
  BUILDINGS_LAYER,
} from '@/components/map/mapstyles/buildingsDisplay';

import maplibregl, { StyleSpecification } from 'maplibre-gl';
import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/map/store';
import { sourceMapsEnabled } from 'process';

const RNB_POINTS_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';
const RNB_SHAPES_TILES_URL =
  process.env.NEXT_PUBLIC_API_BASE + '/tiles/shapes/{x}/{y}/{z}.pbf';

export const STYLES = {
  cadastre: cadastre as StyleSpecification,
  osm: osm as StyleSpecification,
  satellite: satellite as StyleSpecification,
  ign: ign as StyleSpecification,
};

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
      const newStyle = JSON.parse(JSON.stringify(STYLES[styleName]));

      if (buildingsSource && buildingsLayer) {
        newStyle.sources[BUILDINGS_SOURCE] = buildingsSource;
        newStyle.layers.push(buildingsLayer);
      }

      // Finally set the new style
      map.setStyle(newStyle);
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

    const { bdgsSource, bdgsLayer } = getBuildingsDisplay();

    map.addSource(BUILDINGS_SOURCE, bdgsSource);

    map.addLayer(bdgsLayer);
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
