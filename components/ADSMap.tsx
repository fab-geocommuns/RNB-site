'use client';

// React tools
import React, { useRef, useEffect, useContext } from 'react';

// Contexts
import { AdsContext } from './AdsContext';
import { MapContext } from '@/components/MapContext';

// Styles (UI)
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import styles from './ADSMap.module.css';
import { fr } from '@codegouvfr/react-dsfr';

// Map Tools
import vector from '@/components/map/mapstyles/vector.json';
import satellitle from '@/components/map/mapstyles/satellite.json';

// Auth
import { useSession } from 'next-auth/react';

export default function ADSMap() {
  const [ads, setAds] = useContext(AdsContext);
  const adsCopy = useRef(ads); // dirty copy of ads state so we can use it in listeners

  const bdgSearchUrl =
    process.env.NEXT_PUBLIC_API_BASE + '/buildings/?from=site';

  const minZoom = 16;
  const mapContainer = useRef(null);
  const map = useRef(null);

  const bdgs = useRef([]);

  const [mapCtx, setMapCtx] = useContext(MapContext);

  const default_style = 'vector';
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

  // Session
  const { data: session, status } = useSession();
  const accessToken = useRef(session?.accessToken);

  const getBdgHoverCursor = () => {
    if (adsCopy.current.isEditingNewBdg()) {
      return 'crosshair';
    }
    return 'pointer';
  };

  const getMapCursor = () => {
    if (adsCopy.current.isEditingNewBdg()) {
      return 'crosshair';
    }
    return '';
  };

  const initMapEvents = () => {
    map.current.on('moveend', () => {
      newQuery();
    });

    map.current.on('mouseenter', 'bdgs', function () {
      map.current.getCanvas().style.cursor = getBdgHoverCursor();
    });

    map.current.on('mouseleave', 'bdgs', function () {
      map.current.getCanvas().style.cursor = getMapCursor();
    });

    map.current.on('click', 'bdgs', function (e) {
      if (adsCopy.current.isEditingNewBdg()) {
        return;
      }

      const identifier = e.features[0].properties.identifier;

      if (adsCopy.current.hasIdentifier(identifier)) {
        // We can remove both new and existing bdg
        adsCopy.current.removeIdentifier(identifier);
      } else {
        // We can only add existing bdg
        const rnb_id = e.features[0].properties.rnb_id;
        const coords = e.features[0].geometry.coordinates;
        adsCopy.current.addExistingBdg(rnb_id, coords[1], coords[0]);
      }

      const newads = adsCopy.current.clone();

      setAds(newads);
    });

    map.current.on('click', function (e) {
      if (adsCopy.current.isEditingNewBdg()) {
        const lngLat = e.lngLat;

        adsCopy.current.updateNewBdgLngLat(lngLat.lng, lngLat.lat);
        adsCopy.current.state.bdg_move = null;

        const newADS = adsCopy.current.clone();
        setAds(newADS);
      }
    });
  };

  const newQuery = () => {
    // Reset bdgs
    bdgs.current = [];

    let prom = launchQuery();

    prom.then(() => {
      map.current.getSource('bdgs').setData(convertBdgToGeojson());
    });
  };

  const convertBdgToGeojson = () => {
    let geojson = {
      type: 'FeatureCollection',
      features: [],
    };

    // Add bdgs from the query
    bdgs.current.forEach((bdg) => {
      const operation = getBdgOperation(bdg.rnb_id);

      const feature = {
        type: 'Feature',
        geometry: bdg.point,
        properties: {
          rnb_id: bdg.rnb_id,
          identifier: bdg.rnb_id,
          operation: operation,
        },
      };

      geojson.features.push(feature);
    });

    // Add new bdgs from the state
    adsCopy.current.newBdgOps.forEach((bdgOp) => {
      const feature = {
        type: 'Feature',
        geometry: bdgOp.building.geometry,
        properties: {
          rnb_id: bdgOp.building.rnb_id,
          identifier: bdgOp.building.identifier,
          operation: bdgOp.operation,
        },
      };

      geojson.features.push(feature);
    });

    return geojson;
  };

  const getBdgOperation = (rnb_id: string) => {
    const bdgOp = adsCopy.current.ops.find(
      (bdgOp) => bdgOp.building.rnb_id === rnb_id,
    );

    if (bdgOp) {
      return bdgOp.operation;
    } else {
      return null;
    }
  };

  const initDataLayer = () => {
    map.current.on('style.load', () => {
      map.current.addSource('bdgs', {
        type: 'geojson',
        data: convertBdgToGeojson(),
        promoteId: 'rnb_id',
      });

      map.current.addLayer({
        id: 'bdgs',
        type: 'circle',
        source: 'bdgs',
        paint: {
          'circle-radius': 5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          'circle-color': [
            'match',
            ['get', 'operation'],
            'build',
            '#3bea7e',
            'modify',
            '#0078f3',
            'demolish',
            '#e1000f',
            '#666666',
          ],
        },
      });
    });
  };

  const launchQuery = () => {
    const firstUrl = getFirstUrl();

    return new Promise((resolve, reject) => {
      if (map.current.getZoom() < minZoom) {
        // Zoom is too low
        resolve();
      } else {
        deepFetch(firstUrl)
          .then(() => {
            resolve();
          })
          .catch((error) => {
            reject(error);
          });
      }
    });
  };

  const deepFetch = (url: URL): Promise<void> => {
    console.log('deepFetch');
    console.log(url);

    return new Promise((resolve, reject) => {
      fetch(url.href, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Token ' + accessToken.current,
        },
      })
        .then((response) => response.json())
        .then((data) => {
          bdgs.current = [...bdgs.current, ...data.results];

          if (data.next) {
            const nextUrl = new URL(data.next);
            deepFetch(nextUrl).then(() => {
              resolve();
            });
          } else {
            resolve();
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  const getFirstUrl = (): URL => {
    const bbox = map.current.getBounds();
    const bbox_nw = bbox.getNorthWest();
    const bbox_se = bbox.getSouthEast();

    const bb_param = `${bbox_nw.lat},${bbox_nw.lng},${bbox_se.lat},${bbox_se.lng}`;

    let queryUrl = new URL(bdgSearchUrl);
    queryUrl.searchParams.append('bb', bb_param);
    queryUrl.searchParams.append('status', 'all');

    return queryUrl;
  };

  const initMapControls = () => {
    const controls = new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true,
    });

    map.current.addControl(controls, 'bottom-right');
  };

  const fitOnOperations = () => {
    if (ads.ops && ads.ops.length > 0) {
      let bounds = new maplibregl.LngLatBounds();
      ads.ops.forEach((bdgOp) => {
        bounds.extend([
          bdgOp.building.geometry.coordinates[0],
          bdgOp.building.geometry.coordinates[1],
        ]);
      });
      map.current.fitBounds(bounds, {
        padding: 100,
        linear: true,
        maxZoom: 20,
      });
    }
  };

  const jumpToPosition = (position) => {
    if (mapCtx.data.position.zoom && mapCtx.data.position.center) {
      map.current.flyTo({
        center: position.center,
        zoom: position.zoom,
      });
    }
  };

  useEffect(() => {
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style:
          'https://api.maptiler.com/maps/bright-v2/style.json?key=k5TGaasSmJpsWugdpmtP',
        center: [2.4330540504881846, 46.76956015861486],
        zoom: 4,
      });

      fitOnOperations();
      initMapControls();
      initMapEvents();
      initDataLayer();
    }
  });

  useEffect(function () {
    if (map.current) {
      const source = map.current.getSource('bdgs');
      if (source) {
        source.setData(convertBdgToGeojson());
      }
    }
  });

  useEffect(() => {
    if (mapCtx.data.position) {
      jumpToPosition(mapCtx.data.position);
    }
  }, [mapCtx.data.position]);

  useEffect(() => {
    map.current.getCanvas().style.cursor = getMapCursor();
  }, [ads.state.bdg_move]);

  // Manage a copy of the ADS to be used in the map events
  useEffect(() => {
    adsCopy.current = ads;
  }, [ads]);

  useEffect(() => {
    accessToken.current = session?.accessToken;
  }, [session]);

  return (
    <>
      <div className={styles.mapShell} ref={mapContainer}></div>
    </>
  );
}
