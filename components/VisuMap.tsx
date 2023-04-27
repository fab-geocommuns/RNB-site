'use client'

import React, { useRef, useEffect, useContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import vector from './styles/vector.json'
import { MapContext } from '@/components/MapContext'
import MapStyleSwitcherControl from '@/components/MapStyleSwitcher';
import { fr } from "@codegouvfr/react-dsfr";

export default function VisuMap() {

  const bdgSearchUrl = process.env.NEXT_PUBLIC_API_BASE + '/buildings/'
  const minZoom = 16
  const mapContainer = useRef(null);
  const map = useRef(null);
  const bdgs = useRef([])

  const [mapCtx, setMapCtx] = useContext(MapContext)

  const default_style = 'vector'
  const STYLES = {

    vector: {
      name: "Plan",
      style: vector
    },

    satellite: {
      name: "Satellite",
      style: {
        version: 8,
        glyphs: 'https://orangemug.github.io/font-glyphs/glyphs/{fontstack}/{range}.pbf',
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: ['https://wxs.ign.fr/essentiels/geoportail/wmts?layer=ORTHOIMAGERY.ORTHOPHOTOS&style=normal&tilematrixset=PM&Service=WMTS&Request=GetTile&Version=1.0.0&Format=image%2Fjpeg&TileMatrix={z}&TileCol={x}&TileRow={y}'],
            tileSize: 256,
            attribution: '<a target="_blank" href="https://geoservices.ign.fr/documentation/donnees/ortho/bdortho" /> © IGN </a>'
          }
        },
        layers: [{
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles'
        }]
      }
    }

  }

  const initMapControls = () => {

    // Zoom
    const navControl = new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true
    })
    map.current.addControl(navControl, 'top-right')

    // Style switcher
    const styleSwitcher = new MapStyleSwitcherControl({
      styles: STYLES,
      chosenStyle: 'vector',
      icon: fr.cx("fr-icon-road-map-line")
    })
    map.current.addControl(styleSwitcher, 'top-left')

    // Geoloc
    const geolocControl = new maplibregl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: true,
      fitBoundsOptions: {
        maxZoom: 18
      }
    })
    map.current.addControl(geolocControl, 'top-left')



  }

  const initMapEvents = () => {

    map.current.on('moveend', () => {
      newQuery()
    });

    map.current.on('click', 'bdgs', function (e) {

      if (e.features.length > 0) {
        setBdgInPanel(e.features[0].properties)
      }

    });

  }

  const setBdgInPanel = (bdg) => {

    // ## Change map point state

    // first, the old one
    if (mapCtx.data.panel_bdg) {
      map.current.setFeatureState(
        { source: 'bdgs', id: mapCtx.data.panel_bdg.rnb_id },
        { in_panel: false }
      );
    }

    // then, the new one
    map.current.setFeatureState(
      { source: 'bdgs', id: bdg.rnb_id },
      { in_panel: true }
    );

    // ## Change the context

    mapCtx.data.panel_bdg = bdg
    setMapCtx(mapCtx.clone())


  }

  const deepFetch = (url: URL): Promise<void> => {

    return new Promise((resolve, reject) => {

      fetch(url.href)
        .then(response => response.json())
        .then(data => {

          bdgs.current = [...bdgs.current, ...data.results]



          if (data.next) {
            const nextUrl = new URL(data.next);
            deepFetch(nextUrl).then(() => {
              resolve();
            })
          } else {
            resolve();
          }

        }).catch(error => {
          reject(error);
        })


    })

  }

  const newQuery = () => {

    // Reset bdgs
    bdgs.current = []

    let prom = launchQuery()

    prom.then(() => {
      calcBdgSource()
    })

  }

  const calcBdgSource = () => {

    map.current.getSource('bdgs').setData(convertBdgToGeojson())



  }

  const convertBdgToGeojson = () => {

    console.log('convertBdgToGeojson')

    let geojson = {
      "type": "FeatureCollection",
      "features": []
    }

    bdgs.current.forEach(bdg => {

      const feature = {
        type: "Feature",
        geometry: bdg.point,
        properties: {
          rnb_id: bdg.rnb_id,
          source: bdg.source,
          addresses: bdg.addresses
        }
      }

      geojson.features.push(feature)

    });

    return geojson;


  }

  const getFirstUrl = (): URL => {

    const bbox = map.current.getBounds();
    const bbox_nw = bbox.getNorthWest();
    const bbox_se = bbox.getSouthEast();

    const bb_param = `${bbox_nw.lat},${bbox_nw.lng},${bbox_se.lat},${bbox_se.lng}`

    let queryUrl = new URL(bdgSearchUrl);
    queryUrl.searchParams.append('bb', bb_param);

    return queryUrl;


  }

  const launchQuery = () => {

    const firstUrl = getFirstUrl()

    return new Promise((resolve, reject) => {

      if (map.current.getZoom() < minZoom) {
        // Zoom is too low
        resolve();
      } else {

        deepFetch(firstUrl).then(() => {
          resolve();
        }).catch(error => {
          reject(error)
        })

      };


    });

  }

  const jumpToFeature = (feature) => {

    let zoom = 17

    if (feature.properties.type == "municipality") {
      zoom = 13
    }
    if (feature.properties.type == "housenumber") {
      zoom = 18
    }

    map.current.flyTo({
      center: feature.geometry.coordinates,
      zoom: zoom
    })


  }

  const initDataLayer = () => {



    map.current.on('style.load', () => {

      map.current.addSource('bdgs', {
        type: 'geojson',
        data: convertBdgToGeojson(),
        promoteId: 'rnb_id'
      });

      map.current.addLayer({
        id: 'bdgs',
        type: 'circle',
        source: 'bdgs',
        paint: {
          'circle-radius': 5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "in_panel"], false],
            '#31e060',
            '#1452e3'
          ]
        }
      })

      initFeaturesState()

    });

  }

  const initFeaturesState = () => {

    bdgs.current.forEach(bdg => {

      const in_panel = (mapCtx.data.panel_bdg && mapCtx.data.panel_bdg.rnb_id == bdg.rnb_id) ? true : false


      map.current.setFeatureState(
        { source: 'bdgs', id: bdg.rnb_id },
        { in_panel: in_panel }
      );
    })


  }

  useEffect(() => {

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        center: [2.852577494863663, 46.820936580547134],
        zoom: 5,
        //center: [5.72136679451732, 45.18198677999707],
        //zoom: 19

      });


      initMapControls();
      initMapEvents();
      initDataLayer();

    }
  });

  useEffect(() => {

    if (mapCtx.data.best_point) {
      jumpToFeature(mapCtx.data.best_point)
    }

  }, [mapCtx.data.best_point]);

  return (
    <>
      <div style={{ width: '100%', height: '100%' }} ref={mapContainer} />
    </>

  );


}