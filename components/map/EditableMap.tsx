import { Map, Layer, Source, useMap } from 'react-map-gl/maplibre';
import type { FillLayer, LineLayer } from 'react-map-gl/maplibre';
import satellite from '@/components/map/mapstyles/satellite.json';
import { useRef, useEffect, useState } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
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

type BaseLayer = 'satellite' | 'osm' | 'ign';
type ExtraLayer = 'plots';
type DisplayLayer = 'point' | 'shape';
export type Layer = BaseLayer | ExtraLayer | DisplayLayer;

type Props = {
  editedShape: GeoJSON.FeatureCollection | null;
  onEditedShapeChange: (shape: GeoJSON.FeatureCollection) => void;
  selectedId: string;
  coords: { lat: number; lng: number } | null;
  setCoords: (coords: { lat: number; lng: number }) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  isEditing: boolean;
  onCancelEdition: () => void;
};

const layer1: FillLayer = {
  id: 'layer1',
  type: 'fill',
  source: 'bdgtiles_shapes',
  'source-layer': 'default',
  paint: {
    'fill-color': '#cccccc',
    'fill-opacity': 1,
  },
};
const layer2: LineLayer = {
  id: 'layer2',
  type: 'line',
  source: 'bdgtiles_shapes',
  'source-layer': 'default',
  paint: {
    'line-color': [
      'case',
      ['boolean', ['feature-state', 'in_panel'], false],
      '#31e060',
      ['>', ['get', 'contributions'], 0],
      '#00000033',
      '#00000033',
    ],
    'line-width': [
      'case',
      ['boolean', ['feature-state', 'in_panel'], false],
      3,
      1.5,
    ],
  },
};

export default function EditableMap({
  editedShape,
  onEditedShapeChange,
  coords,
  setCoords,
  zoom,
  setZoom,
  layers,
  onLayersChange,
  isEditing,
  onCancelEdition,
}: Props) {
  return (
    <Map
      initialViewState={{
        latitude: coords?.lat || 46.227638,
        longitude: coords?.lng || 2.213749,
        zoom: zoom || 12,
      }}
      style={{ width: '100%', height: '400px' }}
      // @ts-ignore
      mapStyle={satellite}
    >
      <Source
        id="bdgtiles_shapes"
        type="vector"
        tiles={[
          `${process.env.NEXT_PUBLIC_API_BASE}/tiles/shapes/{x}/{y}/{z}.pbf?only_active_and_real=false`,
        ]}
      >
        <Layer {...layer1} />
        <Layer {...layer2} />
      </Source>
      {isEditing && (
        <EditedShape
          editedShape={editedShape}
          onCancel={onCancelEdition}
          onCloseShape={onEditedShapeChange}
        />
      )}
    </Map>
  );
}

type EditedShapeProps = {
  editedShape: GeoJSON.FeatureCollection | null;
  onCancel: () => void;
  onCloseShape: (shape: GeoJSON.FeatureCollection) => void;
};

function EditedShape({
  editedShape,
  onCancel,
  onCloseShape,
}: EditedShapeProps) {
  const [currentShape, setCurrentShape] = useState<any>(editedShape);
  const { current: map } = useMap();
  const drawRef = useRef<MapboxDraw | null>(null);

  const BUILDING_DRAW_SHAPE_FEATURE_ID = 'selected-building-shape';

  // add the draw plugin to the map
  useEffect(() => {
    console.log('EditedShape mounted', currentShape);
    if (map && !drawRef.current) {
      console.log('Creating new MapboxDraw');
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
        defaultMode: 'draw_polygon',
      });
      // @ts-ignore
      map.addControl(draw);
      drawRef.current = draw;

      // actions when a polygon is updated
      const handleBuildingShapeUpdate = (e: { features: Array<Feature> }) => {
        console.log('handleBuildingShapeUpdate', e.features[0].geometry);
        setCurrentShape(e.features[0].geometry);
      };
      map.on('draw.update', handleBuildingShapeUpdate);

      // actions when a polygon is created
      const handleBuildingShapeCreate = (e: { features: Array<Feature> }) => {
        console.log('handleBuildingShapeCreate', e.features[0].geometry);
        // delete all other drawings
        if (e.features && drawRef.current) {
          const newFeaturId = e.features[0].id;
          for (const draw of drawRef.current.getAll().features) {
            if (draw.id && draw.id !== newFeaturId) {
              drawRef.current.delete(draw.id.toString());
            }
          }
          const newShape = e.features[0].geometry;
          setCurrentShape(newShape);
          onCloseShape(newShape);
        }
      };
      map.on('draw.create', handleBuildingShapeCreate);
      const handleModeChange = (e: { mode: string }) => {
        if (e.mode === 'simple_select') {
          const featureId = drawRef.current?.getAll().features[0].id;
          setTimeout(() => {
            drawRef.current?.changeMode('direct_select', {
              featureId: BUILDING_DRAW_SHAPE_FEATURE_ID,
            });
          }, 0);
        }
      };
      map.on('draw.modechange', handleModeChange);

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
        deleteFeatures(drawRef.current);
        // @ts-ignore
        map.removeControl(drawRef.current);

        drawRef.current = null;
        map.off('draw.update', handleBuildingShapeUpdate);
        map.off('draw.create', handleBuildingShapeCreate);
        map.off('draw.modechange', handleModeChange);
        mapContainer.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [map, drawRef.current]);

  useEffect(() => {
    if (!map || !drawRef.current) return;

    if (!currentShape) {
      deleteFeatures(drawRef.current);
      return;
    }

    drawRef.current.deleteAll();
    drawRef.current.add({
      id: BUILDING_DRAW_SHAPE_FEATURE_ID,
      type: 'Feature',
      properties: {},
      geometry: currentShape,
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
  }, [map, drawRef.current, currentShape]);

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
        if (draw.id && flat_array.length > 1) {
          currentDrawRef.delete(draw.id.toString());
        }
      }
    }
  };

  return null;
}
