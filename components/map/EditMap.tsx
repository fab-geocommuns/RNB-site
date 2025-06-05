'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useMap } from '@/components/map/useMap';
import { useMapLayers } from '@/components/map/useMapLayers';
import { useMapControls } from '@/components/map/useMapControls';
import { useEditionMapEvents } from '@/components/map/useEditionMapEvents';
import { useMapSyncCoordinates } from '@/components/map/useMapSyncCoordinates';
import { useMapStateSync } from '@/components/map/useMapStateSync';
import {
  MapLayer,
  MapBackgroundLayer,
  MapBuildingsLayer,
} from '@/stores/map/map-slice';
import { useMapEditBuildingShape } from '@/components/map/useMapEditBuildingShape';
import { useMapStateSyncSelectedBuilding } from '@/components/map/useMapStateSyncSelectedBuilding';
import { useMapStateSyncSelectedBuildingsForMerge } from '@/components/map/useMapStateSyncSelectedBuildingsForMerge';

type Props = {
  disabledLayers?: MapLayer[];
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
};

export default function EditMap({
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
  useMapSyncCoordinates(map);
  useEditionMapEvents(map);
  useMapStateSync(map);
  useMapEditBuildingShape(map);
  useMapStateSyncSelectedBuilding(map);
  useMapStateSyncSelectedBuildingsForMerge(map);
  return mapContainer;
}
