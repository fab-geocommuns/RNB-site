// React things
import { useCallback, useEffect, useRef } from 'react';

// Store
import { Actions, RootState } from '@/stores/store';
import { useSelector, useDispatch } from 'react-redux';
// import { SelectedBuilding } from '@/stores/map/map-slice';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import drawStyle from '@/components/contribution/drawStyle';

MapboxDraw.constants.classes.CANVAS = 'maplibregl-canvas';
MapboxDraw.constants.classes.CONTROL_BASE = 'maplibregl-ctrl';
MapboxDraw.constants.classes.CONTROL_PREFIX = 'maplibregl-ctrl-';
MapboxDraw.constants.classes.CONTROL_GROUP = 'maplibregl-ctrl-group';
MapboxDraw.constants.classes.ATTRIBUTION = 'maplibregl-ctrl-attrib';

/**
 * Ajout et gestion des couches de la carte
 * @param map
 */
export const useMapEditBuildingShape = (map?: maplibregl.Map) => {
  const selectedBuilding = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const drawMode = useSelector((state: RootState) => state.map.drawMode);
  const buildingNewShape = useSelector(
    (state: RootState) => state.map.buildingNewShape,
  );
  const drawRef = useRef<any>(null);
  const dispatch = useDispatch();
  const BUILDING_DRAW_SHAPE_FEATURE_ID = 'selected-building-shape';

  useEffect(() => {
    if (!buildingNewShape && drawRef.current) {
      const feature = drawRef.current.get(BUILDING_DRAW_SHAPE_FEATURE_ID);
      if (feature) {
        drawRef.current.delete(BUILDING_DRAW_SHAPE_FEATURE_ID);
      }
    }
  }, [buildingNewShape]);

  useEffect(() => {
    if (map && !drawRef.current) {
      const blue = '#3bb2d0';
      const orange = '#fbb03b';

      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
        styles: drawStyle,
      });
      map.addControl(draw);
      drawRef.current = draw;

      const handleBuildingShapeUpdate = (e: any) => {
        dispatch(Actions.map.setPolygonNewShape(e.features[0].geometry));
      };
      drawRef.current && map.on('draw.update', handleBuildingShapeUpdate);
      // drawRef.current && map.on('draw.selectionchange', (e) => {console.log("changement de selection")});

      // return () => {
      //     map.off('draw.update', handleBuildingShapeUpdate)
      // }
    }
  }, [map]);

  useEffect(() => {
    if (drawRef.current && drawMode) {
      drawRef.current.changeMode(drawMode, {
        featureId: BUILDING_DRAW_SHAPE_FEATURE_ID,
      });
    }
  }, [drawMode]);

  useEffect(() => {
    if (selectedBuilding && drawRef.current && selectedBuilding.shape) {
      const featureId = drawRef.current.add({
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
