'use client'

import React, { useRef, useEffect, useContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import vector from './styles/vector.json'
import {MapContext} from '@/components/MapContext'

export default function VisuMap() {

    const bdgSearchUrl = process.env.NEXT_PUBLIC_API_BASE + '/buildings/'
    const minZoom = 16
    const mapContainer = useRef(null);
    const map = useRef(null);
    const bdgs = useRef([])

    const [mapCtx, setMapCtx] = useContext(MapContext)

    const STYLES = {
        vector,
        ortho: {
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

    const initMapControls = () => {

        // Zoom
        const navControl = new maplibregl.NavigationControl({
            showCompass: false,
            showZoom: true
        })
        map.current.addControl(navControl, 'top-right')

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
        map.current.addControl(geolocControl, 'top-right')

    }

    const initMapEvents = () => {

        map.current.on('moveend', () => {
            newQuery()
        });

        map.current.on('click', 'bdgs', function(e) {

          mapCtx.data.panel_bdg = e.features[0].properties
          setMapCtx(mapCtx.clone())

            //const rnb_id = e.features[0].properties.rnb_id
            // todo : display bdg detail
        
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

    const getFirstUrl = ():URL => {

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
                'circle-radius': 4,
                "circle-color": "#ff0000"
              }})

              
          
          });

    }

    useEffect(() => {

        if (!map.current) {
          map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: STYLES.ortho,
            center: [5.366093814439828, 45.871081537689264],
            zoom: 15
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