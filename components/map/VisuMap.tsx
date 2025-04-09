'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useMap } from '@/components/map/useMap';
import { useMapLayers } from '@/components/map/useMapLayers';
import { useMapControls } from '@/components/map/useMapControls';
import { useMapEvents } from '@/components/map/useMapEvents';
import { useMapStateSync } from '@/components/map/useMapStateSync';
import {
  MapLayer,
  MapBackgroundLayer,
  MapBuildingsLayer,
} from '@/stores/map/map-slice';

type Props = {
  disabledLayers?: MapLayer[];
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
};

export default function VisuMap({
  disabledLayers,
  defaultBackgroundLayer,
  defaultBuildingLayer,
}: Props) {
  const { map, mapContainer } = useMap({ disabledLayers });
  useMapLayers(map, defaultBackgroundLayer, defaultBuildingLayer);
  useMapControls(map);
  useMapEvents(map);
  useMapStateSync(map);

  return mapContainer;
}
