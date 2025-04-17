// React things
import { useEffect, useRef } from 'react';

// Store
import { Actions, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
// import { SelectedBuilding } from '@/stores/map/map-slice';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import drawStyle from '@/components/contribution/drawStyle';

// necessary to make the mapbox plugin work with maplibre
MapboxDraw.constants.classes.CANVAS = 'maplibregl-canvas';
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';
MapboxDraw.constants.classes.ATTRIBUTION = 'maplibregl-ctrl-attrib';

/**
 *
 * @param map
 */
export const useMapEditBuildingShape = (map?: maplibregl.Map) => {
  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const drawMode = useSelector((state: RootState) => state.map.drawMode);
  const drawRef = useRef<any>(null);

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
          polygon: true,
          trash: false,
        },
        styles: drawStyle,
      });
      map.addControl(draw);
      drawRef.current = draw;

      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: any) => {
        dispatch(Actions.map.setBuildingNewShape(e.features[0].geometry));
      };
      drawRef.current && map.on('draw.update', handleBuildingShapeUpdate);

      // actions when a polygon is created
      const handleBuildingShapeCreate = (e: any) => {
        // dispatch(Actions.map.setBuildingNewShape(null));
        drawRef.current.deleteAll();
        dispatch(Actions.map.setBuildingNewShape(e.features[0].geometry));
      };
      drawRef.current && map.on('draw.create', handleBuildingShapeCreate);

      const handleModeChange = ({ mode }) => {
        dispatch(Actions.map.setDrawMode(mode));
      };
      drawRef.current && map.on('draw.modechange', handleModeChange);

      // cleaning the hooks when the component is unmounted
      return () => {
        map.off('draw.update', handleBuildingShapeUpdate);
        map.off('draw.create', handleBuildingShapeCreate);
        map.off('draw.modechange', handleModeChange);
      };
    }
  }, [map]);

  // if the buildingNewShape is set to null, delete all the drawings from the map
  useEffect(() => {
    if (!buildingNewShape && drawRef.current) {
      // drawRef.current.deleteAll();
    }
  }, [buildingNewShape]);

  // activate the "draw mode"
  // can be a polygon modification or creation depending on the case
  useEffect(() => {
    if (map && drawRef.current) {
      console.log('draw mode change');
      if (drawMode === 'direct_select') {
        const feature = drawRef.current.get(BUILDING_DRAW_SHAPE_FEATURE_ID);
        if (feature && feature.geometry.type == 'Point') {
          // direct_select mode is not available for a point
          // change the mode to draw_polygon instead
          dispatch(Actions.map.setDrawMode('draw_polygon'));
        } else {
          drawRef.current.changeMode(drawMode, {
            featureId: BUILDING_DRAW_SHAPE_FEATURE_ID,
          });
        }
      } else if (drawMode === 'draw_polygon') {
        drawRef.current.changeMode('draw_polygon');
      }
    }
  }, [drawMode]);

  useEffect(() => {
    if (selectedBuilding && drawRef.current && selectedBuilding.shape) {
      dispatch(Actions.map.setBuildingNewShape(null));
      drawRef.current.deleteAll();

      drawRef.current.add({
        id: BUILDING_DRAW_SHAPE_FEATURE_ID,
        type: 'Feature',
        properties: {},
        geometry: selectedBuilding.shape,
      });
      const last_layer = map.getStyle().layers.at(-1);
      if (last_layer) {
        const draw_layers = map
          .getStyle()
          .layers?.filter((layer) => layer.id.includes('gl-draw'));
        for (const draw_layer of draw_layers) {
          map.moveLayer(draw_layer.id, last_layer.id);
        }
      }
    }
    dispatch(Actions.map.setDrawMode(null));
  }, [selectedBuilding]);
};
