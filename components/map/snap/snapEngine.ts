// Géométrie pure de l'aimantation, exprimée en pixels écran.
// Travailler en pixels rend la sensibilité indépendante du niveau de zoom ;
// la projection écran <-> lng/lat est faite par l'appelant (cf buildingSnap).

export type PxPoint = { x: number; y: number };

export type SnapResult = {
  point: PxPoint;
  kind: 'vertex' | 'edge';
};

const squaredDistance = (a: PxPoint, b: PxPoint): number =>
  (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/**
 * Projette le point `p` sur le segment [a, b] (projection bornée aux
 * extrémités du segment).
 */
export const nearestPointOnSegment = (
  p: PxPoint,
  a: PxPoint,
  b: PxPoint,
): PxPoint => {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const squaredLength = abx * abx + aby * aby;
  if (squaredLength === 0) return { x: a.x, y: a.y };
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / squaredLength;
  t = Math.max(0, Math.min(1, t));
  return { x: a.x + t * abx, y: a.y + t * aby };
};

/**
 * Cherche le point d'aimantation le plus proche du curseur parmi les anneaux
 * de polygones fournis (en pixels écran), dans un rayon de `tolerancePx`.
 *
 * Les sommets sont prioritaires sur les arêtes : si un sommet est à portée,
 * on s'y colle même si une arête est légèrement plus proche. C'est ce qui
 * permet de fermer proprement les coins de bâtiments mitoyens.
 */
export const findSnapPoint = (
  cursor: PxPoint,
  rings: PxPoint[][],
  tolerancePx: number,
): SnapResult | null => {
  const squaredTolerance = tolerancePx ** 2;
  let best: SnapResult | null = null;
  let bestSquaredDistance = Infinity;

  for (const ring of rings) {
    for (const vertex of ring) {
      const d = squaredDistance(cursor, vertex);
      if (d <= squaredTolerance && d < bestSquaredDistance) {
        bestSquaredDistance = d;
        best = { point: { x: vertex.x, y: vertex.y }, kind: 'vertex' };
      }
    }
  }
  if (best) return best;

  for (const ring of rings) {
    for (let i = 0; i < ring.length - 1; i++) {
      const projected = nearestPointOnSegment(cursor, ring[i], ring[i + 1]);
      const d = squaredDistance(cursor, projected);
      if (d <= squaredTolerance && d < bestSquaredDistance) {
        bestSquaredDistance = d;
        best = { point: projected, kind: 'edge' };
      }
    }
  }
  return best;
};
