// Maplibre styles
import maplibregl from 'maplibre-gl';

// React things
import { useEffect, useRef } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import {
  MapBackgroundLayer,
  MapBuildingsLayer,
  MapExtraLayer,
} from '@/stores/map/map-slice';

// Map layers (one module per map element)
import { STYLES } from './layers/backgrounds';
import { installBuildings } from './layers/buildings';
import { installADS } from './layers/ads';
import { installBAN } from './layers/ban';
import { installPlots } from './layers/plots';
import { installReports } from './layers/reports';

// Re-export the constants and helpers so existing imports from this module keep working
export { STYLES, DEFAULT_STYLE } from './layers/backgrounds';
export * from './layers/buildings';
export * from './layers/ads';
export * from './layers/ban';
export * from './layers/plots';
export * from './layers/reports';

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
  defaultExtraLayers,
  selectedBuildingisGreen,
  editionMode,
}: {
  map?: maplibregl.Map;
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
  defaultExtraLayers?: MapExtraLayer[] | null;
  selectedBuildingisGreen?: Boolean;
  editionMode?: boolean;
}) => {
  // Get the layers from the store
  const layers = useSelector((state: RootState) => state.map.layers);
  const reloadBuildings = useSelector(
    (state: RootState) => state.map.reloadBuildings,
  );
  const dispatch = useDispatch<AppDispatch>();
  const installAllRunning = useRef(false);
  const displayedReportTags = useSelector(
    (state: RootState) => state.report.displayedTags,
  );

  const installAll = async (map: maplibregl.Map) => {
    // We don't want concurrent calls running
    if (installAllRunning.current) return;
    installAllRunning.current = true;

    try {
      installBuildings(map, { layers, selectedBuildingisGreen, editionMode });
      await installADS(map);

      if (layers.extraLayers.includes('plots')) {
        installPlots(map);
      }

      if (layers.extraLayers.includes('addresses')) {
        await installBAN(map);
      }

      if (layers.extraLayers.includes('reports')) {
        await installReports(map, displayedReportTags);
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
    if (defaultBackgroundLayer)
      dispatch(Actions.map.setLayersBackground(defaultBackgroundLayer));

    if (defaultBuildingLayer)
      dispatch(Actions.map.setLayersBuildings(defaultBuildingLayer));

    if (defaultExtraLayers)
      dispatch(
        Actions.map.setExtraLayers(
          defaultExtraLayers as unknown as MapExtraLayer[],
        ),
      );
  }, [defaultBackgroundLayer, defaultBuildingLayer, defaultExtraLayers]);

  useEffect(() => {
    if (map) {
      installBuildings(map, { layers, selectedBuildingisGreen, editionMode });
    }
  }, [reloadBuildings]);
};
