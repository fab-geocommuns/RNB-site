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
  MapExtraLayer,
} from '@/stores/map/map-slice';

type Props = {
  disabledLayers?: MapLayer[];
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
  defaultExtraLayers?: MapExtraLayer[];
};

export default function VisuMap({
  disabledLayers,
  defaultBackgroundLayer,
  defaultBuildingLayer,
  defaultExtraLayers,
}: Props) {
  const { map, mapContainer } = useMap({ disabledLayers });
  useMapLayers({
    map,
    defaultBackgroundLayer,
    defaultBuildingLayer,
    defaultExtraLayers,
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
