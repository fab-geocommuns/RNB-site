import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import MapStyleSwitcherControl from '@/components/map/MapStyleSwitcher';
import { STYLES } from '@/components/map/useMapLayers';
import { BuildingSourceSwitcherControl } from '@/components/map/BuildingSourceSwitcherControl';

/**
 * Ajout et gestion des controles de la carte
 * @param map
 */
export const useMapControls = (map?: maplibregl.Map) => {
  // Initialisation des controls
  useEffect(() => {
    if (map) {
      // Attribution
      map.addControl(
        new maplibregl.AttributionControl({
          compact: false,
        }),
        'bottom-right',
      );

      // Zoom
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: true,
          showZoom: true,
        }),
        'bottom-right',
      );

      const geolocControl = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
        showUserLocation: true,
        showAccuracyCircle: true,
        fitBoundsOptions: {
          maxZoom: 18,
          animate: false,
          duration: 0,
        },
      });

      map.addControl(geolocControl, 'bottom-right');
    }
  }, [map]);
};
