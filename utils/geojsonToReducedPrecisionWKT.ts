import { geojsonToWKT } from '@terraformer/wkt';
import { Feature, FeatureCollection, GeoJSON, Geometry } from 'geojson';

// Adapted from https://github.com/jczaplew/geojson-precision/blob/main/index.js
// Inlined out of simplicity, security and typing
function reduceGeoJSONPrecision(t: GeoJSON, coordinatePrecision: number) {
  function point(p: number[]) {
    return p.map(function (e: number) {
      return 1 * parseFloat(e.toFixed(coordinatePrecision));
    });
  }

  function multi(l: number[][]) {
    return l.map(point);
  }

  function poly(p: number[][][]) {
    return p.map(multi);
  }

  function multiPoly(m: number[][][][]) {
    return m.map(poly);
  }

  function geometry(obj: GeoJSON): GeoJSON {
    switch (obj.type) {
      case 'Point':
        return {
          ...obj,
          coordinates: point(obj.coordinates),
        };
      case 'LineString':
      case 'MultiPoint':
        return {
          ...obj,
          coordinates: multi(obj.coordinates),
        };
      case 'Polygon':
      case 'MultiLineString':
        return {
          ...obj,
          coordinates: poly(obj.coordinates),
        };
      case 'MultiPolygon':
        return {
          ...obj,
          coordinates: multiPoly(obj.coordinates),
        };
      default:
        throw new Error(`Unimplemented geometry type: ${obj.type}`);
    }
  }

  function feature(obj: Feature<Geometry>) {
    obj.geometry = geometry(obj.geometry) as Geometry;
    return obj;
  }

  function featureCollection(f: FeatureCollection) {
    f.features = f.features.map(feature);
    return f;
  }

  if (!t) {
    return t;
  }

  switch (t.type) {
    case 'Feature':
      return feature(t);
    case 'FeatureCollection':
      return featureCollection(t);
    case 'Point':
    case 'LineString':
    case 'Polygon':
    case 'MultiPoint':
    case 'MultiPolygon':
    case 'MultiLineString':
      return geometry(t);
    default:
      return t;
  }
}

export function geojsonToReducedPrecisionWKT(geojson: GeoJSON) {
  const wkt = geojsonToWKT(reduceGeoJSONPrecision(geojson, 7));
  return wkt;
}
