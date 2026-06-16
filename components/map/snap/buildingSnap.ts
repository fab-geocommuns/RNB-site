import maplibregl from 'maplibre-gl';
import type { GeoJSONSource } from 'maplibre-gl';
import { findSnapPoint, PxPoint } from './snapEngine';
import {
  LAYER_BDGS_SHAPE_FILL,
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_POINT_SHAPE_FILL,
  LAYER_BDGS_POINT_SHAPE_BORDER,
} from '@/components/map/layers/buildings';

/**
 * Aimantation (snap) des outils de dessin sur les bâtiments voisins.
 *
 * Les modes de MapboxDraw sont des objets partagés au niveau module, patchés
 * une seule fois à l'import (cf useMapDraw) : ils ne peuvent pas recevoir le
 * state React/Redux par props. Le contexte est donc tenu à jour ici, au
 * niveau module, par le hook `useMapSnap`.
 */
type SnapContext = {
  map: maplibregl.Map | null;
  enabled: boolean;
  tolerancePx: number;
  // bâtiment en cours d'édition : sa forme d'origine est toujours visible
  // dans les tuiles, on ne veut pas que ses propres sommets l'attirent
  excludedRnbId: string | null;
};

const context: SnapContext = {
  map: null,
  enabled: false,
  tolerancePx: 15,
  excludedRnbId: null,
};

export const setSnapContext = (partial: Partial<SnapContext>) => {
  Object.assign(context, partial);
};

// Couches requêtées pour trouver les géométries cibles. Les filtres des
// couches (bâtiments actifs, non démolis) s'appliquent automatiquement via
// queryRenderedFeatures.
const SNAP_TARGET_LAYERS = [
  LAYER_BDGS_SHAPE_FILL,
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_POINT_SHAPE_FILL,
  LAYER_BDGS_POINT_SHAPE_BORDER,
];

const collectRings = (geometry: GeoJSON.Geometry): GeoJSON.Position[][] => {
  if (geometry.type === 'Polygon') return geometry.coordinates;
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat();
  return [];
};

// Évènement MapboxDraw : un MapMouseEvent enrichi, dont on mute la position
// pour magnétiser le curseur.
type SnappableDrawEvent = {
  lngLat: maplibregl.LngLat;
  point: { x: number; y: number };
};

/**
 * Magnétise l'évènement de dessin vers le sommet ou l'arête de bâtiment le
 * plus proche, si l'aimantation est active et qu'une cible est à portée.
 * Mute `e.lngLat` / `e.point` et affiche l'indicateur visuel.
 * @returns true si l'évènement a été aimanté
 */
export const snapDrawEvent = (e: SnappableDrawEvent): boolean => {
  const { map, enabled, tolerancePx, excludedRnbId } = context;
  if (!map || !enabled) return false;

  const layers = SNAP_TARGET_LAYERS.filter((id) => map.getLayer(id));
  if (layers.length === 0) {
    hideSnapIndicator(map);
    return false;
  }

  const features = map.queryRenderedFeatures(
    [
      [e.point.x - tolerancePx, e.point.y - tolerancePx],
      [e.point.x + tolerancePx, e.point.y + tolerancePx],
    ],
    { layers },
  );

  // Les géométries viennent des tuiles vectorielles : un même bâtiment peut
  // apparaître plusieurs fois (un morceau par tuile), c'est sans conséquence
  // pour la recherche du point le plus proche.
  const rings: PxPoint[][] = [];
  for (const feature of features) {
    if (excludedRnbId && feature.properties?.rnb_id === excludedRnbId) {
      continue;
    }
    for (const ring of collectRings(feature.geometry)) {
      rings.push(ring.map(([lng, lat]) => map.project([lng, lat])));
    }
  }

  const result = findSnapPoint(e.point, rings, tolerancePx);
  if (!result) {
    hideSnapIndicator(map);
    return false;
  }

  const snappedLngLat = map.unproject([result.point.x, result.point.y]);
  e.lngLat = snappedLngLat;
  e.point = map.project(snappedLngLat);
  showSnapIndicator(map, snappedLngLat);
  return true;
};

// Indicateur visuel : un anneau rose autour du point d'aimantation
// (même rose que les lignes de coupe de l'outil de scission)
const SNAP_INDICATOR_SOURCE = 'snap-indicator';
const SNAP_INDICATOR_LAYER = 'snap-indicator';

const emptyFeatureCollection: GeoJSON.FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

const showSnapIndicator = (map: maplibregl.Map, lngLat: maplibregl.LngLat) => {
  // source et couche sont (re)créées paresseusement : elles disparaissent
  // quand le fond de carte change (setStyle)
  if (!map.getSource(SNAP_INDICATOR_SOURCE)) {
    map.addSource(SNAP_INDICATOR_SOURCE, {
      type: 'geojson',
      data: emptyFeatureCollection,
    });
  }
  if (!map.getLayer(SNAP_INDICATOR_LAYER)) {
    map.addLayer({
      id: SNAP_INDICATOR_LAYER,
      type: 'circle',
      source: SNAP_INDICATOR_SOURCE,
      paint: {
        'circle-radius': 11,
        'circle-opacity': 0,
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ff00e1',
      },
    });
  } else {
    // les couches de dessin sont régulièrement remontées au-dessus de tout
    // (cf useMapPolygonDraw) : on garde l'indicateur visible par-dessus
    map.moveLayer(SNAP_INDICATOR_LAYER);
  }
  (map.getSource(SNAP_INDICATOR_SOURCE) as GeoJSONSource).setData({
    type: 'Feature',
    properties: {},
    geometry: { type: 'Point', coordinates: [lngLat.lng, lngLat.lat] },
  });
};

export const hideSnapIndicator = (map: maplibregl.Map) => {
  const source = map.getSource(SNAP_INDICATOR_SOURCE) as
    | GeoJSONSource
    | undefined;
  if (source) source.setData(emptyFeatureCollection);
};
