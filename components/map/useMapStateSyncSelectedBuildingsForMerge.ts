import { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  SRC_BDGS_POINTS,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { RootState, AppDispatch, Actions } from '@/stores/store';
import maplibregl from 'maplibre-gl';
import { MapMouseEvent } from 'maplibre-gl';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';

/**
 * Gestion de la synchronisation entre la selection d'un item et le store Redux
 * @param map
 */
export const useMapStateSyncSelectedBuildingsForMerge = (
  map?: maplibregl.Map,
) => {
  const dispatch: AppDispatch = useDispatch();
  const candidatesToMerge = useSelector((state: RootState) =>
    state.edition.merge.candidates.map((candidate) => candidate.rnb_id),
  );
  const newBuilding = useSelector(
    (state: RootState) => state.edition.merge.newBuilding,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);
  const prevSelectedRef = useRef<string[]>([]);
  const prevOperationRef = useRef<string | null>(null);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    const sources = [SRC_BDGS_POINTS, SRC_BDGS_SHAPES];
    if (map && candidatesToMerge) {
      if (candidatesToMerge.length === 0 && prevSelected.length) {
        setFeatureStateInLayers(sources, map, prevSelected[0], false);
      }
      candidatesToMerge.map((candidate) => {
        let inPanel = true;
        let id = candidate;
        if (candidatesToMerge.length < prevSelected.length) {
          const filterIdToRemove = prevSelected.filter(
            (item) =>
              !candidatesToMerge.some((candidate) => candidate === item),
          );
          inPanel = false;
          id = filterIdToRemove[0];
        }
        setFeatureStateInLayers(sources, map, id, inPanel);
      });
    }
    if (map && !selectedItem && !candidatesToMerge.length) {
      removeFeatureStateInLayers(sources, map);
    }
    prevSelectedRef.current = candidatesToMerge;
  }, [candidatesToMerge, operation]);

  useEffect(() => {
    const sources = [SRC_BDGS_POINTS, SRC_BDGS_SHAPES];
    if (map) {
      const handleClickEvent = (e: MapMouseEvent) => {
        const featureOnCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e.point.x,
          e.point.y,
          0,
        );
        if (
          featureOnCursor === undefined &&
          operation === 'merge' &&
          newBuilding?.rnb_id
        ) {
          dispatch(Actions.edition.setOperation(null));
        }
      };
      map.on('click', handleClickEvent);
      const prevOperation = prevOperationRef.current;
      if (operation !== prevOperation) {
        removeFeatureStateInLayers(sources, map);
      }
      prevOperationRef.current = operation;
      return () => {
        map.off('click', handleClickEvent);
      };
    }
  }, [operation, candidatesToMerge, newBuilding]);
};

function setMapLayer(
  sources: string[],
  map: maplibregl.Map,
  method: 'setFeatureState' | 'removeFeatureState',
  id?: string,
  obj?: { in_panel: boolean },
) {
  for (const source of sources) {
    if (map.getSource(source)) {
      (map[method] as any)(
        {
          source,
          id,
          sourceLayer: 'default',
        },
        obj,
      );
    }
  }
}

function removeFeatureStateInLayers(sources: string[], map: maplibregl.Map) {
  const onSourceData = (e: any) => {
    if (checkSource(e)) setMapLayer(sources, map, 'removeFeatureState');
  };
  map.on('sourcedata', (e) => onSourceData(e));
  setMapLayer(sources, map, 'removeFeatureState');
  return () => {
    map.off('sourcedata', onSourceData);
  };
}

function setFeatureStateInLayers(
  sources: string[],
  map: maplibregl.Map,
  id: string,
  inPanel: boolean,
) {
  const onSourceData = (e: any) => {
    if (checkSource(e)) {
      setMapLayer(sources, map, 'setFeatureState', id, {
        in_panel: inPanel,
      });
    }
  };
  map.on('sourcedata', (e) => onSourceData(e));
  setMapLayer(sources, map, 'setFeatureState', id, {
    in_panel: inPanel,
  });
  return () => {
    map.off('sourcedata', onSourceData);
  };
}

function checkSource(e: any) {
  return (
    e.isSourceLoaded && [SRC_BDGS_POINTS, SRC_BDGS_SHAPES].includes(e.sourceId)
  );
}
