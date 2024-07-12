import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { BUILDINGS_SOURCE } from '@/components/map/useMapLayers';
import { RootState } from '@/stores/map/store';
import maplibregl from 'maplibre-gl';

/**
 * Gestion de la synchronisation entre la carte et le store Redux
 * @param map
 */
export const useMapStateSync = (map?: maplibregl.Map) => {
  const stateMoveTo = useSelector((state: RootState) => state.moveTo);
  const selectedBuildingId = useSelector(
    (state: RootState) => state.selectedBuilding?.rnb_id,
  );
  const marker = useSelector((state: RootState) => state.marker);
  const [currentMarker, setCurrentMarker] = useState<maplibregl.Marker>();
  const [previousHighlightedBuildingID, setPreviousHighlightedBuildingID] =
    useState<string>();

  // Initialisation de la synchronisation: moveTo
  useEffect(() => {
    if (
      stateMoveTo &&
      stateMoveTo.lat &&
      stateMoveTo.lng &&
      stateMoveTo.zoom &&
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

  // Initialisation de la synchronisation: selectedBuildingId
  useEffect(() => {
    if (map && map.getSource(BUILDINGS_SOURCE)) {
      if (previousHighlightedBuildingID) {
        map.setFeatureState(
          {
            source: BUILDINGS_SOURCE,
            id: previousHighlightedBuildingID,
            sourceLayer: 'default',
          },
          { in_panel: false },
        );
      }

      if (selectedBuildingId) {
        map.setFeatureState(
          {
            source: BUILDINGS_SOURCE,
            id: selectedBuildingId,
            sourceLayer: 'default',
          },
          { in_panel: true },
        );
      }

      setPreviousHighlightedBuildingID(selectedBuildingId);
    }
  }, [selectedBuildingId, map]);
};
