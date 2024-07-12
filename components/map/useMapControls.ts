import maplibregl from 'maplibre-gl';
import { useEffect } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import MapStyleSwitcherControl from '@/components/map/MapStyleSwitcher';
import { STYLES } from '@/components/map/useMapLayers';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
  requestPermission?: () => Promise<'granted' | 'denied'>;
  webkitCompassHeading?: number;
}

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

      // Style switcher
      map.addControl(
        new MapStyleSwitcherControl({
          styles: STYLES,
          chosenStyle: 'vector',
          icon: fr.cx('fr-icon-road-map-line'),
        }),
        'bottom-right',
      );

      // Zoom
      map.addControl(
        new maplibregl.NavigationControl({
          showCompass: false,
          showZoom: true,
        }),
        'bottom-right',
      );

      // Geo localisation
      const handleOrientation = (event: DeviceOrientationEventiOS) => {
        let alpha = event.alpha || 0; // Angle en degrés autour de l'axe Z (boussole)
        if (alpha !== null) {
          // Pour obtenir une orientation précise par rapport au Nord, nous devons
          // prendre en compte la boussole et les corrections nécessaires.
          if (event.webkitCompassHeading) {
            // Pour les appareils iOS
            alpha = event.webkitCompassHeading;
          } else {
            // Pour les autres appareils, inverser alpha
            alpha = 360 - alpha;
          }
          map.setBearing(alpha, {
            geolocateSource: true, // Empêche certains événements internes au composant qui désactivent le tracking de l'utilisateur
          });
        }
      };
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
      geolocControl.on('trackuserlocationstart', () => {
        // iOS 13+: demande de droits
        const DeviceEvent =
          DeviceMotionEvent as unknown as DeviceOrientationEventiOS;
        if (typeof DeviceEvent.requestPermission === 'function') {
          DeviceEvent.requestPermission()
            .then((state) => {
              if (state === 'granted') {
                window.addEventListener(
                  'deviceorientation',
                  handleOrientation,
                  true,
                );
              }
            })
            .catch(console.error);
        } else {
          window.addEventListener('deviceorientation', handleOrientation, true);
        }
      });
      geolocControl.on('trackuserlocationend', () => {
        window.removeEventListener(
          'deviceorientation',
          handleOrientation,
          true,
        );
      });
      map.addControl(geolocControl, 'bottom-right');
    }
  }, [map]);
};
