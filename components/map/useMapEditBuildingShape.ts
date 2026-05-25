import { useCallback, useEffect, useRef, useState } from 'react';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature } from 'geojson';
import { ShapeInteractionMode } from '@/stores/edition/edition-slice';
import { useHotkeys } from 'react-hotkeys-hook';
import { toasterSuccess } from '../contribution/toaster';
import { useMapDraw } from './useMapDraw';

/**
 *
 * @param map
 */
export const useMapEditBuildingShape = (map?: maplibregl.Map) => {
  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const shapeInteractionMode: ShapeInteractionMode = useSelector(
    (state: RootState) => state.edition.updateCreate.shapeInteractionMode,
  );
  const drawRef = useMapDraw(map);
  const selectedBuildingRef = useRef<string | null>(null);
  const operation = useSelector((state: RootState) => state.edition.operation);
  const operationIsUpdateCreateNull = ['create', 'update', null].includes(
    operation,
  );
  const cutStep = useSelector(
    (state: RootState) => state.edition.split.cutStep,
  );
  const candidateShape = useSelector(
    (state: RootState) => state.edition.split.candidateShape,
  );

  const prevOperationRef = useRef<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const BUILDING_DRAW_SHAPE_FEATURE_ID = 'selected-building-shape';

  const [drawMode, setDrawMode] = useState('draw_polygon');
  // shift+r switches from a drawing mode to another
  // this implementation of the rectangle is hacky
  // if the feature pleases our users, we should probably move the drawMode info
  // to the store. This will be cleaner in case we want to add more draw modes
  // for example a snap drawing mode
  useHotkeys('shift+r', () => {
    const targetMode =
      drawMode === 'draw_polygon' ? 'draw_rectangle' : 'draw_polygon';

    if (targetMode === 'draw_rectangle') {
      toasterSuccess(dispatch, `mode rectangle activé`);
    } else if (targetMode === 'draw_polygon') {
      toasterSuccess(dispatch, `mode polygone activé`);
    }

    setDrawMode(targetMode);

    if (
      drawRef.current?.getMode() === 'draw_polygon' ||
      drawRef.current?.getMode() === 'draw_rectangle'
    ) {
      // @ts-ignore
      drawRef.current?.changeMode(targetMode);
    }
  });

  useEffect(() => {
    if (map) {
      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: { features: Array<Feature> }) => {
        if (operationIsUpdateCreateNull) {
          dispatch(Actions.edition.setBuildingNewShape(e.features[0].geometry));
        }
        // For split, we no longer handle draw.update — cut lines are immutable once drawn
      };
      drawRef.current && map.on('draw.update', handleBuildingShapeUpdate);

      // actions when a feature is created
      const handleBuildingShapeCreate = (e: { features: Array<Feature> }) => {
        if (operationIsUpdateCreateNull) {
          // delete all other drawings
          if (e.features && drawRef.current) {
            const newFeaturId = e.features[0].id;
            for (const draw of drawRef.current.getAll().features) {
              if (draw.id && draw.id !== newFeaturId) {
                drawRef.current.delete(draw.id.toString());
              }
            }
            dispatch(
              Actions.edition.setBuildingNewShape(e.features[0].geometry),
            );
            setTimeout(() => {
              dispatch(Actions.edition.setShapeInteractionMode('updating'));
            });
          }
        } else if (operation === 'split') {
          // The created feature is a LineString (cut line)
          dispatch(
            Actions.edition.addCutLine({
              geometry: e.features[0].geometry,
              featureId: e.features[0].id,
            }),
          );
          // Stay in draw_line_string mode to allow drawing more cut lines
          setTimeout(() => {
            if (drawRef.current) {
              drawRef.current.changeMode('draw_line_string');
            }
          });
        }
      };
      drawRef.current && map.on('draw.create', handleBuildingShapeCreate);

      const handleSelectionChange = ({
        features,
      }: {
        features: Array<Feature>;
      }) => {
        // For split, selection change is not used anymore (cut lines are not selectable for child selection)
      };
      drawRef.current && map.on('draw.selectionchange', handleSelectionChange);

      return () => {
        map.off('draw.update', handleBuildingShapeUpdate);
        map.off('draw.create', handleBuildingShapeCreate);
        map.off('draw.selectionchange', handleSelectionChange);
      };
    }
  }, [map, operation]);

  // shapeInteractionMode is 'updating' and current operation is update, create or null
  const handleShapeUpdateForOperationUCN = useCallback(() => {
    if (drawRef.current) {
      for (const draw of drawRef.current.getAll().features) {
        if (draw.id) {
          try {
            // the changemode function call may crash for some polygons (if you start drawing a polygon and switch back to the edit mode)
            drawRef.current.changeMode('direct_select', {
              featureId: draw.id.toString(),
            });
          } catch (_error) {}
        }
      }
    }
  }, [drawRef.current]);

  // activate the "draw mode"
  // can be a polygon modification or creation depending on the case
  useEffect(() => {
    if (drawRef.current) {
      if (operation === 'split') {
        // For split: manage draw mode based on cutStep
        if (cutStep === 'drawing' && candidateShape) {
          drawRef.current.changeMode('draw_line_string');
        } else {
          drawRef.current.changeMode('simple_select');
        }
      } else {
        // For update/create/null: use shapeInteractionMode
        switch (shapeInteractionMode) {
          case 'updating':
            if (operationIsUpdateCreateNull) {
              handleShapeUpdateForOperationUCN();
            }
            break;
          case 'drawing':
            drawRef.current.changeMode(drawMode);
            break;
          case null:
            drawRef.current.changeMode('simple_select');
            break;
          default:
            break;
        }
      }
    }
  }, [shapeInteractionMode, operation, cutStep, candidateShape, dispatch]);

  useEffect(() => {
    if (map && operationIsUpdateCreateNull) {
      if (
        selectedBuilding &&
        selectedBuilding._type === 'building' &&
        drawRef.current &&
        selectedBuilding.shape &&
        selectedBuilding.rnb_id !== selectedBuildingRef.current
      ) {
        drawRef.current.deleteAll();
        drawRef.current.add({
          id: BUILDING_DRAW_SHAPE_FEATURE_ID,
          type: 'Feature',
          properties: {},
          geometry: selectedBuilding.shape,
        });
        // used to know if we are selecting a different building next time we click on the map
        selectedBuildingRef.current = selectedBuilding.rnb_id;
      }

      if (selectedBuilding) {
        // no matter what happens, drawing should be on top
        const lastLayer = map.getStyle().layers.at(-1);
        if (lastLayer) {
          const drawLayers = map
            .getStyle()
            .layers?.filter((layer) => layer.id.includes('gl-draw'));
          for (const draw_layer of drawLayers) {
            map.moveLayer(draw_layer.id, lastLayer.id);
          }
        }
      } else {
        // selectedBuilding is null => cleaning
        deleteFeatures(drawRef.current);
        selectedBuildingRef.current = null;
      }
    }
  }, [selectedBuilding, operation, dispatch]);

  const deleteFeatures = (currentDrawRef: MapboxDraw | null) => {
    if (currentDrawRef) {
      // for some reason, calling deleteAll blocks the drawing of a new shape
      // even if only one feature is drawn on the map, there are 2 of them in  the list of features
      // deleting the empty one makes it impossible to draw a new one afterwards
      // so I manually delete the non empty features

      for (const draw of currentDrawRef.getAll().features) {
        // @ts-ignore
        const flat_array = draw.geometry.coordinates
          ? // @ts-ignore
            draw.geometry.coordinates.flat(Infinity)
          : [];
        if (draw.id && flat_array.length > 4) {
          currentDrawRef.delete(draw.id.toString());
        }
      }
    }
  };

  useEffect(() => {
    if (operation === null) {
      deleteFeatures(drawRef.current);
      selectedBuildingRef.current = null;
    }
    if (
      drawRef.current &&
      (operation === 'split' || prevOperationRef.current === 'split')
    ) {
      drawRef.current.deleteAll();
      selectedBuildingRef.current = null;
    }
    prevOperationRef.current = operation;
  }, [operation]);

  // When cutLines are cleared or the last one removed, sync draw features
  const cutLines = useSelector(
    (state: RootState) => state.edition.split.cutLines,
  );
  const prevCutLinesLengthRef = useRef(0);

  useEffect(() => {
    if (operation === 'split' && drawRef.current) {
      if (cutLines.length < prevCutLinesLengthRef.current) {
        // Lines were removed — rebuild the draw features from state
        drawRef.current.deleteAll();
        for (const line of cutLines) {
          drawRef.current.add({
            type: 'Feature',
            properties: {},
            geometry: line.geometry,
          });
        }
        // Re-enter draw mode
        if (cutStep === 'drawing' && candidateShape) {
          drawRef.current.changeMode('draw_line_string');
        }
      }
      prevCutLinesLengthRef.current = cutLines.length;
    }
  }, [cutLines, operation, cutStep, candidateShape]);
};
