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
import { useMapDraw } from '@/components/map/useMapDraw';
import { useMapPolygonDraw } from '@/components/map/useMapPolygonDraw';
import { useMapSplitDraw } from '@/components/map/useMapSplitDraw';
import { useMapSplitChildren } from '@/components/map/useMapSplitChildren';
import { useMapStateSyncSelectedBuilding } from '@/components/map/useMapStateSyncSelectedBuilding';
import { useMapStateSyncSelectedBuildingsForMerge } from '@/components/map/useMapStateSyncSelectedBuildingsForMerge';
import { useMapStateSyncReport } from '@/components/map/report/useMapStateSyncReport';
import { useMapPointer } from '@/components/map/useMapPointer';

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

  // draw plugin
  const drawRef = useMapDraw(map);
  useMapPolygonDraw(map, drawRef);
  useMapSplitDraw(map, drawRef);

  useMapSplitChildren(map);
  useMapStateSyncSelectedBuilding(map);
  useMapStateSyncSelectedBuildingsForMerge(map);
  useMapStateSyncReport(map);
  useMapPointer(map);
  return mapContainer;
}
