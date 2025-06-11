import { useEffect, useRef } from 'react';
import { Actions, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import drawStyle from '@/components/contribution/drawStyle';
import type { Feature } from 'geojson';
import { ShapeInteractionMode } from '@/stores/edition/edition-slice';

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

  const dispatch = useDispatch();
  const BUILDING_DRAW_SHAPE_FEATURE_ID = 'selected-building-shape';

  // add the draw plugin to the map
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
          draw_polygon: MapboxDraw.modes.draw_polygon,
        },
        defaultMode: 'simple_select',
      });
      // @ts-ignore
      map.addControl(draw);
      drawRef.current = draw;

      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: { features: Array<Feature> }) => {
        dispatch(Actions.edition.setBuildingNewShape(e.features[0].geometry));
      };
      drawRef.current && map.on('draw.update', handleBuildingShapeUpdate);

      // actions when a polygon is created
      const handleBuildingShapeCreate = (e: { features: Array<Feature> }) => {
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
        map.off('draw.update', handleBuildingShapeUpdate);
        map.off('draw.create', handleBuildingShapeCreate);
        mapContainer.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [map, dispatch]);

  // activate the "draw mode"
  // can be a polygon modification or creation depending on the case
  useEffect(() => {
    if (drawRef.current) {
      if (operation === 'create') {
        if (shapeInteractionMode === 'updating') {
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
        } else if (shapeInteractionMode === 'drawing') {
          drawRef.current.changeMode('draw_polygon');
        } else if (shapeInteractionMode === null) {
          drawRef.current.changeMode('simple_select');
        }
      } else {
        drawRef.current.deleteAll();
      }
    }
  }, [shapeInteractionMode, operation, dispatch]);

  useEffect(() => {
    if (map) {
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
  }, [selectedBuilding, dispatch]);

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
    }
  }, [operation]);
};
