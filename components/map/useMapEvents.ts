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

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  useState<string>();
  const previousHoveredFeatureId = useRef<string>();
  const previousHoveredFeatureSource = useRef<string>();
  const drawMode = useSelector((state: RootState) => state.map.drawMode);

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      const handleClickEvent = (e) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e.point.x,
          e.point.y,
        );

        if (featureCloseToCursor && drawMode !== 'draw_polygon') {
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
            dispatch(Actions.map.selectBuilding(rnb_id));
          }

          if (featureCloseToCursor.layer.id === LAYER_ADS_CIRCLE) {
            // It is an ADS
            const file_number = featureCloseToCursor.properties.file_number;
            dispatch(Actions.map.selectADS(file_number));
          }
        }
      };

      map.on('click', handleClickEvent);

      map.on('moveend', (e: MapLibreEvent<any>) => {
        const zoom = map.getZoom();
        const center = map.getCenter();
        const coordsQueryParam = `${center.lat.toFixed(5)},${center.lng.toFixed(5)},${zoom.toFixed(2)}`;
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('coords', coordsQueryParam);
        const newUrl = new URL(window.location.href);
        newUrl.search = queryParams.toString();
        window.history.replaceState({}, '', newUrl);
      });

      // Évenement de déplacement du curseur: changement de pointeur si proche d'un bâtiment
      map.on('mousemove', (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map!,
          e.point.x,
          e.point.y,
        );

        if (drawMode === 'draw_polygon') {
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
      });

      return () => {
        map.off('click', handleClickEvent);
      };
    }
  }, [dispatch, map, drawMode]);
};
