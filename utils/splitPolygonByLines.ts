import {
  polygon as turfPolygon,
  featureCollection,
  polygonToLine,
  lineIntersect,
  truncate,
  polygonize,
  intersect,
  area,
  booleanPointInPolygon,
  point as turfPoint,
} from '@turf/turf';
import type {
  Feature,
  Polygon,
  MultiPolygon,
  LineString,
  Point,
  Position,
} from 'geojson';

/**
 * Split a LineString at the given points. Each point is projected onto the
 * closest segment; points that don't lie on any segment (within SPLIT_TOL)
 * are ignored.
 *
 * Replaces @turf/line-split, which truncates the splitter to precision 7
 * internally and silently misses cuts on segments with a near-zero-width bbox.
 */
function splitLineByPoints(
  line: Feature<LineString>,
  points: Feature<Point>[],
): Feature<LineString>[] {
  const SPLIT_TOL = 1e-9;
  const coords = line.geometry.coordinates;

  type Cut = { segIdx: number; t: number; pt: Position };
  const cuts: Cut[] = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const a = coords[i];
    const b = coords[i + 1];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) continue;

    for (const ptFeat of points) {
      const p = ptFeat.geometry.coordinates;
      const t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / lenSq;
      if (t <= SPLIT_TOL || t >= 1 - SPLIT_TOL) continue;
      const projX = a[0] + t * dx;
      const projY = a[1] + t * dy;
      const distSq = (p[0] - projX) ** 2 + (p[1] - projY) ** 2;
      if (distSq > SPLIT_TOL * SPLIT_TOL) continue;
      cuts.push({ segIdx: i, t, pt: p });
    }
  }

  cuts.sort((a, b) => a.segIdx - b.segIdx || a.t - b.t);

  const segments: Position[][] = [];
  let current: Position[] = [coords[0]];
  let cutIdx = 0;

  for (let i = 0; i < coords.length - 1; i++) {
    while (cutIdx < cuts.length && cuts[cutIdx].segIdx === i) {
      current.push(cuts[cutIdx].pt);
      segments.push(current);
      current = [cuts[cutIdx].pt];
      cutIdx++;
    }
    current.push(coords[i + 1]);
  }
  segments.push(current);

  return segments.map((s) => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates: s },
  }));
}

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

  // Also find points where the cut line crosses itself — polygonize requires
  // a properly noded graph, so any internal crossings of the cut line must
  // become explicit vertices.
  const selfIntersects = lineIntersect(truncatedLine, truncatedLine);

  // Split both lines at the intersection points
  const outerPieces = splitLineByPoints(outerLine, intersects.features);
  const cutPieces = splitLineByPoints(truncatedLine, [
    ...intersects.features,
    ...selfIntersects.features,
  ]);

  // Combine all line segments
  const allPieces = featureCollection([...outerPieces, ...cutPieces]);

  // Reconstruct polygons from the line segments
  const polygonized = polygonize(allPieces);

  // Keep only polygons that are (almost entirely) inside the original polygon.
  // Using point-in-polygon checks is unreliable when the candidate sits flush
  // against the original boundary — boundary points get counted as "inside".
  // Comparing intersection area to candidate area is robust to that case.
  const result = polygonized.features.filter((candidate) => {
    const inter = intersect(featureCollection([candidate, polygon]));
    if (!inter) return false;
    const candidateArea = area(candidate);
    if (candidateArea === 0) return false;
    return area(inter) / candidateArea > 0.999;
  });

  if (result.length < 2) {
    return null; // Didn't actually produce a valid split
  }

  return result as Feature<Polygon>[];
}

/**
 * Fraction de la diagonale de la bounding box du bâtiment dont on prolonge une
 * extrémité du trait de coupe. Le prolongement est invisible (il est rogné à la
 * frontière lors de la découpe) : il sert uniquement à garantir que le trait
 * traverse bien la frontière. On le veut « très très léger » pour ne pas risquer
 * d'aller croiser une autre partie d'un bâtiment concave.
 */
