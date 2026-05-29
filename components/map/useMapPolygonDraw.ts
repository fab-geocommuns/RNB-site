import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import type { Feature } from 'geojson';
import { ShapeInteractionMode } from '@/stores/edition/edition-slice';
import { useHotkeys } from 'react-hotkeys-hook';
import { toasterSuccess } from '../contribution/toaster';

/**
 * Gère le dessin de la forme d'un bâtiment pour les opérations `update`,
 * `create` et hors opération (`null`) : édition d'un polygone existant et
 * dessin d'un nouveau polygone/rectangle.
 *
 * L'opération `split` est gérée à part par `useMapSplitDraw`. Les deux hooks
 * partagent le `drawRef` installé par `useMapDraw`.
 */
export const useMapPolygonDraw = (
  map: maplibregl.Map | undefined,
  drawRef: RefObject<MapboxDraw | null>,
) => {
  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const shapeInteractionMode: ShapeInteractionMode = useSelector(
    (state: RootState) => state.edition.updateCreate.shapeInteractionMode,
  );
  const operation = useSelector((state: RootState) => state.edition.operation);
  const operationIsUpdateCreateNull = ['create', 'update', null].includes(
    operation,
  );
  const dispatch: AppDispatch = useDispatch();

  const selectedBuildingRef = useRef<string | null>(null);
  const prevOperationRef = useRef<string | null>(null);
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

  // branch the draw.update / draw.create handlers
  useEffect(() => {
    if (map) {
      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: { features: Array<Feature> }) => {
        if (operationIsUpdateCreateNull) {
          dispatch(Actions.edition.setBuildingNewShape(e.features[0].geometry));
        }
      };
      drawRef.current && map.on('draw.update', handleBuildingShapeUpdate);

      // actions when a feature is created
      const handleBuildingShapeCreate = (e: { features: Array<Feature> }) => {
        if (!operationIsUpdateCreateNull) return;
        // delete all other drawings
        if (e.features && drawRef.current) {
          const newFeaturId = e.features[0].id;
          for (const draw of drawRef.current.getAll().features) {
            if (draw.id && draw.id !== newFeaturId) {
              drawRef.current.delete(draw.id.toString());
            }
          }
          dispatch(Actions.edition.setBuildingNewShape(e.features[0].geometry));
          setTimeout(() => {
            dispatch(Actions.edition.setShapeInteractionMode('updating'));
          });
        }
      };
      drawRef.current && map.on('draw.create', handleBuildingShapeCreate);

      return () => {
        map.off('draw.update', handleBuildingShapeUpdate);
        map.off('draw.create', handleBuildingShapeCreate);
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
    // split has its own mode management in useMapSplitDraw
    if (operation === 'split' || !drawRef.current) return;

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
  }, [shapeInteractionMode, operation, dispatch]);

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
    // entering or leaving split wipes the drawn features (done by useMapSplitDraw),
    // so we must forget which building's shape was drawn
    if (operation === 'split' || prevOperationRef.current === 'split') {
      selectedBuildingRef.current = null;
    }
    prevOperationRef.current = operation;
  }, [operation]);
};
