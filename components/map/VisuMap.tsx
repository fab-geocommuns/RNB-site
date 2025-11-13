'use client';

import 'maplibre-gl/dist/maplibre-gl.css';

import { useMap } from '@/components/map/useMap';
import { useMapLayers } from '@/components/map/useMapLayers';
import { useMapControls } from '@/components/map/useMapControls';
import { useVisuMapEvents } from '@/components/map/useVisuMapEvents';
import { useMapSyncCoordinates } from '@/components/map/useMapSyncCoordinates';
import { useMapStateSync } from '@/components/map/useMapStateSync';
import { useMapStateSyncSelectedBuilding } from '@/components/map/useMapStateSyncSelectedBuilding';
import { useMapStateSyncSelectedReport } from '@/components/map/report/useMapStateSyncSelectedReport';
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
  useMapLayers({
    map,
    defaultBackgroundLayer,
    defaultBuildingLayer,
    selectedBuildingisGreen: true,
  });
  useMapControls(map);
  useMapSyncCoordinates(map);
  useVisuMapEvents(map);
  useMapStateSync(map);
  useMapStateSyncSelectedBuilding(map);
  useMapStateSyncSelectedReport(map);

  return mapContainer;
}
