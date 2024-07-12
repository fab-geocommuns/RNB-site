'use client';

// Style
import { fr } from '@codegouvfr/react-dsfr';
import 'maplibre-gl/dist/maplibre-gl.css';
import styles from '@/styles/mapComp.module.scss';

// Map style
import vector from '@/components/mapstyles/vector.json';
import satellitle from '@/components/mapstyles/satellite.json';

// Comps
import maplibregl from 'maplibre-gl';
import MapStyleSwitcherControl from '@/components/MapStyleSwitcher';

// Hooks
import React, { useRef, useEffect, useCallback } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { fetchBdg, openPanel } from '@/stores/map/slice';

export default function VisuMap() {
  // Store
  const dispatch = useDispatch();
  const stateMoveTo = useSelector((state) => state.moveTo);
  const stateMarker = useSelector((state) => state.marker);
  const panelBdg = useSelector((state) => state.panelBdg);
  const reloadBuildings = useSelector((state) => state.reloadBuildings);

  // Marker
  const marker = useRef(null);

  // Buildings tiles
  const tilesUrl = process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';

  // Map container and object
  const mapContainer = useRef(null);
  const map = useRef<maplibregl.Map>(null);

  // Clicked identifier
  const highlightedBdg = useRef(null);

  const STYLES = {
    vector: {
      name: 'Plan',
      style: vector,
    },

    satellite: {
      name: 'Satellite',
      style: satellitle,
    },
  };

  const initMapControls = () => {
    // Attribution
    const attributionControl = new maplibregl.AttributionControl({
      compact: false,
    });
    map.current.addControl(attributionControl, 'bottom-right');

    // Style switcher
    const styleSwitcher = new MapStyleSwitcherControl({
      styles: STYLES,
      chosenStyle: 'vector',
      icon: fr.cx('fr-icon-road-map-line'),
    });
    map.current.addControl(styleSwitcher, 'bottom-right');

    // Zoom
    const navControl = new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true,
    });

    map.current.addControl(navControl, 'bottom-right');
    // Geoloc
    const handleOrientation = (event: DeviceOrientationEvent) => {
      let alpha = event.alpha; // Angle en degrés autour de l'axe Z (boussole)
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

        map.current.setBearing(alpha, {
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
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then((state: string) => {
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
      window.removeEventListener('deviceorientation', handleOrientation, true);
    });
    map.current.addControl(geolocControl, 'bottom-right');
  };

  const initMapEvents = async () => {
    map.current.on('click', async function (e) {
      const buffer = 15;
      const bbox = [
        [e.point.x - buffer, e.point.y - buffer],
        [e.point.x + buffer, e.point.y + buffer],
      ];

      // Rechercher les features de la couche 'bdgs' dans la zone de recherche
      const features = map.current.queryRenderedFeatures(bbox, {
        layers: ['bdgs'],
      });
      if (features.length > 0) {
        // Calculer la distance entre le point de clic et chaque feature
        let closestFeature = null;
        let minDistance = Infinity;

        features.forEach((feature) => {
          const featurePoint = map.current.project([
            feature.geometry.coordinates[0],
            feature.geometry.coordinates[1],
          ]);
          const distance = Math.sqrt(
            Math.pow(e.point.x - featurePoint.x, 2) +
              Math.pow(e.point.y - featurePoint.y, 2),
          );

          if (distance < minDistance) {
            minDistance = distance;
            closestFeature = feature;
          }
        });

        if (closestFeature) {
          const rnb_id = closestFeature.properties.rnb_id;

          // Mettre en surbrillance sur la carte
          highlightBdg(rnb_id);

          // Mettre à jour l'URL avec la query rnb_id
          window.history.replaceState({}, '', `?q=${rnb_id}`);

          // Dispatcher vers le store
          await dispatch(fetchBdg(rnb_id));
          dispatch(openPanel());
        }
      }
    });
  };

  const highlightBdg = (rnb_id) => {
    // ## Change map point state
    if (highlightedBdg.current !== null) {
      map.current.setFeatureState(
        {
          source: 'bdgtiles',
          id: highlightedBdg.current,
          sourceLayer: 'default',
        },
        { in_panel: false },
      );
    }

    // then, the new one
    map.current.setFeatureState(
      { source: 'bdgtiles', id: rnb_id, sourceLayer: 'default' },
      { in_panel: true },
    );

    // Register this identifier as clicked
    highlightedBdg.current = rnb_id;
  };

  const flyToPosition = (position) => {
    map.current.flyTo({
      center: [position.lng, position.lat],
      zoom: position.zoom,
    });
  };

  const jumpToPosition = (position) => {
    map.current.jumpTo({
      center: [position.lng, position.lat],
      zoom: position.zoom,
    });
  };

  const initDataLayer = useCallback(() => {
    if (map.current.getLayer('bdgs')) map.current.removeLayer('bdgs');
    if (map.current.getSource('bdgtiles')) map.current.removeSource('bdgtiles');

    map.current.addSource('bdgtiles', {
      type: 'vector',
      tiles: [tilesUrl + '#' + Math.random()],
      minzoom: 16,
      maxzoom: 22,
      promoteId: 'rnb_id',
    });
    map.current.addLayer({
      id: 'bdgs',
      type: 'circle',
      source: 'bdgtiles',
      'source-layer': 'default',
      paint: {
        'circle-radius': 5,
        'circle-stroke-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#ffffff',
          ['>', ['get', 'contributions'], 0],
          '#fef4f4',
          '#ffffff',
        ],
        'circle-stroke-width': 3,
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'in_panel'], false],
          '#31e060',
          ['>', ['get', 'contributions'], 0],
          '#FF732C',
          '#1452e3',
        ],
      },
    });
  }, [tilesUrl]);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) initDataLayer();
  }, [reloadBuildings, initDataLayer]);

  const buildMarker = (stateMarker) => {
    if (marker.current) {
      if (marker.current instanceof maplibregl.Marker) {
        marker.current.remove();
      }
    }

    if (stateMarker.lat != null && stateMarker.lng != null) {
      marker.current = new maplibregl.Marker({
        color: '#1452e3',
        draggable: false,
      }).setLngLat([stateMarker.lng, stateMarker.lat]);

      marker.current.addTo(map.current);
    }
  };

  // //////////////////
  // Init the map once
  // //////////////////
  useEffect(() => {
    if (!map.current) {
      mapContainer.current.style.opacity = '0';

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        center: [2.852577494863663, 46.820936580547134],
        zoom: 5,
        attributionControl: false,
      });

      map.current.once('load', () => {
        console.log('Map rendered');
        map.current.resize();
        mapContainer.current.style.opacity = '1';
      });

      initMapControls();
      initMapEvents();

      map.current.on('style.load', () => {
        initDataLayer();
      });
    }
  });

  // //////////////////
  // Move the map on demand
  // //////////////////
  useEffect(() => {
    if (
      stateMoveTo.lat != null &&
      stateMoveTo.lng != null &&
      stateMoveTo.zoom != null
    ) {
      if (stateMoveTo.fly) {
        flyToPosition(stateMoveTo);
      } else {
        jumpToPosition(stateMoveTo);
      }
    }
  }, [stateMoveTo]);

  // //////////////////
  // Add/remove/change the marker on demand
  // //////////////////
  useEffect(() => {
    buildMarker(stateMarker);
  }, [stateMarker]);

  useEffect(() => {
    if (panelBdg != null) {
      highlightBdg(panelBdg.rnb_id);
    }
  }, [panelBdg]);

  return (
    <>
      <div className={styles.map} ref={mapContainer} />
    </>
  );
}
