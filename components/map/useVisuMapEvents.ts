import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent } from 'maplibre-gl';
import {
  LAYER_BDGS_POINT,
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  LAYER_ADS_CIRCLE,
  LAYER_BAN_POINT,
  LAYER_BAN_TXT,
  LAYER_REPORTS_POINT,
  SRC_REPORTS,
} from '@/components/map/useMapLayers';
import { displayBANPopup } from './BanLayerEvent';
import { map } from 'yaml/dist/schema/common/map';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useVisuMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const previousHoveredFeatureId = useRef<string | undefined>(undefined);
  const previousHoveredFeatureSource = useRef<string | undefined>(undefined);

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      const handleClickEvent = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e,
          10,
        );

        console.log('Clicked feature:', featureCloseToCursor);

        if (featureCloseToCursor) {
          // What did we click on?

          if (
            [
              LAYER_BDGS_POINT,
              LAYER_BDGS_SHAPE_BORDER,
              LAYER_BDGS_SHAPE_POINT,
            ].includes(featureCloseToCursor.layer.id)
          ) {
            // It is a building
            const rnb_id = featureCloseToCursor.properties.rnb_id;
            dispatch(Actions.map.selectBuilding(rnb_id));
          }

          if (featureCloseToCursor.layer.id === LAYER_ADS_CIRCLE) {
            // It is an ADS
            const file_number = featureCloseToCursor.properties.file_number;
            dispatch(Actions.map.selectADS(file_number));
          }

          if (
            [LAYER_BAN_POINT, LAYER_BAN_TXT].includes(
              featureCloseToCursor.layer.id,
            )
          ) {
            displayBANPopup(map, featureCloseToCursor);
          }

          if (featureCloseToCursor.layer.id === LAYER_REPORTS_POINT) {
            const reportId = featureCloseToCursor.id as string | null;
            dispatch(Actions.report.selectReport(reportId));
          }
        }
      };

      map.on('click', handleClickEvent);

      /////////////
      const handleMouseMove = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map!,
          e,
          10,
        );
        handleFeatureHover(
          map!,
          previousHoveredFeatureId,
          previousHoveredFeatureSource,
          featureCloseToCursor,
        );
      };
      // Évenement de déplacement du curseur: changement de pointeur si proche d'un bâtiment
      map.on('mousemove', handleMouseMove);

      return () => {
        map.off('click', handleClickEvent);
        map.off('mousemove', handleMouseMove);
      };
    }
  }, [dispatch, map]);
};

export const handleFeatureHover = (
  map: maplibregl.Map,
  previousHoveredFeatureId: React.MutableRefObject<string | undefined>,
  previousHoveredFeatureSource: React.MutableRefObject<string | undefined>,
  featureCloseToCursor: maplibregl.MapGeoJSONFeature | undefined,
  drawingOperation: string | null = null,
) => {
  if (featureCloseToCursor) {
    map!.getCanvas().style.cursor = 'pointer';
  } else {
    map!.getCanvas().style.cursor = '';
  }

  if (
    previousHoveredFeatureId.current &&
    previousHoveredFeatureSource.current
  ) {
    let prevFeatureToUpdate: maplibregl.FeatureIdentifier = {
      source: previousHoveredFeatureSource.current,
      id: previousHoveredFeatureId.current,
      sourceLayer: 'default',
    };
    // -- Part to remove when using vector tiles for reports instead of geojson source
    if (prevFeatureToUpdate.source === SRC_REPORTS) {
      delete prevFeatureToUpdate.sourceLayer;
    }
    // -- End of part to remove

    map.setFeatureState(prevFeatureToUpdate, { hovered: false });
  }

  if (featureCloseToCursor && drawingOperation === null) {
    let hoveredFeatureToUpdate: maplibregl.FeatureIdentifier = {
      source: featureCloseToCursor.layer.source,
      id: featureCloseToCursor?.id,
      sourceLayer: 'default',
    };
    // -- Part to remove when using vector tiles for reports instead of geojson source
    if (hoveredFeatureToUpdate.source == SRC_REPORTS) {
      delete hoveredFeatureToUpdate.sourceLayer;
    }
    // -- End of part to remove

    map.setFeatureState(hoveredFeatureToUpdate, { hovered: true });

    previousHoveredFeatureId.current = featureCloseToCursor?.id as string;
    previousHoveredFeatureSource.current = featureCloseToCursor?.layer
      .source as string;
  }
};
