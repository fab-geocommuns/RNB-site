import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/map/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent } from 'maplibre-gl';
import { BUILDINGS_SOURCE } from '@/components/map/mapstyles/buildingsDisplay';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  useState<string>();
  const previousHoveredBuildingID = useRef<string>();

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      map.on('click', async function (e) {
        console.log('click');

        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e.point.x,
          e.point.y,
        );
        console.log('featureCloseToCursor', featureCloseToCursor);

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

        if (previousHoveredBuildingID.current) {
          map.setFeatureState(
            {
              source: BUILDINGS_SOURCE,
              id: previousHoveredBuildingID.current,
              sourceLayer: 'default',
            },
            { hovered: false },
          );
        }
        previousHoveredBuildingID.current = featureCloseToCursor?.id as string;

        if (featureCloseToCursor) {
          map.setFeatureState(
            {
              source: BUILDINGS_SOURCE,
              id: featureCloseToCursor.id,
              sourceLayer: 'default',
            },
            { hovered: true },
          );
        }
      });
    }
  }, [dispatch, map]);
};
