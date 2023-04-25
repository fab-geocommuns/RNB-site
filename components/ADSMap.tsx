'use client'

import React, { useRef, useEffect, useContext, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AdsContext } from './AdsContext';
import { log } from 'console';

export default function ADSMap() {

    const [ads, setAds] = useContext(AdsContext)    

    const bdgSearchUrl = process.env.NEXT_PUBLIC_API_BASE + '/buildings/'
    
    const minZoom = 16
    const mapContainer = useRef(null);
    const map = useRef(null);
    
    const bdgs = useRef([])


    const initMapEvents = () => {

        map.current.on('moveend', () => {
            newQuery()
        });

        map.current.on('click', 'bdgs', function(e) {

            const rnb_id = e.features[0].properties.rnb_id

            ads.toggleRnbId(rnb_id)
            setAds(ads.clone())

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
        
          bdgs.current.forEach(bdg => {
        
            const operation = getBdgOperation(bdg.rnb_id)

            const feature = {
              type: "Feature",
              geometry: bdg.point,
              properties: {
                rnb_id: bdg.rnb_id,
                source: bdg.source,
                addresses: bdg.addresses,
                operation: operation
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
              }})

              
          
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

    const getFirstUrl = ():URL => {

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

        map.current.addControl(controls, 'top-right')

    }

    const fitOnOperations = () => {
            
            if (ads.ops && ads.ops.length > 0) {
    
                let bounds = new maplibregl.LngLatBounds();
                ads.ops.forEach(bdgOp => {
                    bounds.extend([bdgOp.building.lng, bdgOp.building.lat])
                })
                map.current.fitBounds(bounds, { padding: 50, linear: true })
    
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

     useEffect(function() {
    
      if (map.current) {

        const source = map.current.getSource('bdgs')

        if (source) {
          source.setData(convertBdgToGeojson())
        }

      }
      
        
     })



    

  
    return (
      <>
      <div style={{ width: '800px', height: '400px' }} ref={mapContainer} />
      </>
        
    );
};


