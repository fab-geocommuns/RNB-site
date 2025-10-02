import maplibregl, { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import {
  LAYER_BDGS_SHAPE_BORDER,
  LAYER_BDGS_SHAPE_POINT,
  LAYER_BDGS_POINT,
  LAYER_ADS_CIRCLE,
  LAYER_BAN_POINT,
  LAYER_BAN_TXT,
} from '@/components/map/useMapLayers';
import { distance } from '@turf/turf';

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
  const layersToSearchIn = [
    LAYER_BDGS_SHAPE_BORDER,
    LAYER_BDGS_SHAPE_POINT,
    LAYER_BDGS_POINT,
    LAYER_ADS_CIRCLE,
    LAYER_BAN_POINT,
    LAYER_BAN_TXT,
  ].filter((layer) => map.getLayer(layer));

  const bbox: [PointLike, PointLike] = [
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
        let d = distance([x, y], [featureX, featureY]);

        if (d < minDistance) {
          minDistance = d;
          closestFeature = feature;
        }
      }

      if (feature.geometry.type == 'Polygon') {
        feature.geometry.coordinates[0].forEach((point) => {
          const featureX = point[0];
          const featureY = point[1];
          let d = distance([x, y], [featureX, featureY]);

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
            let d = distance([x, y], [featureX, featureY]);

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
