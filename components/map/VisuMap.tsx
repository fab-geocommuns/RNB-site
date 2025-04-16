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
import { useMapEditBuildingShape } from '@/components/map/useMapEditBuildingShape';

type Props = {
  disabledLayers?: MapLayer[];
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
  allowEditShape?: boolean;
};

export default function VisuMap({
  disabledLayers,
  defaultBackgroundLayer,
  defaultBuildingLayer,
  allowEditShape,
}: Props) {
  const { map, mapContainer } = useMap({ disabledLayers });
  useMapLayers(map, defaultBackgroundLayer, defaultBuildingLayer);
  useMapControls(map);
  useMapEvents(map);
  useMapStateSync(map);
  if (allowEditShape) useMapEditBuildingShape(map);

  return mapContainer;
}
