import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { toasterSuccess } from '@/components/contribution/toaster';

/**
 * Opening a demolished building turns its "Bâtiments démolis" layer on,
 * otherwise it stays invisible. Shared between the consultation panel
 * (BuildingPanel) and the edition panel (EditionPanel): both can select a
 * building by rnb_id (URL ?q=, or manual search) without the layer being on.
 *
 * @param bdg the currently selected building
 * @param layersKey localStorage key for this map's layer preferences
 *   (MAP_LAYERS_KEY on /carte, MAP_LAYERS_EDITION_KEY on /edition)
 */
export const useAutoActivateDemolishedLayer = (
  bdg: SelectedBuilding,
  layersKey: string,
) => {
  const dispatch: AppDispatch = useDispatch();
  const mapLayers = useSelector((state: RootState) => state.map.layers);

  useEffect(() => {
    if (bdg.status !== 'demolished' || !bdg.is_active) return;
    if (mapLayers.extraLayers.includes('demolished')) return;
    // Assignment, not a toggle: StrictMode replays this effect with the same stale
    // closure, and a toggle reading fresh state would remove the layer on replay.
    dispatch(
      Actions.map.setExtraLayers(
        [...mapLayers.extraLayers, 'demolished'],
        layersKey,
      ),
    );
    toasterSuccess(dispatch, 'Calque "Bâtiments démolis" activé');
  }, [bdg.rnb_id]);
};
