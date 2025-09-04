import { useCallback, useEffect, useRef, useState } from 'react';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import drawStyle from '@/components/contribution/drawStyle';
import type { Feature } from 'geojson';
import { ShapeInteractionMode } from '@/stores/edition/edition-slice';
import { selectSplitShapeIdForCurrentChild } from '@/stores/edition/edition-selector';
// @ts-ignore
import DrawAssistedRectangle from '@geostarters/mapbox-gl-draw-rectangle-assisted-mode/dist/DrawAssistedRectangle.js';
import { useHotkeys } from 'react-hotkeys-hook';
import { toasterSuccess } from '../contribution/toaster';

// necessary to make the mapbox plugin work with maplibre
// @ts-ignore
MapboxDraw.constants.classes.CANVAS = 'maplibregl-canvas';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
// @ts-ignore
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';
// @ts-ignore
MapboxDraw.constants.classes.ATTRIBUTION = 'maplibregl-ctrl-attrib';

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
  const drawRef = useRef<MapboxDraw | null>(null);
  const selectedBuildingRef = useRef<string | null>(null);
  const operation = useSelector((state: RootState) => state.edition.operation);
  const operationIsUpdateCreateNull = ['create', 'update', null].includes(
    operation,
  );
  const currentSplitShapeId = useSelector(selectSplitShapeIdForCurrentChild);

  const prevOperationRef = useRef<string | null>(null);
  const dispatch: AppDispatch = useDispatch();
  const BUILDING_DRAW_SHAPE_FEATURE_ID = 'selected-building-shape';
  const direct_select = MapboxDraw.modes.direct_select;

  // prevent the direct_select mode to switch to simple_select on click out
  // https://github.com/mapbox/mapbox-gl-draw/blob/78a5db85ec5e86159e2439316ed56128ba6eb5d9/src/modes/direct_select.js#L105
  // @ts-ignore
  direct_select.clickNoTarget = function () {};
  // @ts-ignore
  direct_select.clickInactive = function () {};
  const draw_polygon = MapboxDraw.modes.draw_polygon;

  // customization of draw_polygon mode
  // avoids leaving the draw_polygon mode when escape key is pressed during the drawing
  draw_polygon.onKeyUp = function (state, e) {
    // escape key
    if (e.keyCode === 27) {
      // @ts-ignore
      this.deleteFeature([state.polygon.id], { silent: true });
      this.changeMode('draw_polygon');
      // enter key
    } else if (e.keyCode === 13) {
      this.changeMode('simple_select', { featureIds: [state.polygon.id] });
    }
  };

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

  // Add the draw plugin to the map
  useEffect(() => {
    if (map && !drawRef.current) {
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: false,
          trash: false,
        },
        styles: drawStyle,
        modes: {
          simple_select: MapboxDraw.modes.simple_select,
          direct_select: MapboxDraw.modes.direct_select,
          draw_polygon: draw_polygon,
          draw_rectangle: DrawAssistedRectangle,
        },
        defaultMode: 'simple_select',
      });
      // @ts-ignore
      map.addControl(draw);
      drawRef.current = draw;

      // delete a selected vertice of a polygon with the delete or backspace key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          (event.key === 'Delete' || event.key === 'Backspace') &&
          drawRef.current?.getMode() == 'direct_select'
        ) {
          drawRef.current.trash();
        }
      };
      const mapContainer = map.getContainer();
      mapContainer.addEventListener('keydown', handleKeyDown);

      // cleaning the hooks when the component is unmounted
      return () => {
        mapContainer.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [map, dispatch]);

  useEffect(() => {
    if (map) {
      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: { features: Array<Feature> }) => {
        if (operationIsUpdateCreateNull) {
          dispatch(Actions.edition.setBuildingNewShape(e.features[0].geometry));
        } else if (operation === 'split') {
          dispatch(
            Actions.edition.updateSplitBuildingShape({
              shape: e.features[0].geometry,
              shapeId: e.features[0].id,
            }),
          );
        }
      };
      drawRef.current && map.on('draw.update', handleBuildingShapeUpdate);

      // actions when a polygon is created
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
          dispatch(
            Actions.edition.setSplitChildBuildingShape({
              shape: e.features[0].geometry,
              shapeId: e.features[0].id,
            }),
          );
          setTimeout(() => {
            dispatch(Actions.edition.setShapeInteractionMode('updating'));
          });
        }
      };
      drawRef.current && map.on('draw.create', handleBuildingShapeCreate);

      const handleSelectionChange = ({
        features,
      }: {
        features: Array<Feature>;
      }) => {
        if (operation === 'split' && features.length === 1) {
          // a click on a previously drawn shape selects the corresponding building in the panel
          const featureId = features[0].id;
          dispatch(Actions.edition.setCurrentChildFromShapeId(featureId));
        }
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

  // shapeInteractionMode is 'updating' and current operation is update, create or null
  const handleShapeUpdateForOperationSplit = useCallback(() => {
    if (drawRef.current) {
      if (currentSplitShapeId) {
        for (const draw of drawRef.current.getAll().features) {
          if (draw.id === currentSplitShapeId) {
            drawRef.current.changeMode('direct_select', {
              featureId: currentSplitShapeId?.toString(),
            });
          }
        }
      }
    }
  }, [drawRef.current, currentSplitShapeId]);

  // activate the "draw mode"
  // can be a polygon modification or creation depending on the case
  useEffect(() => {
    if (drawRef.current) {
      switch (shapeInteractionMode) {
        case 'updating':
          if (operationIsUpdateCreateNull) {
            handleShapeUpdateForOperationUCN();
          } else if (operation === 'split') {
            handleShapeUpdateForOperationSplit();
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
  }, [shapeInteractionMode, operation, currentSplitShapeId, dispatch]);

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
    if (operation === null || operation === 'split') {
      deleteFeatures(drawRef.current);
      selectedBuildingRef.current = null;
    }
    prevOperationRef.current = operation;
  }, [operation]);
};
