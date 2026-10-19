// Maplibre styles
import maplibregl from 'maplibre-gl';

// React things
import { useEffect, useRef } from 'react';
import * as Sentry from '@sentry/nextjs';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import {
  MapBackgroundLayer,
  MapBuildingsLayer,
  MapExtraLayer,
  MapLayers,
} from '@/stores/map/map-slice';

// Map layers (one module per map element)
import { STYLES } from './layers/backgrounds';
import { installBuildings } from './layers/buildings';
import { installADS, LAYER_ADS_CIRCLE, LAYER_ADS_ICON } from './layers/ads';
import {
  installBAN,
  LAYER_BAN_POINT,
  LAYER_BAN_TXT,
  SRC_BAN,
} from './layers/ban';
import {
  installPlots,
  LAYER_PLOTS_SHAPE,
  LAYER_PLOTS_TXT,
  SRC_PLOTS,
} from './layers/plots';
import {
  installReports,
  LAYER_REPORTS_CIRCLE,
  LAYER_REPORTS_ICON,
  LAYER_REPORTS_SMALL_CIRCLES,
  SRC_REPORTS,
} from './layers/reports';

// Re-export the constants and helpers so existing imports from this module keep working
export { STYLES, DEFAULT_STYLE } from './layers/backgrounds';
export * from './layers/buildings';
export * from './layers/ads';
export * from './layers/ban';
export * from './layers/plots';
export * from './layers/reports';

// Toggleable layers drawn above buildings and ADS, bottom to top
const EXTRA_LAYERS = [
  {
    layer: 'plots',
    sourceId: SRC_PLOTS,
    layerIds: [LAYER_PLOTS_SHAPE, LAYER_PLOTS_TXT],
    install: installPlots,
  },
  {
    layer: 'addresses',
    sourceId: SRC_BAN,
    layerIds: [LAYER_BAN_POINT, LAYER_BAN_TXT],
    install: installBAN,
  },
  {
    layer: 'reports',
    sourceId: SRC_REPORTS,
    layerIds: [
      LAYER_REPORTS_SMALL_CIRCLES,
      LAYER_REPORTS_CIRCLE,
      LAYER_REPORTS_ICON,
    ],
    install: installReports,
  },
] satisfies {
  layer: MapExtraLayer;
  sourceId: string;
  layerIds: string[];
  install: (map: maplibregl.Map) => void | Promise<void>;
}[];

// Adds or removes one extra layer, inserted right above the RNB layers ranked below it
const syncExtraLayer = async ({
  map,
  index,
  visible,
}: {
  map: maplibregl.Map;
  index: number;
  visible: boolean;
}) => {
  const extra = EXTRA_LAYERS[index];
  if (!!map.getSource(extra.sourceId) === visible) return;

  if (!visible) {
    extra.layerIds.forEach((id) => {
      if (map.getLayer(id)) map.removeLayer(id);
    });
    map.removeSource(extra.sourceId);
    return;
  }

  const lowerLayerIds: string[] = [
    LAYER_ADS_CIRCLE,
    LAYER_ADS_ICON,
    ...EXTRA_LAYERS.slice(0, index).flatMap((e) => e.layerIds),
  ];
  const order = map.getLayersOrder();
  const lastLowerIndex = order.findLastIndex((id) =>
    lowerLayerIds.includes(id),
  );
  const beforeId =
    lastLowerIndex === -1 ? undefined : order[lastLowerIndex + 1];

  await extra.install(map);

  if (beforeId && map.getLayer(beforeId)) {
    extra.layerIds.forEach((id) => map.moveLayer(id, beforeId));
  }
};

// Polled: load and idle fire only during a render, and a tile that fails to load triggers none.
// A removed map never loads: the polling stops with it
const whenLoaded = (map: maplibregl.Map) =>
  new Promise<void>((resolve) => {
    let removed = false;
    const onRemove = () => {
      removed = true;
    };
    map.once('remove', onRemove);
    const check = () => {
      if (removed) return;
      if (!map.loaded()) {
        setTimeout(check, 16);
        return;
      }
      map.off('remove', onRemove);
      resolve();
    };
    check();
  });

