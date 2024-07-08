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
import React, { useRef, useEffect } from 'react';

// Store
import { useDispatch, useSelector } from 'react-redux';
import { fetchBdg, openPanel } from '@/stores/map/slice';

export default function VisuMap() {
  // Store
  const dispatch = useDispatch();
  const stateMoveTo = useSelector((state) => state.moveTo);
  const stateMarker = useSelector((state) => state.marker);
  const panelBdg = useSelector((state) => state.panelBdg);

  // Marker
  const marker = useRef(null);

  // Buildings tiles
  const tilesUrl = process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf';

  // Map container and object
  const mapContainer = useRef(null);
  const map = useRef(null);

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
    const geolocControl = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
      fitBoundsOptions: {
        maxZoom: 18,
      },
    });
    map.current.addControl(geolocControl, 'bottom-right');
  };

  const initMapEvents = async () => {
    map.current.on('click', 'bdgs', async function (e) {
      if (e.features.length > 0) {
        const rnb_id = e.features[0].properties.rnb_id;

        // Highlight it on the map
        highlightBdg(rnb_id);

        // update the url query with the rnb_id
        window.history.replaceState({}, '', `?q=${rnb_id}`);

        // Dispatch to store
        await dispatch(fetchBdg(rnb_id));
        dispatch(openPanel());
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

  const initDataLayer = () => {
    map.current.on('style.load', () => {
      map.current.addSource('bdgtiles', {
        type: 'vector',
        tiles: [tilesUrl],
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
    });
  };

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
      initDataLayer();

      // Ajoute la boussole
      map.current.addControl(
        new ToggleButtonControl(map.current),
        'bottom-right',
      );
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

class ToggleButtonControl {
  map: maplibregl.Map;
  container: HTMLDivElement;
  button: HTMLButtonElement;
  icon: HTMLSpanElement;
  compassActive = false;

  constructor(map: maplibregl.Map) {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className =
      styles.boussole +
      ' maplibregl-ctrl maplibregl-ctrl-group mapboxgl-ctrl mapboxgl-ctrl-group';
    this.button = document.createElement('button');
    this.button.className = 'maplibregl-ctrl-compass mapboxgl-ctrl-compass';
    this.button.id = 'compass';
    this.button.onclick = this.toggleCompass.bind(this);
    this.icon = document.createElement('span');
    this.icon.className = 'maplibregl-ctrl-icon mapboxgl-ctrl-icon';
    this.icon.setAttribute('style', 'transform: rotate(0deg);');
    this.button.appendChild(this.icon);
    this.container.appendChild(this.button);
  }

  onAdd() {
    return this.container;
  }

  onRemove() {
    this.container.parentNode!.removeChild(this.container);
  }

  toggleCompass() {
    this.compassActive = !this.compassActive;
    this.button.classList.toggle(styles.active);
    if (this.compassActive) {
      // iOS 13+: demande de droits
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
          .then((state: string) => {
            if (state === 'granted') {
              window.addEventListener(
                'deviceorientation',
                this.handleOrientation.bind(this),
                true,
              );
            } else {
              this.compassActive = !this.compassActive;
              this.button.classList.toggle(styles.active);
            }
          })
          .catch(console.error);
      } else {
        window.addEventListener(
          'deviceorientation',
          this.handleOrientation.bind(this),
          true,
        );
      }
    } else {
      window.removeEventListener(
        'deviceorientation',
        this.handleOrientation.bind(this),
        true,
      );
      this.map.setBearing(0);
    }
  }

  handleOrientation(event: DeviceOrientationEvent) {
    if (this.compassActive) {
      const alpha = event.alpha; // Angle en degrés autour de l'axe Z (boussole)
      if (alpha !== null) {
        this.map.setBearing(alpha);
        this.icon.setAttribute('style', 'transform: rotate(' + alpha + 'deg);');
      }
    }
  }
}
