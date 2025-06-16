import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { getNearestFeatureFromCursorWithBuffer } from '@/components/map/map.utils';
import { MapMouseEvent } from 'maplibre-gl';
import {
  LAYER_BDGS_POINT,
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  SRC_BDGS_SHAPES,
} from '@/components/map/useMapLayers';
import { selectBuildingsAndSetMergeCandidates } from '@/stores/edition/edition-slice';
import { selectBuildingAndSetOperationUpdate } from '@/stores/edition/edition-slice';

/**
 * Ajout et gestion des événements de la carte
 * @param map
 */
export const useEditionMapEvents = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const previousHoveredFeatureId = useRef<string | undefined>(undefined);
  const previousHoveredFeatureSource = useRef<string | undefined>(undefined);
  const previousSplitCandidate = useRef<string | undefined>(undefined);
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.edition.updateCreate.shapeInteractionMode,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);
  const splitCandidateId = useSelector(
    (state: RootState) => state.edition.split.splitCandidateId,
  );

  // Initialisation des événements
  useEffect(() => {
    if (map) {
      // Click sur la carte
      const handleClickEvent = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map,
          e.point.x,
          e.point.y,
          0,
        );

        if (operation === 'update' || operation === null) {
          if (shapeInteractionMode !== 'drawing') {
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
                dispatch(selectBuildingAndSetOperationUpdate(rnb_id));
              }
            } else {
              // click out unselects the currently selected item
              dispatch(Actions.edition.setOperation(null));
            }
          }
        } else if (operation === 'split') {
          if (featureCloseToCursor) {
            // What did we click on?
            if (
              [
                LAYER_BDGS_POINT,
                LAYER_BDGS_SHAPE_BORDER,
                LAYER_BDGS_SHAPE_POINT,
              ].includes(featureCloseToCursor.layer.id)
            ) {
              const rnb_id = featureCloseToCursor.properties.rnb_id;
              dispatch(
                Actions.edition.setSplitCandidateAndLocation({
                  rnb_id: rnb_id,
                  location: [e.lngLat.lng, e.lngLat.lat],
                }),
              );
            }
          }
        } else if (operation === 'merge') {
          if (featureCloseToCursor) {
            dispatch(
              selectBuildingsAndSetMergeCandidates(
                featureCloseToCursor.properties.rnb_id,
              ),
            );
          }
        }
      };

      map.on('click', handleClickEvent);

      /////////////
      const handleMouseMove = (e: MapMouseEvent) => {
        const featureCloseToCursor = getNearestFeatureFromCursorWithBuffer(
          map!,
          e.point.x,
          e.point.y,
          0,
        );

        if (shapeInteractionMode === 'drawing') {
          map!.getCanvas().style.cursor = 'crosshair';
        } else if (featureCloseToCursor) {
          map!.getCanvas().style.cursor = 'pointer';
        } else {
          map!.getCanvas().style.cursor = '';
        }

        if (
          previousHoveredFeatureId.current &&
          previousHoveredFeatureSource.current
        ) {
          map.setFeatureState(
            {
              source: previousHoveredFeatureSource.current,
              id: previousHoveredFeatureId.current,
              sourceLayer: 'default',
            },
            { hovered: false },
          );
        }

        if (featureCloseToCursor && operation === null) {
          map.setFeatureState(
            {
              source: featureCloseToCursor.layer.source,
              id: featureCloseToCursor?.id,
              sourceLayer: 'default',
            },
            { hovered: true },
          );

          previousHoveredFeatureId.current = featureCloseToCursor?.id as string;
          previousHoveredFeatureSource.current = featureCloseToCursor?.layer
            .source as string;
        }
      };
      // Évenement de déplacement du curseur: changement de pointeur si proche d'un bâtiment
      map.on('mousemove', handleMouseMove);

      return () => {
        map.off('click', handleClickEvent);
        map.off('mousemove', handleMouseMove);
      };
    }
  }, [dispatch, map, shapeInteractionMode, operation]);

  // split candidate highlighting
  useEffect(() => {
    if (map) {
      if (previousSplitCandidate.current) {
        map.removeFeatureState({
          source: SRC_BDGS_SHAPES,
          sourceLayer: 'default',
          id: previousSplitCandidate.current,
        });
        previousSplitCandidate.current = undefined;
      }

      if (operation === 'split' && splitCandidateId) {
        map.setFeatureState(
          {
            source: SRC_BDGS_SHAPES,
            id: splitCandidateId,
            sourceLayer: 'default',
          },
          { in_panel: true },
        );
        previousSplitCandidate.current = splitCandidateId;
      }
    }
  }, [map, splitCandidateId, operation]);
};
