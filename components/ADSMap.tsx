'use client'

import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { log } from 'console';

export default function ADSMap({bdgsOps = [] }) {

    const bdgSearchUrl = process.env.NEXT_PUBLIC_API_BASE + '/buildings/'
    
    const minZoom = 16
    const mapContainer = useRef(null);

    let map = null;
    let bdgs = []


    const initMapEvents = () => {

        map.on('moveend', () => {
            newQuery()
        });

    }

    const newQuery = () => {

        // Reset bdgs
        bdgs = []

        let prom = launchQuery()

        prom.then(() => {

            const geojson = convertBdgToGeojson();
            map.getSource('bdgs').setData(geojson);

        })

    }

    const convertBdgToGeojson = () => {

        let geojson = {
            "type": "FeatureCollection",
            "features": []
          }
        
          bdgs.forEach(bdg => {
        
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

    const initDataLayer = () => {

        map.on('style.load', () => {

            console.log('map is loaded')
      
            map.addSource('bdgs', {
              type: 'geojson',
              data: convertBdgToGeojson(),
              promoteId: 'rnb_id'
            });
          
            map.addLayer({
              id: 'bdgs',
              type: 'circle',
              source: 'bdgs',
              paint: {
                'circle-radius': 4,
                'circle-color': [
                  'match',
                  ['get', 'operation'],
                    'build',
                    '#f72585',
                    'modify',
                    '#7209b7',
                    'demolish',
                    '#3a0ca3',
                    '#0f4c5c'
                ]
              }})
          
          });

    }

    const launchQuery = () => {

        const firstUrl = getFirstUrl()

        return new Promise((resolve, reject) => {
    
            if (map.getZoom() < minZoom) {
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
        
              bdgs = bdgs.concat(data.results);
        
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

    const getFirstUrl = ():URL => {

        const bbox = map.getBounds();
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

        map.addControl(controls, 'top-right')

    }

    useEffect(() => {
        if (map) return; // map already initialized

        map = new maplibregl.Map({
            container: mapContainer.current,
            style: 'https://api.maptiler.com/maps/bright-v2/style.json?key=k5TGaasSmJpsWugdpmtP',
            center: [5.726183005054572, 45.18272088002974],
            zoom: 15
        });

        initMapControls();
        initMapEvents();
        initDataLayer();

    }, []);

    return (
        <div style={{ width: '800px', height: '400px' }} ref={mapContainer} />
    );
};


