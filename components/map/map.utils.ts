import maplibregl, { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import {
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  LAYER_BDGS_POINT,
  LAYER_ADS_CIRCLE,
} from '@/components/map/useMapLayers';

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

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
  x: number,
  y: number,
  buffer = 15,
): MapGeoJSONFeature | undefined => {
  let layersToSearchIn = [];

  // Buildings : shapes
  if (map.getLayer(LAYER_BDGS_SHAPE_BORDER)) {
    layersToSearchIn.push(LAYER_BDGS_SHAPE_BORDER);
  }
  if (map.getLayer(LAYER_BDGS_SHAPE_POINT)) {
    layersToSearchIn.push(LAYER_BDGS_SHAPE_POINT);
  }

  // Buildings : points
  if (map.getLayer(LAYER_BDGS_POINT)) {
    layersToSearchIn.push(LAYER_BDGS_POINT);
  }

  // ADS
  if (map.getLayer(LAYER_ADS_CIRCLE)) {
    layersToSearchIn.push(LAYER_ADS_CIRCLE);
  }

  let bbox: [PointLike, PointLike] = [
    [x - buffer, y - buffer],
    [x + buffer, y + buffer],
  ];

  // Rechercher les features de la couche BUILDINGS_LAYER_POINT dans la zone de recherche
  const features = map.queryRenderedFeatures(bbox, {
    layers: layersToSearchIn,
  });

  // Calcul de la feature la plus proche
  let closestFeature: MapGeoJSONFeature | undefined = undefined;
  if (features.length > 0) {
    let minDistance = Infinity;

    features.forEach((feature) => {
      if (feature.geometry.type == 'Point') {
        const featureX = feature.geometry.coordinates[0];
        const featureY = feature.geometry.coordinates[1];
        let d = distance(x, y, featureX, featureY);

        if (d < minDistance) {
          minDistance = d;
          closestFeature = feature;
        }
      }

      if (feature.geometry.type == 'Polygon') {
        feature.geometry.coordinates[0].forEach((point) => {
          const featureX = point[0];
          const featureY = point[1];
          let d = distance(x, y, featureX, featureY);

          if (d < minDistance) {
            minDistance = d;
            closestFeature = feature;
          }
        });
      }

      if (feature.geometry.type == 'MultiPolygon') {
        feature.geometry.coordinates[0].forEach((polygon) => {
          polygon.forEach((point) => {
            const featureX = point[0];
            const featureY = point[1];
            let d = distance(x, y, featureX, featureY);

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
