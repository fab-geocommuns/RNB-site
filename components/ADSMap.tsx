'use client'

import React, { useRef, useEffect, useContext, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AdsContext } from './AdsContext';
import styles from './ADSMap.module.css'
import vector from '@/components/mapstyles/vector.json'
import { MapContext } from '@/components/MapContext'
import satellitle from '@/components/mapstyles/satellite.json'
import MapStyleSwitcherControl from '@/components/MapStyleSwitcher';
import { fr } from "@codegouvfr/react-dsfr";

export default function ADSMap() {

  const [ads, setAds] = useContext(AdsContext)

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
      style: satellitle
    }

  }


  const initMapEvents = () => {

    map.current.on('moveend', () => {
      newQuery()
    });

    map.current.on('click', 'bdgs', function (e) {

      if (ads.isEditingNewBdg()) {
        return;
      }

      const identifier = e.features[0].properties.identifier
      

      if (ads.hasIdentifier(identifier)) {
          // We can remove both new and existing bdg
          ads.removeIdentifier(identifier)
      } else {
          // We can only add existing bdg
          const rnb_id = e.features[0].properties.rnb_id
          ads.addExistingBdg(rnb_id)
      }

      setAds(ads.clone())      

    });

    map.current.on('click', function (e) {

      if (ads.isEditingNewBdg()) {

        const lngLat = e.lngLat

        ads.updateNewBdgLngLat(lngLat.lng, lngLat.lat)
        setAds(ads.clone())


      }

    });

  }



  const newQuery = () => {

    // Reset bdgs
    bdgs.current = []

    let prom = launchQuery()

    prom.then(() => {
      map.current.getSource('bdgs').setData(convertBdgToGeojson())
    })

  }

  const convertBdgToGeojson = () => {

    let geojson = {
      "type": "FeatureCollection",
      "features": []
    }

    // Add bdgs from the query
    bdgs.current.forEach(bdg => {

      const operation = getBdgOperation(bdg.rnb_id)

      const feature = {
        type: "Feature",
        geometry: bdg.point,
        properties: {
          rnb_id: bdg.rnb_id,
          identifier: bdg.rnb_id,
          operation: operation
        }
      }

      geojson.features.push(feature)

    });

    // Add bdgs from the state
    ads.newBdgOps.forEach(bdgOp => {

      const feature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [bdgOp.building.lng, bdgOp.building.lat]
        },
        properties: {
          rnb_id: bdgOp.building.rnb_id,
          identifier: bdgOp.building.identifier,
          operation: bdgOp.operation
      }
    }

    geojson.features.push(feature)

    });


    return geojson;


  }

  const getBdgOperation = (rnb_id: string) => {

    const bdgOp = ads.ops.find(bdgOp => bdgOp.building.rnb_id === rnb_id)

    if (bdgOp) {
      return bdgOp.operation
    } else {
      return null
    }

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
          'circle-radius': 4,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1,
          "circle-color": [
            'match',
            ['get', 'operation'],
            'build',
            '#3bea7e',
            'modify',
            '#0078f3',
            'demolish',
            '#e1000f',
            '#aaaaaa'
          ]
        }
      })



    });

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

  const getFirstUrl = (): URL => {

    const bbox = map.current.getBounds();
    const bbox_nw = bbox.getNorthWest();
    const bbox_se = bbox.getSouthEast();

    const bb_param = `${bbox_nw.lat},${bbox_nw.lng},${bbox_se.lat},${bbox_se.lng}`

    let queryUrl = new URL(bdgSearchUrl);
    queryUrl.searchParams.append('bb', bb_param);

    return queryUrl;


  }

  const initMapControls = () => {

    const controls = new maplibregl.NavigationControl({
      showCompass: false,
      showZoom: true
    })

    map.current.addControl(controls, 'bottom-right')


    const styleSwitcher = new MapStyleSwitcherControl({
      styles: STYLES,
      chosenStyle: 'vector',
      icon: fr.cx("fr-icon-road-map-line")
    })
    map.current.addControl(styleSwitcher, 'bottom-left')

  }

  const fitOnOperations = () => {

    if (ads.ops && ads.ops.length > 0) {

      let bounds = new maplibregl.LngLatBounds();
      ads.ops.forEach(bdgOp => {
        bounds.extend([bdgOp.building.lng, bdgOp.building.lat])
      })
      map.current.fitBounds(bounds, { padding: 100, linear: true })

    }
  }

  useEffect(() => {

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://api.maptiler.com/maps/bright-v2/style.json?key=k5TGaasSmJpsWugdpmtP',
        center: [5.366093814439828, 45.871081537689264],
        zoom: 15
      });

      fitOnOperations();
      initMapControls();
      initMapEvents();
      initDataLayer();

    }

  });

  const jumpToPosition = (position) => {


      console.log('jump to position', position)

    if (mapCtx.data.position.zoom && mapCtx.data.position.center) {
      map.current.flyTo({
        center: position.center,
        zoom: position.zoom
      })
    }

    


  }

  useEffect(function () {

    if (map.current) {
      const source = map.current.getSource('bdgs')
      if (source) {
        source.setData(convertBdgToGeojson())
      }
    }
  })

  useEffect(() => {


    console.log('mapCtx.data.position', mapCtx.data.position)
    if (mapCtx.data.position) {

      
        jumpToPosition(mapCtx.data.position)
      
    }

  }, [mapCtx.data.position]);






  return (
    <>
      <div className={styles.mapShell} ref={mapContainer} />
    </>

  );
};


