import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import {
  setSnapContext,
  hideSnapIndicator,
} from '@/components/map/snap/buildingSnap';

/**
 * Tient à jour le contexte de l'aimantation (cf components/map/snap) à partir
 * du store : activation, sensibilité et bâtiment à exclure des cibles. Les
 * modes de dessin patchés dans useMapDraw lisent ce contexte à chaque
 * évènement souris.
 */
export const useMapSnap = (map?: maplibregl.Map) => {
  const snapEnabled = useSelector(
    (state: RootState) => state.edition.snap.enabled,
  );
  const snapTolerancePx = useSelector(
    (state: RootState) => state.edition.snap.tolerancePx,
  );
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  // le bâtiment sélectionné est celui dont on édite la forme : sa géométrie
  // d'origine, toujours affichée dans les tuiles, ne doit pas être une cible
  const excludedRnbId =
    selectedItem?._type === 'building' ? selectedItem.rnb_id : null;

  useEffect(() => {
    setSnapContext({
      map: map ?? null,
      enabled: snapEnabled,
      tolerancePx: snapTolerancePx,
      excludedRnbId,
    });
    if (map && !snapEnabled) {
      hideSnapIndicator(map);
    }
  }, [map, snapEnabled, snapTolerancePx, excludedRnbId]);

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
