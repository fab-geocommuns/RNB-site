import maplibregl, { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import {
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  LAYER_BDGS_POINT,
  LAYER_ADS_CIRCLE,
  LAYER_BAN_POINT,
  LAYER_BAN_TXT,
  LAYER_REPORTS_CIRCLE,
  LAYER_REPORTS_ICON,
} from '@/components/map/useMapLayers';
import { distance } from '@turf/turf';
import { MapMouseEvent } from 'maplibre-gl';

/**
 * Récupère la feature la plus proche du curseur dans un rayon maximum spécifié en pixels.
 * @param map - La carte en question.
 * @param x - La coordonnée x du curseur.
 * @param y - La coordonnée y du curseur.
 * @param buffer - Le rayon maximum en pixels pour rechercher la feature la plus proche du curseur.
 * @returns La feature la plus proche du curseur dans le rayon spécifié, ou undefined si aucune feature n'est trouvée.
 */
export const getNearestFeatureFromCursorWithBuffer = (
  map: maplibregl.Map,
  event: MapMouseEvent,
  buffer = 30, // buffer in pixels
): MapGeoJSONFeature | undefined => {
  const layersToSearchIn = [
    LAYER_BAN_POINT,
    LAYER_BAN_TXT,
    LAYER_BDGS_SHAPE_BORDER,
    LAYER_BDGS_SHAPE_POINT,
    LAYER_BDGS_POINT,
    LAYER_ADS_CIRCLE,
    LAYER_REPORTS_CIRCLE,
    LAYER_REPORTS_ICON,
  ].filter((layer) => map.getLayer(layer));

  // First, we need to draw a bbxox expressed in pixels,
  // relative to the map container
  const { x, y } = event.point;

  let bbox: [PointLike, PointLike] | PointLike = [x, y];
  if (buffer > 0) {
    const minX = x - buffer;
    const maxX = x + buffer;
    const minY = y - buffer;
    const maxY = y + buffer;

    bbox = [
      [minX, minY],
      [maxX, maxY],
    ];
  }

  // Rechercher les features de la couche BUILDINGS_LAYER_POINT dans la zone de recherche
  const features = map.queryRenderedFeatures(bbox, {
    layers: layersToSearchIn,
  });

  // Calcul de la feature la plus proche
  let closestFeature: MapGeoJSONFeature | undefined = undefined;
  if (features.length > 0) {
    let minDistance = Infinity;

    // we need the cursor position in lnglat to compare them to the features coordinates
    const cursorLng = event.lngLat.lng;
    const cursorLat = event.lngLat.lat;

    features.forEach((feature) => {
      if (feature.geometry.type == 'Point') {
        const pointLng = feature.geometry.coordinates[0];
        const pointLat = feature.geometry.coordinates[1];
        let d = distance([cursorLng, cursorLat], [pointLng, pointLat]);

        if (d < minDistance) {
          minDistance = d;
          closestFeature = feature;
        }
      }

      if (feature.geometry.type == 'Polygon') {
        feature.geometry.coordinates[0].forEach((point) => {
          const vertexLng = point[0];
          const vertexLat = point[1];
          let d = distance([cursorLng, cursorLat], [vertexLng, vertexLat]);

          if (d < minDistance) {
            minDistance = d;
            closestFeature = feature;
          }
        });
      }

      if (feature.geometry.type == 'MultiPolygon') {
        feature.geometry.coordinates[0].forEach((polygon) => {
          polygon.forEach((point) => {
            const vertexLng = point[0];
            const vertexLat = point[1];
            let d = distance([cursorLng, cursorLat], [vertexLng, vertexLat]);

            if (d < minDistance) {
              minDistance = d;
              closestFeature = feature;
            }
          });
        });
      }
    });
  }

  return closestFeature;
};
