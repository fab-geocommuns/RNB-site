import maplibregl, { MapGeoJSONFeature, PointLike } from 'maplibre-gl';
import { BUILDINGS_LAYER } from '@/components/map/useMapLayers';

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
  //if (!map.getLayer(BUILDINGS_LAYER) && !map.getLayer('adscircle')) return;

  const bbox: [PointLike, PointLike] = [
    [x - buffer, y - buffer],
    [x + buffer, y + buffer],
  ];

  // Rechercher les features de la couche BUILDINGS_LAYER dans la zone de recherche
  const features = map.queryRenderedFeatures(bbox, {
    layers: [BUILDINGS_LAYER, 'adscircle'],
  });

  // Calcul de la feature la plus proche
  let closestFeature: MapGeoJSONFeature | undefined = undefined;
  if (features.length > 0) {
    let minDistance = Infinity;

    features.forEach((feature) => {
      const featurePoint = map.project([
        (feature.geometry as GeoJSON.Point).coordinates[0],
        (feature.geometry as GeoJSON.Point).coordinates[1],
      ]);
      const distance = Math.sqrt(
        Math.pow(x - featurePoint.x, 2) + Math.pow(y - featurePoint.y, 2),
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestFeature = feature;
      }
    });
  }

  return closestFeature;
};
