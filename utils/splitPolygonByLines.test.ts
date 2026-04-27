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

  it('does not produce pieces outside the original polygon with a tangled multi-segment cut', () => {
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

    const tangledCut: LineString = {
      type: 'LineString',
      coordinates: [
        [-0.5668559773100696, 44.83252641481019],
        [-0.5671894566903006, 44.83226575319969],
        [-0.5666076933923705, 44.832550582052306],
        [-0.56721623240756, 44.832093128967216],
        [-0.5664153950633022, 44.832550582052306],
        [-0.5672040616272227, 44.831796214078565],
        [-0.566242569983018, 44.832548855820704],
        [-0.5669143970553137, 44.831777225283645],
        [-0.5659821152849531, 44.832447008086916],
        [-0.5665322345536481, 44.83176341524725],
        [-0.5659796811283968, 44.832062056550626],
        [-0.5663034238847899, 44.831789309062856],
      ],
    };

    const result = splitPolygonByLines(polygon, [tangledCut]);

    expect(result).not.toBeNull();

    const totalArea = area(polygon);
    const sumArea = result!.reduce((acc, p) => acc + area(p), 0);
    expect(sumArea).toBeCloseTo(totalArea, 3);
  });
});
