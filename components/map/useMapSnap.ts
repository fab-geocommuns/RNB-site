import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import {
  setSnapContext,
  hideSnapIndicator,
} from '@/components/map/snap/buildingSnap';

const LOCAL_STORAGE_KEY = 'rnb-edition-snap-settings';

/**
 * Tient à jour le contexte de l'aimantation (cf components/map/snap) à partir
 * du store : activation et bâtiment à exclure des cibles. Les modes de dessin
 * patchés dans useMapDraw lisent ce contexte à chaque évènement souris.
 *
 * Gère aussi la persistance de la préférence d'activation dans le
 * localStorage.
 */
export const useMapSnap = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const snapEnabled = useSelector(
    (state: RootState) => state.edition.snap.enabled,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );

  // restaure la préférence sauvegardée au montage
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (typeof saved.enabled === 'boolean') {
        dispatch(Actions.edition.setSnapEnabled(saved.enabled));
      }
    } catch (_error) {}
  }, [dispatch]);

  useEffect(() => {
    try {
      window.localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({ enabled: snapEnabled }),
      );
    } catch (_error) {}
  }, [snapEnabled]);

  // le bâtiment sélectionné est celui dont on édite la forme : sa géométrie
  // d'origine, toujours affichée dans les tuiles, ne doit pas être une cible
  const excludedRnbId =
    selectedItem?._type === 'building' ? selectedItem.rnb_id : null;

  useEffect(() => {
    setSnapContext({
      map: map ?? null,
      enabled: snapEnabled,
      excludedRnbId,
    });
    if (map && !snapEnabled) {
      hideSnapIndicator(map);
    }
  }, [map, snapEnabled, excludedRnbId]);

  useEffect(() => {
    return () => {
      setSnapContext({ map: null });
    };
  }, []);

  // l'indicateur suit le curseur pendant le dessin : on le masque quand le
  // geste ou le mode se termine
  useEffect(() => {
    if (!map) return;
    const hide = () => hideSnapIndicator(map);
    map.on('draw.modechange', hide);
    map.on('mouseup', hide);
    return () => {
      map.off('draw.modechange', hide);
      map.off('mouseup', hide);
    };
  }, [map]);
};
