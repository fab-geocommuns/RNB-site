import { describe, it, expect } from 'vitest';
import { area, booleanTouches, intersect, featureCollection } from '@turf/turf';
import type { Feature, Polygon, LineString } from 'geojson';
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

  it('splits a polygon into 4 pieces with two crossing cuts', () => {
    const polygon: Polygon = {
      type: 'Polygon',
      coordinates: [
        [
          [-0.5675542, 44.8307446],
          [-0.5670046, 44.8307304],
          [-0.5670394, 44.8300529],
          [-0.5674617, 44.8300638],
          [-0.5675542, 44.8307446],
        ],
      ],
    };

    const crossingCut: LineString = {
      type: 'LineString',
      coordinates: [
        [-0.567299621428333, 44.83091762939142],
        [-0.5672539616077756, 44.8297666025301],
        [-0.5682750812300128, 44.830446623735526],
        [-0.5663988776952351, 44.83041424195531],
      ],
    };

    const result = splitPolygonByLines(polygon, [crossingCut]);

    expect(result).not.toBeNull();
    expect(result).toHaveLength(4);

    const totalArea = area(polygon);
    const sumArea = result!.reduce((acc, p) => acc + area(p), 0);
    expect(sumArea).toBeCloseTo(totalArea, 2);
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

  // Comportement de la scission combinée à l'aimantation. L'aimantation pose
  // les extrémités du trait de coupe sur la frontière du bâtiment : on vérifie
  // ici le cas où elle réussit (extrémités exactement sur le bord) et le cas
  // qui produit le message « Le trait ne découpe pas correctement le bâtiment.
  // Assurez-vous que le trait traverse le bâtiment de part en part. »
  describe('aimantation du trait de coupe', () => {
    const square: Polygon = {
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

    const verticalCut = (y0: number, y1: number): LineString => ({
      type: 'LineString',
      coordinates: [
        [5, y0],
        [5, y1],
      ],
    });

    it('un trait aimanté exactement bord à bord découpe en deux moitiés mitoyennes', () => {
      // extrémités posées pile sur le bord bas (y=0) et le bord haut (y=10)
      const result = splitPolygonByLines(square, [verticalCut(0, 10)]);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);

      const [left, right] = result as Feature<Polygon>[];

      // pas de perte de surface
      const sumArea = area(left) + area(right);
      expect(sumArea).toBeCloseTo(area(square), 5);

      // les deux bâtiments produits sont mitoyens : ils se touchent le long du
      // trait de coupe, sans aire commune
      expect(booleanTouches(left, right)).toBe(true);
      expect(intersect(featureCollection([left, right]))).toBeNull();
    });

    it("prolonge une extrémité tombée juste à l'intérieur pour découper quand même", () => {
      // Cas réel du bug : l'outil aimante sur la géométrie des tuiles
      // vectorielles (généralisée), légèrement décalée par rapport à la forme
      // de l'API utilisée pour la découpe. L'extrémité « aimantée » se retrouve
      // 0,05 à l'intérieur du polygone. Sans correction, le trait ne traverse
      // plus de part en part (-> message rouge). On prolonge donc très
      // légèrement cette extrémité vers l'extérieur pour rétablir la découpe.
      const result = splitPolygonByLines(square, [verticalCut(0.05, 11)]);

      expect(result).not.toBeNull();
      expect(result).toHaveLength(2);

      const [a, b] = result as Feature<Polygon>[];
      // pas de perte de surface
      expect(area(a) + area(b)).toBeCloseTo(area(square), 5);
      // l'orientation verticale du trait est conservée : deux moitiés égales
      expect(area(a)).toBeCloseTo(area(b), 5);
    });

    it('ne prolonge pas une extrémité déjà posée sur la frontière', () => {
      // bord à bord exact : l'extrémité est sur la frontière, donc inchangée,
      // et la découpe reste deux moitiés égales
      const result = splitPolygonByLines(square, [verticalCut(0, 10)]);
      expect(result).not.toBeNull();
      const [a, b] = result as Feature<Polygon>[];
      expect(area(a)).toBeCloseTo(area(b), 5);
    });

    it("conserve l'orientation : prolonger ne déplace pas le trait de coupe", () => {
      // une même droite oblique (pente 3, passant par (3,-1) et (7,11)).
      // Référence : extrémités franchement hors du carré -> découpe nette.
      const reference: LineString = {
        type: 'LineString',
        coordinates: [
          [3, -1],
          [7, 11],
        ],
      };
      // Même droite, mais l'extrémité basse (3.35, 0.05) est colinéaire et
      // tombe juste à l'intérieur du carré : elle doit être prolongée le long
      // de cette même droite.
      const insideEndpoint: LineString = {
        type: 'LineString',
        coordinates: [
          [3.35, 0.05],
          [7, 11],
        ],
      };

      const exact = splitPolygonByLines(square, [reference]);
      const extended = splitPolygonByLines(square, [insideEndpoint]);

      expect(exact).not.toBeNull();
      expect(extended).not.toBeNull();
      expect(extended).toHaveLength(2);

      const sortedAreas = (r: Feature<Polygon>[]) =>
        r.map((p) => area(p)).sort((x, y) => x - y);
      const exactAreas = sortedAreas(exact as Feature<Polygon>[]);
      const extendedAreas = sortedAreas(extended as Feature<Polygon>[]);

      // les pièces obtenues sont identiques (à l'arrondi près) : le trait n'a
      // été prolongé que dans son propre axe, sans changer où il traverse le
      // bâtiment. On compare en relatif (aires géodésiques très grandes).
      const relDiff = (a: number, b: number) => Math.abs(a - b) / b;
      expect(relDiff(extendedAreas[0], exactAreas[0])).toBeLessThan(1e-6);
      expect(relDiff(extendedAreas[1], exactAreas[1])).toBeLessThan(1e-6);
    });
  });
});
