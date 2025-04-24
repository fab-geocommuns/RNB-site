import { useEffect, useRef } from 'react';
import { Actions, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import drawStyle from '@/components/contribution/drawStyle';
import type { Feature } from 'geojson';

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
  const drawMode: MapboxDraw.DrawMode | null = useSelector(
    (state: RootState) => state.map.drawMode,
  );
  const drawRef = useRef<MapboxDraw | null>(null);
  const selectedBuildingRef = useRef<string | null>(null);

  const buildingNewShape = useSelector(
    (state: RootState) => state.map.buildingNewShape,
  );

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
      });
      // @ts-ignore
      map.addControl(draw);
      drawRef.current = draw;

      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: { features: Array<Feature> }) => {
        dispatch(Actions.map.setBuildingNewShape(e.features[0].geometry));
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
          dispatch(Actions.map.setBuildingNewShape(e.features[0].geometry));
        }
      };
      drawRef.current && map.on('draw.create', handleBuildingShapeCreate);

      const handleModeChange = ({ mode }: { mode: MapboxDraw.DrawMode }) => {
        setTimeout(() => {
          // without the timeout, the final click to close the polygon
          // eventually selects an underlying existing polygon, ruining the current update
          dispatch(Actions.map.setDrawMode(mode));
        }, 0);
      };
      drawRef.current && map.on('draw.modechange', handleModeChange);

      // cleaning the hooks when the component is unmounted
      return () => {
        map.off('draw.update', handleBuildingShapeUpdate);
        map.off('draw.create', handleBuildingShapeCreate);
        map.off('draw.modechange', handleModeChange);
      };
    }
  }, [map, dispatch]);

  // activate the "draw mode"
  // can be a polygon modification or creation depending on the case
  useEffect(() => {
    if (drawRef.current) {
      if (drawMode === 'direct_select') {
        const feature = drawRef.current.get(BUILDING_DRAW_SHAPE_FEATURE_ID);
        if (feature && feature.geometry.type == 'Point') {
          // direct_select mode is not available for a point
          // change the mode to draw_polygon instead
          dispatch(Actions.map.setDrawMode('draw_polygon'));
        } else {
          for (const draw of drawRef.current.getAll().features) {
            if (draw.id) {
              drawRef.current.changeMode('direct_select', {
                featureId: draw.id.toString(),
              });
            }
          }
        }
      } else if (drawMode === 'draw_polygon') {
        drawRef.current.changeMode('draw_polygon');
      }
    }
  }, [drawMode, dispatch]);

  useEffect(() => {
    if (
      map &&
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
      const lastLayer = map.getStyle().layers.at(-1);
      if (lastLayer) {
        const drawLayers = map
          .getStyle()
          .layers?.filter((layer) => layer.id.includes('gl-draw'));
        for (const draw_layer of drawLayers) {
          map.moveLayer(draw_layer.id, lastLayer.id);
        }
      }
      if (selectedBuilding.shape.type == 'Point') {
        dispatch(Actions.map.setDrawMode('simple_select'));
      } else {
        dispatch(Actions.map.setDrawMode('direct_select'));
      }
      // used to know if we are selecting a different building next time we click on the map
      selectedBuildingRef.current = selectedBuilding.rnb_id;
    }
  }, [selectedBuilding, dispatch]);
};
