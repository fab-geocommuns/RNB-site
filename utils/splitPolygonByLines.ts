import {
  polygon as turfPolygon,
  featureCollection,
  polygonToLine,
  lineIntersect,
  lineSplit,
  truncate,
  combine,
  polygonize,
  pointOnFeature,
  booleanPointInPolygon,
} from '@turf/turf';
import type { Feature, Polygon, LineString } from 'geojson';

/**
 * Split a polygon by a single line.
 * The line must cross the polygon boundary at least twice.
 * Returns the resulting sub-polygons, or null if the line doesn't properly cross.
 */
function splitPolygonByLine(
  polygon: Feature<Polygon>,
  cutLine: Feature<LineString>,
): Feature<Polygon>[] | null {
  // Convert polygon boundary to a LineString
  // For simple polygons, polygonToLine returns a Feature<LineString>.
  // For polygons with holes, it returns a FeatureCollection — we only use the outer ring.
  const outerLineResult = polygonToLine(polygon);
  let outerLine: Feature<LineString>;
  if (outerLineResult.type === 'FeatureCollection') {
    // Take only the outer ring (first feature)
    outerLine = outerLineResult.features[0] as Feature<LineString>;
  } else {
    outerLine = outerLineResult as Feature<LineString>;
  }

  // Truncate coordinates to avoid floating-point precision issues
  const truncatedLine = truncate(cutLine, { precision: 7 });

  // Find intersection points between the cut line and the polygon boundary
  const intersects = lineIntersect(outerLine, truncatedLine);
  if (intersects.features.length < 2) {
    return null; // Line must enter and exit the polygon
  }

  // Combine intersections into a MultiPoint for splitting
  const intersectCombined = combine(intersects).features[0];

  // Split both lines at the intersection points
  const outerPieces = lineSplit(outerLine, intersectCombined);
  const cutPieces = lineSplit(truncatedLine, intersectCombined);

  // Combine all line segments
  const allPieces = featureCollection([
    ...outerPieces.features,
    ...cutPieces.features,
  ]);

  // Reconstruct polygons from the line segments
  const polygonized = polygonize(allPieces);

  // Keep only polygons that fall inside the original polygon
  const result = polygonized.features.filter((candidate) => {
    const pt = pointOnFeature(candidate);
    return booleanPointInPolygon(pt, polygon);
  });

  if (result.length < 2) {
    return null; // Didn't actually produce a valid split
  }

  return result as Feature<Polygon>[];
}

/**
 * Split a polygon by multiple lines iteratively.
 * Each line is applied to all existing sub-polygons.
 */
export function splitPolygonByLines(
  polygonGeometry: GeoJSON.Geometry,
  lines: GeoJSON.Geometry[],
): Feature<Polygon>[] | null {
  if (!polygonGeometry || lines.length === 0) return null;

  // Wrap the polygon geometry as a Feature
  const coords = (polygonGeometry as Polygon).coordinates;
  let currentPolygons: Feature<Polygon>[] = [turfPolygon(coords)];

  for (const lineGeom of lines) {
    const line: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: lineGeom as LineString,
    };

    const nextPolygons: Feature<Polygon>[] = [];

    for (const poly of currentPolygons) {
      const pieces = splitPolygonByLine(poly, line);
      if (pieces && pieces.length >= 2) {
        nextPolygons.push(...pieces);
      } else {
        // Line didn't split this sub-polygon — keep it as-is
        nextPolygons.push(poly);
      }
    }

    currentPolygons = nextPolygons;
  }

  // Only return if we actually split something (more pieces than we started with)
  if (currentPolygons.length < 2) return null;
  return currentPolygons;
}
