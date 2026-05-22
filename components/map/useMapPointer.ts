import { RootState } from '@/stores/store';
import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';
import { useSelector, UseSelector } from 'react-redux';

/**
 * Gestion du curseur de la souris sur la carte
 * Gère lien entre le store et la map.
 * @param map
 */
export const useMapPointer = (map?: maplibregl.Map) => {
  const pointer = useSelector((state: RootState) => state.map.pointer);

  useEffect(() => {
    if (map) {
      map.getCanvas().style.cursor = pointer;
    }
  }, [map, pointer]);
};
