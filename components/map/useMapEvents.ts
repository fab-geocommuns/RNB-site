import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/map/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent } from 'maplibre-gl';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      map.on('click', async function (e) {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e.point.x,
          e.point.y,
        );

        if (featureCloseToCursor) {
          const rnb_id = featureCloseToCursor.properties.rnb_id;

          // Selection du bâtiment
          dispatch(Actions.map.selectBuilding(rnb_id));
        }
      });

      // Évenement de déplacement du curseur: changement de pointeur si proche d'un bâtiment
      map.on('mousemove', (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map!,
          e.point.x,
          e.point.y,
        );

        map!.getCanvas().style.cursor = featureCloseToCursor ? 'pointer' : '';
      });
    }
  }, [dispatch, map]);
};
