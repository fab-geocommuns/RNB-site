'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useMap } from '@/components/map/useMap';
import { useMapLayers } from '@/components/map/useMapLayers';
import { useMapControls } from '@/components/map/useMapControls';
import { useVisuMapEvents } from '@/components/map/useVisuMapEvents';
import { useEditionMapEvents } from '@/components/map/useEditionMapEvents';
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
};

export default function VisuMap({
  disabledLayers,
  defaultBackgroundLayer,
  defaultBuildingLayer,
}: Props) {
  const { map, mapContainer } = useMap({ disabledLayers });
  useMapLayers({
    map,
    defaultBackgroundLayer,
    defaultBuildingLayer,
    selectedBuildingisGreen: true,
  });
  useMapControls(map);
  useVisuMapEvents(map);
  useMapStateSync(map);

  return mapContainer;
}

export function EditMap({
  disabledLayers,
  defaultBackgroundLayer,
  defaultBuildingLayer,
}: Props) {
  const { map, mapContainer } = useMap({ disabledLayers });

  useMapLayers({
    map,
    defaultBackgroundLayer,
    defaultBuildingLayer,
    selectedBuildingisGreen: false,
  });

  useMapControls(map);
  useEditionMapEvents(map);
  useMapStateSync(map);
  useMapEditBuildingShape(map);
  return mapContainer;
}
