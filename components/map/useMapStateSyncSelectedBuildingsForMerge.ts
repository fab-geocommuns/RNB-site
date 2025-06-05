import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  SRC_BDGS_POINTS,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { RootState } from '@/stores/store';
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
  const candidateToRemove = useSelector(
    (state: RootState) => state.edition.merge.candidateToremove,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);

  useEffect(() => {
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
      if (candidateToRemove) {
        const onSourceData = (e: any) => {
          if (checkSource(e)) {
            if (candidateToRemove.rnb_id) {
              setMapLayer(
                sources,
                map,
                'setFeatureState',
                candidateToRemove.rnb_id,
                { in_panel: false },
              );
            }
          }
        };
        map.on('sourcedata', (e) => onSourceData(e));
        if (candidateToRemove.rnb_id) {
          setMapLayer(
            sources,
            map,
            'setFeatureState',
            candidateToRemove.rnb_id,
            { in_panel: false },
          );
        }
        return () => {
          map.off('sourcedata', onSourceData);
        };
      }
      candidatesToMerge.map((candidate) => {
        const onSourceData = (e: any) => {
          if (checkSource(e)) {
            setMapLayer(sources, map, 'setFeatureState', candidate.rnb_id, {
              in_panel: true,
            });
          }
        };
        map.on('sourcedata', (e) => onSourceData(e));
        setMapLayer(sources, map, 'setFeatureState', candidate.rnb_id, {
          in_panel: true,
        });
        return () => {
          map.off('sourcedata', onSourceData);
        };
      });
    }
  }, [candidatesToMerge, operation]);
};

function setMapLayer(
  sources: string[],
  map: maplibregl.Map,
  method: string,
  id?: string,
  obj?: { in_panel: boolean },
) {
  for (const source of sources) {
    if (map.getSource(source)) {
      map[method](
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

function checkSource(e: any) {
  return (
    e.isSourceLoaded && [SRC_BDGS_POINTS, SRC_BDGS_SHAPES].includes(e.sourceId)
  );
}
