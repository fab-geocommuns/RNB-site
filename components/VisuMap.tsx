'use client'

import React, { useRef, useEffect, useContext } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import vector from '@/components/mapstyles/vector.json'
import satellitle from '@/components/mapstyles/satellite.json'
import { MapContext } from '@/components/MapContext'
import MapStyleSwitcherControl from '@/components/MapStyleSwitcher';
import { fr } from "@codegouvfr/react-dsfr";

// Bus
import Bus from '@/utils/Bus';
import { log } from 'console';

export default function VisuMap() {

  
  const tilesUrl = process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf'
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  const clickedIdentifier = useRef(null)
  
  const addressMarker = useRef(null)

  // Map context
  const [mapCtx, setMapCtx] = useContext(MapContext)
  const mapCtxCopy = useRef(mapCtx)

  
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

    // Style switcher
    const styleSwitcher = new MapStyleSwitcherControl({
      styles: STYLES,
      chosenStyle: 'vector',
      icon: fr.cx("fr-icon-road-map-line")
    })
    map.current.addControl(styleSwitcher, 'top-left')

  }

  const initMapEvents = () => {

    

    map.current.on('click', 'bdgs', function (e) {

      
      if (e.features.length > 0) {
        setBdgInPanel(e.features[0].properties.rnb_id)
      }

    });

  }

  const setBdgInPanel = (rnb_id) => {

    // ## Change map point state
    if (clickedIdentifier.current !== null) {
      map.current.setFeatureState(
        { source: 'bdgtiles', id: clickedIdentifier.current, sourceLayer: "default" },
        { in_panel: false }
      );
    }
    

    // then, the new one
    map.current.setFeatureState(
      { source: 'bdgtiles', id: rnb_id, sourceLayer: "default" },
      { in_panel: true }
    );

    // Register this identifier as clicked
    clickedIdentifier.current = rnb_id

    // Emit the info
    Bus.emit('map:bdgclick', rnb_id)


  }

  const jumpToPosition = (position) => {

    map.current.flyTo({
      center: position.center,
      zoom: position.zoom
    })


  }

  const initDataLayer = () => {



    map.current.on('style.load', () => {


      console.log('add source and layer')
      map.current.addSource('bdgtiles', {
        type: "vector",
        tiles: [
          tilesUrl
        ],
        minzoom: 16,
        maxzoom: 22,
        promoteId: 'rnb_id'
      })
      map.current.addLayer({
        id: "bdgs",
        type: "circle",
        source: "bdgtiles",
        "source-layer": "default",
        paint: {
          'circle-radius': 5,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 3,
          "circle-color": [
            "case",
            ["boolean", ["feature-state", "in_panel"], false],
            '#31e060',
            '#1452e3'
          ]
        }
        
      })


      

      //initFeaturesState()

    });

  }

  // const initFeaturesState = () => {

  //   bdgs.current.forEach(bdg => {

  //     const in_panel = (mapCtx.data.panel_bdg && mapCtx.data.panel_bdg.rnb_id == bdg.rnb_id) ? true : false


  //     map.current.setFeatureState(
  //       { source: 'bdgs', id: bdg.rnb_id },
  //       { in_panel: in_panel }
  //     );
  //   })


  // }

  useEffect(() => {

    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        center: [2.852577494863663, 46.820936580547134],
        zoom: 5
      });


      initMapControls();
      initMapEvents();
      initDataLayer();

    }
  });

  const buildAddresseMarker = (position) => {

    if (addressMarker.current) {
      if (addressMarker.current instanceof maplibregl.Marker) {
        addressMarker.current.remove();
      }
    }
    

    addressMarker.current = new maplibregl.Marker({
      color: "#1452e3",
      draggable: false
    }).setLngLat(position.center)

    addressMarker.current.addTo(map.current);

  }

  // Manage copy of mapCtx
  useEffect(() => {
    mapCtxCopy.current = mapCtx 
  }, [mapCtx]);


  useEffect(() => {

    if (mapCtxCopy.current.data.position) {

      if (mapCtx.data.position.center) {
        buildAddresseMarker(mapCtxCopy.current.data.position)
      }
      if (mapCtx.data.position.center && mapCtx.data.position.zoom) {
        jumpToPosition(mapCtxCopy.current.data.position)
      }


//      prevMapPosition.current = mapCtx.data.position

    }

  }, [mapCtxCopy.current.data.position.center, mapCtxCopy.current.data.position.zoom]);

  

  return (
    <>
      <div style={{ width: '100%', height: '100%' }} ref={mapContainer} />
    </>

  );


}