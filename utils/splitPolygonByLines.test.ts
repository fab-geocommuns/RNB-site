import { describe, it, expect } from 'vitest';
import { area } from '@turf/turf';
import type { Polygon, LineString } from 'geojson';
import { splitPolygonByLines } from './splitPolygonByLines';

describe('splitPolygonByLines', () => {
  it('splits a rectangle into two equal halves with a vertical cut', () => {
    const rectangle: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [0, 0],
          [10, 0],
          [10, 10],
          [0, 10],
          [0, 0],
        ],
      ],
    };

    const verticalCut: LineString = {
      type: 'LineString',
      coordinates: [
        [5, -1],
        [5, 11],
      ],
    };

    const result = splitPolygonByLines(rectangle, [verticalCut]);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const totalArea = area(rectangle);
    const piece1Area = area(result![0]);
    const piece2Area = area(result![1]);

    expect(piece1Area).toBeCloseTo(totalArea / 2, 2);
    expect(piece2Area).toBeCloseTo(totalArea / 2, 2);
  });

  it('splits a polygon with a U-shaped line that enters and exits through the same edge', () => {
    const polygon: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-0.567081, 44.8324741],
          [-0.566101, 44.8324677],
          [-0.5661246, 44.8318941],
          [-0.5670633, 44.8318685],
          [-0.567081, 44.8324741],
        ],
      ],
    };

    const uShapedCut: LineString = {
      type: 'LineString',
      coordinates: [
        [-0.5669411727726015, 44.83255403451446],
        [-0.5669582118648009, 44.831923956718015],
        [-0.566189018549693, 44.831923956718015],
        [-0.5661841502378309, 44.832595464045795],
      ],
    };

    const result = splitPolygonByLines(polygon, [uShapedCut]);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(2);

    const totalArea = area(polygon);
    const sumArea = result!.reduce((acc, p) => acc + area(p), 0);
    expect(sumArea).toBeCloseTo(totalArea, 5);
  });
});