// validated and demolished change how the buildings are drawn, not which tiles are loaded
const sameBuildingLayers = (a: MapLayers, b: MapLayers) =>
  a.buildings === b.buildings &&
  (['validated', 'demolished'] as const).every(
    (layer) => a.extraLayers.includes(layer) === b.extraLayers.includes(layer),
  );

/**
 * Ajout et gestion des couches de la carte
 * @param map
 */

export const useMapLayers = ({
  map,
  defaultBackgroundLayer,
  defaultBuildingLayer,
  defaultExtraLayers,
  layersKey,
  selectedBuildingisGreen,
  editionMode,
}: {
  map?: maplibregl.Map;
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
  defaultExtraLayers?: MapExtraLayer[] | null;
  layersKey: string;
  selectedBuildingisGreen?: Boolean;
  editionMode?: boolean;
}) => {
  // Get the layers from the store
  const layers = useSelector((state: RootState) => state.map.layers);
  const reloadBuildings = useSelector(
    (state: RootState) => state.map.reloadBuildings,
  );
  const dispatch = useDispatch<AppDispatch>();

  // Read when a queued operation starts, so it always works on fresh state
  const latest = useRef({ layers, selectedBuildingisGreen, editionMode });
  latest.current = { layers, selectedBuildingisGreen, editionMode };
  // What the map displays, null until the first install
  const appliedLayers = useRef<MapLayers | null>(null);
  // Map operations run one at a time: a style change never lands in the middle of an install
  const queue = useRef<Promise<void>>(Promise.resolve());

  const enqueue = (operation: () => Promise<void>) => {
    queue.current = queue.current
      .then(operation)
      // Reported (Sentry is off in development), and the next operations still run
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
      });
  };

  const installAll = async (
    map: maplibregl.Map,
    options: typeof latest.current,
  ) => {
    await installBuildings(map, options);
    await installADS(map);

    for (const extra of EXTRA_LAYERS) {
      if (options.layers.extraLayers.includes(extra.layer))
        await extra.install(map);
    }

    if (process.env.NEXT_PUBLIC_ENABLE_MAPGRAB === 'true') {
      console.log('Installing MapGrab');
      import('@mapgrab/map-interface').then(({ installMapGrab }) => {
        installMapGrab(map, 'mainMap');
      });
    }
  };

  const syncLayers = async (map: maplibregl.Map) => {
    const options = latest.current;
    const { layers } = options;
    const applied = appliedLayers.current;

    if (applied?.background !== layers.background) {
      // Only a background change rebuilds the style, which drops every RNB layer.
      // No diff: a full load always ends with style.load
      const style = JSON.parse(JSON.stringify(STYLES[layers.background].style));
      map.setStyle(style, { diff: false });
      await new Promise((resolve) => map.once('style.load', resolve));
      // RNB layers wait for the background to show: their tiles never delay it
      await whenLoaded(map);
      await installAll(map, options);
    } else {
      if (!sameBuildingLayers(applied, layers)) {
        await installBuildings(map, { ...options, keepSources: true });
      }
      for (let index = 0; index < EXTRA_LAYERS.length; index++) {
        await syncExtraLayer({
          map,
          index,
          visible: layers.extraLayers.includes(EXTRA_LAYERS[index].layer),
        });
      }
    }
    appliedLayers.current = layers;
  };

  useEffect(() => {
    if (map) enqueue(() => syncLayers(map));
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
          layersKey,
        ),
      );
  }, [
    defaultBackgroundLayer,
    defaultBuildingLayer,
    defaultExtraLayers,
    layersKey,
  ]);

  useEffect(() => {
    if (map) enqueue(() => installBuildings(map, latest.current));
  }, [reloadBuildings]);
};
