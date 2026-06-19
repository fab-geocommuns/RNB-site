import { describe, expect, it } from 'vitest';
import {
  area,
  booleanDisjoint,
  booleanPointOnLine,
  intersect,
  featureCollection,
  point,
  polygon as turfPolygon,
  polygonToLine,
} from '@turf/turf';
import type { Feature, LineString, Polygon } from 'geojson';
import { findSnapPoint, PxPoint } from './snapEngine';

/**
 * Tests géométriques de l'aimantation : ils vérifient la crainte exprimée par
 * l'utilisateur — « un trait qu'on snap à une arête crée-t-il vraiment des
 * bâtiments mitoyens ? ».
 *
 * On part des sorties du moteur d'aimantation (`findSnapPoint`, en coordonnées
 * planes) et on reconstruit un bâtiment voisin à partir des points aimantés,
 * puis on contrôle l'adjacence avec une bibliothèque de manipulation
 * géométrique (turf), plutôt qu'en réécrivant nous-mêmes la vérification.
 *
 * Définition retenue de « mitoyen » : les deux polygones partagent une
 * frontière commune (`booleanDisjoint` est faux — il y a bien un mur partagé)
 * sans aucune aire commune (`intersect` renvoie `null`) — ni trou, ni
 * recouvrement. On évite `booleanTouches`, qui renvoie `false` lorsque le mur
 * partagé n'est qu'une portion d'une arête du voisin.
 */

// Bâtiment existant A : un carré dont le côté droit (x = 10) sera la
// frontière partagée avec le bâtiment dessiné.
const A_RING: PxPoint[] = [
  { x: 0, y: 0 },
  { x: 10, y: 0 },
  { x: 10, y: 10 },
  { x: 0, y: 10 },
  { x: 0, y: 0 },
];

const A: Feature<Polygon> = turfPolygon([A_RING.map((p) => [p.x, p.y])]);
// A est un polygone simple (sans trou) : polygonToLine renvoie une LineString
const A_OUTLINE = polygonToLine(A) as Feature<LineString>;

const TOL = 2;

const buildPolygon = (pts: PxPoint[]): Feature<Polygon> =>
  turfPolygon([[...pts, pts[0]].map((p) => [p.x, p.y])]);

const overlapArea = (a: Feature<Polygon>, b: Feature<Polygon>): number => {
  const inter = intersect(featureCollection([a, b]));
  return inter ? area(inter) : 0;
};

describe('aimantation → bâtiments mitoyens', () => {
  it('aimante exactement sur les coins du voisin (snap sommet)', () => {
    // l'utilisateur dessine les deux coins gauches de B près des coins droits
    // de A : ils doivent s'aimanter exactement dessus
    const topLeft = findSnapPoint({ x: 10.4, y: 0.3 }, [A_RING], TOL);
    const bottomLeft = findSnapPoint({ x: 9.6, y: 9.7 }, [A_RING], TOL);

    expect(topLeft).toEqual({ point: { x: 10, y: 0 }, kind: 'vertex' });
    expect(bottomLeft).toEqual({ point: { x: 10, y: 10 }, kind: 'vertex' });
  });

  it('construit un bâtiment réellement mitoyen via un snap sur les coins', () => {
    const topLeft = findSnapPoint({ x: 10.4, y: 0.3 }, [A_RING], TOL)!;
    const bottomLeft = findSnapPoint({ x: 9.6, y: 9.7 }, [A_RING], TOL)!;

    // B s'appuie sur le côté droit de A, ses coins droits sont libres
    const B = buildPolygon([
      topLeft.point,
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      bottomLeft.point,
    ]);

    // les coins aimantés sont sur la frontière de A
    expect(booleanPointOnLine(point([10, 0]), A_OUTLINE)).toBe(true);
    expect(booleanPointOnLine(point([10, 10]), A_OUTLINE)).toBe(true);

    // mitoyen : ils partagent le mur, sans aucune aire commune
    expect(booleanDisjoint(A, B)).toBe(false);
    expect(overlapArea(A, B)).toBe(0);
  });

  it('aimante exactement sur une arête du voisin (snap arête)', () => {
    // les coins gauches de B tombent au milieu du côté droit de A, hors sommets
    const top = findSnapPoint({ x: 10.3, y: 3 }, [A_RING], TOL);
    const bottom = findSnapPoint({ x: 9.7, y: 7 }, [A_RING], TOL);

    expect(top).toEqual({ point: { x: 10, y: 3 }, kind: 'edge' });
    expect(bottom).toEqual({ point: { x: 10, y: 7 }, kind: 'edge' });
  });

  it('un bâtiment dont les sommets sont aimantés sur une arête est mitoyen', () => {
    const top = findSnapPoint({ x: 10.3, y: 3 }, [A_RING], TOL)!;
    const bottom = findSnapPoint({ x: 9.7, y: 7 }, [A_RING], TOL)!;

    const B = buildPolygon([
      top.point,
      { x: 18, y: 3 },
      { x: 18, y: 7 },
      bottom.point,
    ]);

    // les sommets aimantés sont bien posés sur l'arête de A
    expect(booleanPointOnLine(point([10, 3]), A_OUTLINE)).toBe(true);
    expect(booleanPointOnLine(point([10, 7]), A_OUTLINE)).toBe(true);

    // mitoyen même si le mur n'est qu'une portion de l'arête de A
    expect(booleanDisjoint(A, B)).toBe(false);
    expect(overlapArea(A, B)).toBe(0);
  });

  it('sans aimantation, un quasi-alignement laisse un trou ou un recouvrement', () => {
    // contre-exemple : ce que l'aimantation évite. Un bord gauche placé « à la
    // main » légèrement à droite de x = 10 laisse un trou (bâtiments disjoints)
    const withGap = buildPolygon([
      { x: 10.3, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 10.3, y: 10 },
    ]);
    expect(booleanDisjoint(A, withGap)).toBe(true);

    // et légèrement à gauche de x = 10, les bâtiments se recouvrent
    const withOverlap = buildPolygon([
      { x: 9.7, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 9.7, y: 10 },
    ]);
    expect(overlapArea(A, withOverlap)).toBeGreaterThan(0);
  });
});
