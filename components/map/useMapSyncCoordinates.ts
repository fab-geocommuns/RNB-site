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
export const useMapSyncCoordinates = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    if (map) {
      const handleMoveEnd = (e: MapLibreEvent<any>) => {
        const zoom = map.getZoom();
        const center = map.getCenter();
        dispatch(
          Actions.map.setMoveTo({
            lat: center.lat,
            lng: center.lng,
            zoom: zoom,
            fromMapEvent: true,
          }),
        );
        const coordsQueryParam = `${center.lat.toFixed(5)},${center.lng.toFixed(5)},${zoom.toFixed(2)}`;
        const queryParams = new URLSearchParams(window.location.search);
        queryParams.set('coords', coordsQueryParam);
        const newUrl = new URL(window.location.href);
        newUrl.search = queryParams.toString();
        window.history.replaceState({}, '', newUrl);
      };

      map.on('moveend', handleMoveEnd);

      return () => {
        map.off('moveend', handleMoveEnd);
      };
    }
  }, [map]);
};
