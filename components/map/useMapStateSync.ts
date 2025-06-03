import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import maplibregl from 'maplibre-gl';

/**
 * Gestion de la synchronisation entre la carte et le store Redux
 * @param map
 */
export const useMapStateSync = (map?: maplibregl.Map) => {
  const stateMoveTo = useSelector((state: RootState) => state.map.moveTo);

  // Address marker
  const marker = useSelector((state: RootState) => state.map.marker);
  const [currentMarker, setCurrentMarker] = useState<maplibregl.Marker>();

  // Initialisation de la synchronisation: moveTo
  useEffect(() => {
    if (
      stateMoveTo &&
      stateMoveTo.lat &&
      stateMoveTo.lng &&
      stateMoveTo.zoom &&
      stateMoveTo.fromMapEvent !== true &&
      map
    ) {
      const fn = stateMoveTo.fly ? 'flyTo' : 'jumpTo';
      map[fn]({
        center: [stateMoveTo.lng, stateMoveTo.lat],
        zoom: stateMoveTo.zoom,
      });
    }
  }, [map, stateMoveTo]);

  // Initialisation de la synchronisation: marker
  useEffect(() => {
    if (map) {
      if (currentMarker) {
        if (marker) {
          currentMarker.setLngLat(marker);
        } else {
          currentMarker.remove();
          setCurrentMarker(undefined);
        }
      } else if (marker) {
        const newMarker = new maplibregl.Marker({
          color: '#1452e3',
          draggable: false,
        }).setLngLat(marker);

        newMarker.addTo(map);
        setCurrentMarker(newMarker);
      }
    }
  }, [marker, map]);
};
