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
});
