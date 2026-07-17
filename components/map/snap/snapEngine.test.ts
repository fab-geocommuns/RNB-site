import { describe, expect, it } from 'vitest';
import { findSnapPoint, nearestPointOnSegment, PxPoint } from './snapEngine';

// anneau fermé (premier point répété à la fin), comme dans un GeoJSON Polygon
const squareRing: PxPoint[] = [
  { x: 0, y: 0 },
  { x: 100, y: 0 },
  { x: 100, y: 100 },
  { x: 0, y: 100 },
  { x: 0, y: 0 },
];

describe('nearestPointOnSegment', () => {
  it('projette perpendiculairement sur le segment', () => {
    const projected = nearestPointOnSegment(
      { x: 50, y: 10 },
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    );
    expect(projected).toEqual({ x: 50, y: 0 });
  });

  it('borne la projection aux extrémités du segment', () => {
    const projected = nearestPointOnSegment(
      { x: 150, y: 10 },
      { x: 0, y: 0 },
      { x: 100, y: 0 },
    );
    expect(projected).toEqual({ x: 100, y: 0 });
  });

  it('gère un segment dégénéré (deux points identiques)', () => {
    const projected = nearestPointOnSegment(
      { x: 5, y: 5 },
      { x: 1, y: 1 },
      { x: 1, y: 1 },
    );
    expect(projected).toEqual({ x: 1, y: 1 });
  });
});

describe('findSnapPoint', () => {
  it('ne retourne rien sans cible à portée', () => {
    expect(findSnapPoint({ x: 50, y: 50 }, [], 15)).toBeNull();
    // au centre du carré : tout est à plus de 15px
    expect(findSnapPoint({ x: 50, y: 50 }, [squareRing], 15)).toBeNull();
  });

  it("s'aimante au sommet le plus proche", () => {
    const result = findSnapPoint({ x: 8, y: 6 }, [squareRing], 15);
    expect(result).toEqual({ point: { x: 0, y: 0 }, kind: 'vertex' });
  });

  it("s'aimante à l'arête quand aucun sommet n'est à portée", () => {
    const result = findSnapPoint({ x: 50, y: 8 }, [squareRing], 15);
    expect(result).toEqual({ point: { x: 50, y: 0 }, kind: 'edge' });
  });

  it('privilégie un sommet à portée même si une arête est plus proche', () => {
    // à 10px du sommet (0,0) et à 4px de l'arête du haut
    const result = findSnapPoint({ x: 10, y: 4 }, [squareRing], 15);
    expect(result).toEqual({ point: { x: 0, y: 0 }, kind: 'vertex' });
  });

  it('respecte la tolérance', () => {
    expect(findSnapPoint({ x: 50, y: 8 }, [squareRing], 5)).toBeNull();
    expect(findSnapPoint({ x: 50, y: 4 }, [squareRing], 5)).toEqual({
      point: { x: 50, y: 0 },
      kind: 'edge',
    });
  });

  it('choisit la cible la plus proche parmi plusieurs anneaux', () => {
    const otherRing: PxPoint[] = [
      { x: 60, y: 0 },
      { x: 200, y: 0 },
      { x: 200, y: 100 },
      { x: 60, y: 100 },
      { x: 60, y: 0 },
    ];
    // le curseur est à 4px de l'arête gauche (x=60) du second carré et à
    // 44px de l'arête droite (x=100) du premier
    const result = findSnapPoint({ x: 56, y: 50 }, [squareRing, otherRing], 15);
    expect(result).toEqual({ point: { x: 60, y: 50 }, kind: 'edge' });
  });
});
