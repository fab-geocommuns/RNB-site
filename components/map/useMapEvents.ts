import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/map/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent } from 'maplibre-gl';
import {
  BUILDINGS_LAYER_POINT,
  BUILDINGS_LAYER_SHAPE_BORDER,
  BUILDINGS_LAYER_SHAPE_POINT,
} from '@/components/map/useMapLayers';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  useState<string>();
  const previousHoveredFeatureId = useRef<string>();
  const previousHoveredFeatureSource = useRef<string>();

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
          // What did we click on?

          if (
            [
              BUILDINGS_LAYER_POINT,
              BUILDINGS_LAYER_SHAPE_BORDER,
              BUILDINGS_LAYER_SHAPE_POINT,
            ].includes(featureCloseToCursor.layer.id)
          ) {
            // It is a building
            const rnb_id = featureCloseToCursor.properties.rnb_id;
            dispatch(Actions.map.selectBuilding(rnb_id));
          }

          if (featureCloseToCursor.layer.id === 'adscircle') {
            // It is an ADS
            const file_number = featureCloseToCursor.properties.file_number;
            dispatch(Actions.map.selectADS(file_number));
          }
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

        if (
          previousHoveredFeatureId.current &&
          previousHoveredFeatureSource.current
        ) {
          map.setFeatureState(
            {
              source: previousHoveredFeatureSource.current,
              id: previousHoveredFeatureId.current,
              sourceLayer: 'default',
            },
            { hovered: false },
          );
        }

        if (featureCloseToCursor) {
          map.setFeatureState(
            {
              source: featureCloseToCursor.layer.source,
              id: featureCloseToCursor?.id,
              sourceLayer: 'default',
            },
            { hovered: true },
          );

          previousHoveredFeatureId.current = featureCloseToCursor?.id as string;
          previousHoveredFeatureSource.current = featureCloseToCursor?.layer
            .source as string;
        }
      });
    }
  }, [dispatch, map]);
};
