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
  MapExtraLayer,
} from '@/stores/map/map-slice';
import { useMapEditBuildingShape } from '@/components/map/useMapEditBuildingShape';
import { useMapStateSyncSelectedBuilding } from '@/components/map/useMapStateSyncSelectedBuilding';
import { useMapStateSyncSelectedBuildingsForMerge } from '@/components/map/useMapStateSyncSelectedBuildingsForMerge';
import { useMapStateSyncSelectedReport } from '@/components/map/report/useMapStateSyncSelectedReport';

type Props = {
  disabledLayers?: MapLayer[];
  defaultBackgroundLayer?: MapBackgroundLayer;
  defaultBuildingLayer?: MapBuildingsLayer;
  defaultExtraLayers?: MapExtraLayer[];
};

export default function EditMap({
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
  useEditionMapEvents(map);
  useMapStateSync(map);
  useMapEditBuildingShape(map);
  useMapStateSyncSelectedBuilding(map);
  useMapStateSyncSelectedBuildingsForMerge(map);
  useMapStateSyncSelectedReport(map);
  return mapContainer;
}
