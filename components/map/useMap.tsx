import maplibregl from 'maplibre-gl';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from '@/styles/mapComp.module.scss';
import { DEFAULT_STYLE } from '@/components/map/useMapLayers';

/**
 * Création de la carte MapLibre
 */
export const useMap = () => {
  const [map, setMap] = useState<maplibregl.Map>();
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Composant conteneur de la carte
  const mapContainer = useMemo(
    () => <div className={styles.map} ref={mapContainerRef} />,
    [],
  );

  // Initialisation de la carte
  useEffect(() => {
    if (
      !!mapContainerRef.current &&
      !mapContainerRef.current.classList.contains('maplibregl-map')
    ) {
      mapContainerRef.current.style.opacity = '0';

      const newMap: maplibregl.Map = new maplibregl.Map({
        container: mapContainerRef.current,
        center: [2.852577494863663, 46.820936580547134],
        zoom: 5,
        attributionControl: false,
        style: DEFAULT_STYLE,
      });

      newMap.once('load', () => {
        newMap.resize();
        mapContainerRef.current!.style.opacity = '1';
      });

      setMap(newMap);
    }
  }, []);

  return {
    map,
    mapContainer,
  };
};
