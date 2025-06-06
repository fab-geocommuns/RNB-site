import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  SRC_BDGS_POINTS,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { RootState } from '@/stores/store';
import { BuildingCandidatesToMerge } from '@/stores/edition/edition-slice';
import maplibregl from 'maplibre-gl';

/**
 * Gestion de la synchronisation entre la selection d'un item et le store Redux
 * @param map
 */
export const useMapStateSyncSelectedBuildingsForMerge = (
  map?: maplibregl.Map,
) => {
  const candidatesToMerge = useSelector(
    (state: RootState) => state.edition.merge.candidates,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);
  const prevSelectedRef = useRef<string[]>([]);

  useEffect(() => {
    const prevSelected = prevSelectedRef.current;
    const sources = [SRC_BDGS_POINTS, SRC_BDGS_SHAPES];
    if (map && operation !== 'merge') {
      const onSourceData = (e: any) => {
        if (checkSource(e)) setMapLayer(sources, map, 'removeFeatureState');
      };
      map.on('sourcedata', (e) => onSourceData(e));
      setMapLayer(sources, map, 'removeFeatureState');
      return () => {
        map.off('sourcedata', onSourceData);
      };
    }
    if (map && candidatesToMerge) {
      if (candidatesToMerge.length === 0 && prevSelected.length) {
        setFeatureStateLayer(sources, map, prevSelected[0], false);
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
        setFeatureStateLayer(sources, map, id, inPanel);
      });
    }
    prevSelectedRef.current = candidatesToMerge;
  }, [candidatesToMerge, operation]);
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
function setFeatureStateLayer(
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
