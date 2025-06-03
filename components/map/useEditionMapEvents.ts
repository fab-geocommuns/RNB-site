import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent, MapLibreEvent } from 'maplibre-gl';
import {
  LAYER_BDGS_POINT,
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  LAYER_ADS_CIRCLE,
} from '@/components/map/useMapLayers';
import { selectBuildingAndSetOperationUpdate } from '@/stores/map/map-slice';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useEditionMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const previousHoveredFeatureId = useRef<string | undefined>(undefined);
  const previousHoveredFeatureSource = useRef<string | undefined>(undefined);
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.map.shapeInteractionMode,
  );

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      const handleClickEvent = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e.point.x,
          e.point.y,
          0,
        );

        if (shapeInteractionMode !== 'drawing') {
          if (featureCloseToCursor) {
            // What did we click on?
            if (
              [
                LAYER_BDGS_POINT,
                LAYER_BDGS_SHAPE_BORDER,
                LAYER_BDGS_SHAPE_POINT,
              ].includes(featureCloseToCursor.layer.id)
            ) {
              // It is a building
              const rnb_id = featureCloseToCursor.properties.rnb_id;
              dispatch(selectBuildingAndSetOperationUpdate(rnb_id));
            } else if (featureCloseToCursor.layer.id === LAYER_ADS_CIRCLE) {
              // It is an ADS
              const file_number = featureCloseToCursor.properties.file_number;
              dispatch(Actions.map.selectADS(file_number));
            }
          } else {
            // click out unselects the currently selected item
            dispatch(Actions.map.setOperation(null));
          }
        }
      };

      map.on('click', handleClickEvent);

      /////////////
      const handleMouseMove = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map!,
          e.point.x,
          e.point.y,
          0,
        );

        if (shapeInteractionMode === 'drawing') {
          map!.getCanvas().style.cursor = 'crosshair';
        } else if (featureCloseToCursor) {
          map!.getCanvas().style.cursor = 'pointer';
        } else {
          map!.getCanvas().style.cursor = '';
        }

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
      };
      // Évenement de déplacement du curseur: changement de pointeur si proche d'un bâtiment
      map.on('mousemove', handleMouseMove);

      return () => {
        map.off('click', handleClickEvent);
        map.off('mousemove', handleMouseMove);
      };
    }
  }, [dispatch, map, shapeInteractionMode]);
};