const EXTENSION_RATIO = 0.01;

const distance = (a: Position, b: Position): number =>
  Math.hypot(a[0] - b[0], a[1] - b[1]);

/**
 * Prolonge une extrémité du trait de coupe vers l'extérieur, en conservant
 * l'orientation du trait dessiné par l'utilisateur (on prolonge le long du
 * dernier segment, `neighbor -> endpoint`).
 *
 * Le prolongement n'a lieu que si l'extrémité est *strictement à l'intérieur*
 * du bâtiment : si elle est déjà sur la frontière (cas d'une aimantation
 * exacte) ou à l'extérieur (le trait traverse déjà), on la laisse telle quelle.
 * Cela règle le cas où l'aimantation a posé l'extrémité légèrement en deçà de
 * la frontière (géométrie des tuiles vs géométrie de l'API), qui empêchait la
 * découpe de traverser de part en part.
 */
const extendEndpointOutward = (
  endpoint: Position,
  neighbor: Position,
  polygon: Feature<Polygon>,
  amount: number,
): Position => {
  if (
    !booleanPointInPolygon(turfPoint(endpoint), polygon, {
      ignoreBoundary: true,
    })
  ) {
    return endpoint; // déjà sur la frontière ou à l'extérieur : on n'y touche pas
  }
  const len = distance(endpoint, neighbor);
  if (len === 0) return endpoint;
  const ux = (endpoint[0] - neighbor[0]) / len;
  const uy = (endpoint[1] - neighbor[1]) / len;
  return [endpoint[0] + ux * amount, endpoint[1] + uy * amount];
};

/**
 * Prolonge légèrement les deux extrémités d'un trait de coupe pour qu'il
 * traverse la frontière du bâtiment, sans changer son orientation.
 */
const extendCutLine = (
  lineGeom: LineString,
  polygon: Feature<Polygon>,
  amount: number,
): LineString => {
  const coords = lineGeom.coordinates;
  if (coords.length < 2) return lineGeom;
  const first = extendEndpointOutward(coords[0], coords[1], polygon, amount);
  const last = extendEndpointOutward(
    coords[coords.length - 1],
    coords[coords.length - 2],
    polygon,
    amount,
  );
  return {
    type: 'LineString',
    coordinates: [first, ...coords.slice(1, -1), last],
  };
};

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
  // Handle both Polygon and MultiPolygon geometries
  const coords =
    polygonGeometry.type === 'MultiPolygon'
      ? (polygonGeometry as MultiPolygon).coordinates[0]
      : (polygonGeometry as Polygon).coordinates;
  const originalPolygon = turfPolygon(coords);
  let currentPolygons: Feature<Polygon>[] = [originalPolygon];

  // Distance de prolongement des extrémités, exprimée par rapport à la taille
  // du bâtiment d'origine (les traits sont prolongés contre cette frontière).
  const ring = coords[0];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  }
  const extensionAmount =
    Math.hypot(maxX - minX, maxY - minY) * EXTENSION_RATIO;

  for (const lineGeom of lines) {
    const line: Feature<LineString> = {
      type: 'Feature',
      properties: {},
      geometry: extendCutLine(
        lineGeom as LineString,
        originalPolygon,
        extensionAmount,
      ),
    };

    const nextPolygons: Feature<Polygon>[] = [];
    let lineDidSplit = false;

    for (const poly of currentPolygons) {
      const pieces = splitPolygonByLine(poly, line);
      if (pieces && pieces.length >= 2) {
        nextPolygons.push(...pieces);
        lineDidSplit = true;
      } else {
        // Line didn't split this sub-polygon — keep it as-is
        nextPolygons.push(poly);
      }
    }

    // If this line didn't split any sub-polygon, the cut is invalid
    if (!lineDidSplit) return null;

    currentPolygons = nextPolygons;
  }

  // Only return if we actually split something (more pieces than we started with)
  if (currentPolygons.length < 2) return null;
  return currentPolygons;
}
