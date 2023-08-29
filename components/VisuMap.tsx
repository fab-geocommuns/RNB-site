'use client'

// Style
import { fr } from "@codegouvfr/react-dsfr";
import 'maplibre-gl/dist/maplibre-gl.css';

// Map style
import vector from '@/components/mapstyles/vector.json'
import satellitle from '@/components/mapstyles/satellite.json'

// Comps
import maplibregl from 'maplibre-gl';
import MapStyleSwitcherControl from '@/components/MapStyleSwitcher';

// Hooks
import React, { useRef, useEffect } from 'react';

// Store
import { useDispatch, useSelector } from "react-redux";
import { fetchBdg } from "@/stores/map/slice";

export default function VisuMap() {


  // Store
  const dispatch = useDispatch()
  const stateMoveTo = useSelector((state) => state.moveTo)
  const stateMarker = useSelector((state) => state.marker)

  // Marker
  const marker = useRef(null)
  
  // Buildings tiles
  const tilesUrl = process.env.NEXT_PUBLIC_API_BASE + '/tiles/{x}/{y}/{z}.pbf'
  
  // Map container and object
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // Clicked identifier
  const clickedIdentifier = useRef(null)
  
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
    
    // Dispatch to store
    dispatch(fetchBdg(rnb_id))


  }

  const jumpToPosition = (position) => {

    map.current.flyTo({
      center: [position.lng, position.lat],
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


      

    });

  }

  const buildMarker = (stateMarker) => {


    if (marker.current) {
      if (marker.current instanceof maplibregl.Marker) {
        marker.current.remove();
      }
    }

    if (stateMarker.lat != null && stateMarker.lng != null) {
      
      marker.current = new maplibregl.Marker({
        color: "#1452e3",
        draggable: false
      }).setLngLat([stateMarker.lng, stateMarker.lat])
  
      marker.current.addTo(map.current);

    }
  

  }

  
  // //////////////////
  // Init the map once
  // //////////////////
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

  // //////////////////
  // Move the map on demand
  // //////////////////
  useEffect(() => {
    if (stateMoveTo.lat != null && 
      stateMoveTo.lng != null && 
      stateMoveTo.zoom != null) {

      jumpToPosition(stateMoveTo)

    }

  }, [stateMoveTo])


  // //////////////////
  // Add/remove/change the marker on demand
  // //////////////////
  useEffect(() => {

    buildMarker(stateMarker)

  }, [stateMarker])
  

  return (
    <>
      <div style={{ width: '100%', height: '100%' }} ref={mapContainer} />
    </>

  );


}