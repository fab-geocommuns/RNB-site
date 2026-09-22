import {
  DEMOLISHED_COLOR,
  DEMOLISHED_SELECTED_FILL_OPACITY,
} from '@/components/map/layers/buildings';

const blue = '#120090';
// Exported: useMapPolygonDraw sets the vertex/midpoint circle-color to this
// at runtime, since generated vertex features don't carry the parent
// polygon's custom properties (no way to branch on "demolished" in a style
// filter for those).
export const DEFAULT_VERTEX_COLOR = '#87d443';
const green = DEFAULT_VERTEX_COLOR;
const white = '#fff';
const styles = [
  // Polygons
  //   Solid fill
  //   Active state defines color
  //   Demolished buildings stay red, at the same weight as the map's
  //   selected/highlighted demolished style
  {
    id: 'gl-draw-polygon-fill',
    type: 'fill',
    filter: ['all', ['==', '$type', 'Polygon']],
    paint: {
      'fill-color': [
        'case',
        ['==', ['get', 'user_demolished'], true],
        DEMOLISHED_COLOR,
        ['==', ['get', 'active'], 'true'],
        green,
        blue,
      ],
      'fill-opacity': [
        'case',
        ['==', ['get', 'user_demolished'], true],
        DEMOLISHED_SELECTED_FILL_OPACITY,
        ['==', ['get', 'active'], 'true'],
        0.5,
        0,
      ],
    },
  },
  // Polygon outlines (dashed green, red for demolished buildings)
  {
    id: 'gl-draw-polygon-lines',
    type: 'line',
    filter: ['all', ['==', '$type', 'Polygon']],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': [
        'case',
        ['==', ['get', 'user_demolished'], true],
        DEMOLISHED_COLOR,
        green,
      ],
      'line-dasharray': ['literal', [0.2, 2]],
      'line-width': 3,
    },
  },
  // Lines seen when polygons are drawed
  {
    id: 'gl-draw-lines',
    type: 'line',
    filter: [
      'all',
      ['==', '$type', 'LineString'],
      ['!=', 'mode', 'draw_line_string'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': green,
      'line-width': 3,
    },
  },
  // Cut lines (solid pink, used for split operation)
  {
    id: 'gl-draw-cut-lines',
    type: 'line',
    filter: [
      'all',
      ['==', '$type', 'LineString'],
      ['==', 'mode', 'draw_line_string'],
    ],
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#ff00e1',
      'line-width': 3,
    },
  },
  // Points
  //   Circle with an outline
  //   Active state defines size and color
  {
    id: 'gl-draw-point-outer',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 10, 10],
      'circle-color': white,
    },
  },
  {
    id: 'gl-draw-point-inner',
    type: 'circle',
    filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'feature']],
    paint: {
      'circle-radius': 6,
      'circle-color': green,
    },
  },
  // Vertex
  //   Visible when editing polygons and lines
  //   Similar behaviour to Points
  //   Active state defines size
  {
    id: 'gl-draw-vertex-outer',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['!=', 'mode', 'simple_select'],
      ['!=', 'mode', 'draw_line_string'],
    ],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 12, 8],
      'circle-color': white,
    },
  },
  {
    id: 'gl-draw-vertex-inner',
    type: 'circle',
    filter: [
      'all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'vertex'],
      ['!=', 'mode', 'simple_select'],
      ['!=', 'mode', 'draw_line_string'],
    ],
    paint: {
      'circle-radius': ['case', ['==', ['get', 'active'], 'true'], 8, 5],
      'circle-color': green,
    },
  },
  // Midpoint
  //   Visible when editing polygons and lines
  //   Tapping or dragging them adds a new vertex to the feature
  {
    id: 'gl-draw-midpoint',
    type: 'circle',
    filter: [
      'all',
      ['==', 'meta', 'midpoint'],
      ['!=', 'mode', 'draw_line_string'],
    ],
    paint: {
      'circle-radius': 7,
      'circle-color': green,
    },
  },
];

export default styles;
