import { useEffect, useRef, type RefObject } from 'react';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import drawStyle from '@/components/contribution/drawStyle';
// @ts-ignore
import DrawAssistedRectangle from '@geostarters/mapbox-gl-draw-rectangle-assisted-mode/dist/DrawAssistedRectangle.js';
import { snapDrawEvent } from '@/components/map/snap/buildingSnap';

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

// Customisation des modes de dessin. Ces objets sont partagés au niveau module
// par MapboxDraw : on les patche une seule fois à l'import plutôt qu'à chaque
// rendu du hook.

// prevent the direct_select mode to switch to simple_select on click out
// https://github.com/mapbox/mapbox-gl-draw/blob/78a5db85ec5e86159e2439316ed56128ba6eb5d9/src/modes/direct_select.js#L105
// @ts-ignore
MapboxDraw.modes.direct_select.clickNoTarget = function () {};
// @ts-ignore
MapboxDraw.modes.direct_select.clickInactive = function () {};

// customization of draw_polygon mode
// avoids leaving the draw_polygon mode when escape key is pressed during the drawing
MapboxDraw.modes.draw_polygon.onKeyUp = function (state, e) {
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

// customization of draw_line_string mode for split
MapboxDraw.modes.draw_line_string.onKeyUp = function (state, e) {
  // escape key - cancel current line and restart
  if (e.keyCode === 27) {
    // @ts-ignore
    this.deleteFeature([state.line.id], { silent: true });
    this.changeMode('draw_line_string');
  }
};

// Aimantation : on enveloppe les handlers qui positionnent un sommet à partir
// du curseur, pour que e.lngLat soit magnétisé vers les sommets et arêtes des
// bâtiments voisins quand l'aimantation est active (cf components/map/snap).
type DrawEventHandler = (this: unknown, state: any, e: any) => unknown;
const withSnap = (handler: DrawEventHandler): DrawEventHandler =>
  function (state, e) {
    snapDrawEvent(e);
    return handler.call(this, state, e);
  };

MapboxDraw.modes.draw_polygon.onMouseMove = withSnap(
  // @ts-ignore
  MapboxDraw.modes.draw_polygon.onMouseMove,
);
MapboxDraw.modes.draw_polygon.onTap = MapboxDraw.modes.draw_polygon.onClick =
  // @ts-ignore
  withSnap(MapboxDraw.modes.draw_polygon.onClick);

MapboxDraw.modes.draw_line_string.onMouseMove = withSnap(
  // @ts-ignore
  MapboxDraw.modes.draw_line_string.onMouseMove,
);
MapboxDraw.modes.draw_line_string.onTap =
  MapboxDraw.modes.draw_line_string.onClick =
    // @ts-ignore
    withSnap(MapboxDraw.modes.draw_line_string.onClick);

DrawAssistedRectangle.onMouseMove = withSnap(DrawAssistedRectangle.onMouseMove);
// le onTap du mode rectangle délègue à onClick : ne patcher que onClick
DrawAssistedRectangle.onClick = withSnap(DrawAssistedRectangle.onClick);

// direct_select : aimantation du sommet en cours de déplacement
const originalDragVertex =
  // @ts-ignore
  MapboxDraw.modes.direct_select.dragVertex;
// @ts-ignore
MapboxDraw.modes.direct_select.dragVertex = function (state, e, delta) {
  // L'aimantation n'a de sens que pour un sommet unique : il est alors posé
  // sur le point magnétisé plutôt que déplacé du delta du curseur.
  if (state.selectedCoordPaths.length === 1 && snapDrawEvent(e)) {
    state.feature.updateCoordinate(
      state.selectedCoordPaths[0],
      e.lngLat.lng,
      e.lngLat.lat,
    );
    return;
  }
  originalDragVertex.call(this, state, e, delta);
};

/**
 * Installe le plugin MapboxDraw sur la carte et expose la référence partagée.
 * Ce hook ne gère QUE le cycle de vie du plugin (création, ajout du contrôle,
 * raccourci de suppression de sommet, nettoyage). La synchronisation avec le
 * store est laissée aux hooks consommateurs.
 */
export const useMapDraw = (
  map?: maplibregl.Map,
): RefObject<MapboxDraw | null> => {
  const drawRef = useRef<MapboxDraw | null>(null);

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
          draw_line_string: MapboxDraw.modes.draw_line_string,
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
  }, [map]);

  return drawRef;
};
