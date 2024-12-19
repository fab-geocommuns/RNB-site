'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useMap } from '@/components/map/useMap';
import { useMapLayers } from '@/components/map/useMapLayers';
import { useMapControls } from '@/components/map/useMapControls';
import { useMapEvents } from '@/components/map/useMapEvents';
import { useMapStateSync } from '@/components/map/useMapStateSync';
import { useMapDraw } from '@/components/map/useMapDraw';

export default function VisuMap() {
  const { map, mapContainer } = useMap();
  useMapLayers(map);
  useMapControls(map);
  useMapEvents(map);
  useMapStateSync(map);
  useMapDraw(map);

  return mapContainer;
}
