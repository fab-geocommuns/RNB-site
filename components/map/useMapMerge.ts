import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch, Actions } from '@/stores/store';
import maplibregl from 'maplibre-gl';
import { MapMouseEvent } from 'maplibre-gl';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';

/**
 * En mode merge, un clic dans le vide (hors d'un bâtiment) sort du mode merge
 * dès qu'un nouveau bâtiment a été créé.
 *
 * Le highlight des candidats est désormais géré de façon centralisée par
 * useMapHighlightForEdition.
 * @param map
 */
export const useMapMerge = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const newBuilding = useSelector(
    (state: RootState) => state.edition.merge.newBuilding,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);

  useEffect(() => {
    if (map) {
      const handleClickEvent = (e: MapMouseEvent) => {
        const featureOnCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e,
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
      return () => {
        map.off('click', handleClickEvent);
      };
    }
  }, [operation, newBuilding]);
};
