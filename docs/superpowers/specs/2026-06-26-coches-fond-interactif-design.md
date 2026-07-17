# Fond interactif de coches — Summer Games

Date : 2026-06-26

## Objectif

Ajouter un fond interactif discret au bloc `SummerGame` ([homeBlock.tsx](../../../components/games/summerGames/homeBlock.tsx)).
Des dizaines de coches forment un motif régulier en arrière-plan de la boîte verte (`.shell`).
Au passage de la souris, chaque coche s'oriente légèrement vers le curseur. Sa position ne change pas,
seule sa rotation évolue. Les coches éloignées du curseur bougent à peine ; les proches bougent beaucoup plus.

## Décisions

- **Rendu** : SVG / DOM (pas de canvas). Réutilise le path de [check-line.svg](../../../public/icons/check-line.svg).
- **Fallback** : motif statique (figé) sur tactile et `prefers-reduced-motion: reduce`.
- **Intensité** : discret (coches blanches ~10 % d'opacité, amplitude de rotation modérée, rayon d'influence localisé).
- **Rotation de base** : 0° (motif aligné, régulier).

## Architecture

Nouveau composant client `components/games/summerGames/checkmarkBackground.tsx`, rendu en première
position dans `.shell` comme calque absolu :

- `position:absolute; inset:0; overflow:hidden; pointer-events:none; z-index:0`, hérite des coins arrondis.
- Le contenu existant de `.shell` est enveloppé dans `.shellContent` (`position:relative; z-index:1`) pour passer au-dessus.

Le composant est autonome : il mesure son conteneur, génère la grille, gère l'interaction et le fallback.

### La coche

Path de `check-line.svg` inliné en `<svg>` (viewBox `0 0 24 24`, `fill:currentColor`) afin de piloter
couleur et opacité en CSS. Blanc, opacité ~10 %, taille ~20px.

### Génération de la grille

- `ResizeObserver` sur le calque → largeur/hauteur courantes.
- Espacement régulier `SPACING ≈ 56px`. `cols = ceil(w / SPACING)`, `rows = ceil(h / SPACING)`.
- Positions au centre de chaque cellule. Rotation de base 0° pour toutes.
- Rendu **une seule fois** en React (régénéré uniquement au resize).

### Mécanique d'orientation

Listeners `mousemove` / `mouseleave` sur l'élément `.shell` parent. Pour chaque coche `(px,py)`,
curseur `(mx,my)` :

```
dx, dy        = mx-px, my-py
targetAngle   = atan2(dy, dx)
dist          = hypot(dx, dy)
influence     = exp(-(dist / RADIUS)^2)        // proche → ~1, loin → ~0   (RADIUS ≈ 220)
delta         = clamp(targetAngle, ±MAX_ROT)   // limite l'amplitude        (MAX_ROT ≈ 30°)
rotationCible = delta * influence
```

- Loin du curseur : `influence ≈ 0` → la coche reste ~0° (bouge à peine).
- Proche : s'oriente vers le curseur, plafonnée à `MAX_ROT` (« légèrement »).
- `mouseleave` → cible = 0° pour toutes.

### Fluidité et performance

- Boucle `requestAnimationFrame` : interpolation `current += (cible - current) * EASE` (EASE ≈ 0.15),
  puis écriture directe `el.style.transform = \`rotate(${current}deg)\`` sur les **refs DOM**
  (aucun re-render React par frame).
- La boucle s'arrête quand tout est stabilisé (curseur parti, retour fluide à 0°) → zéro CPU au repos.

### Fallback (accessibilité / tactile)

Si `matchMedia('(prefers-reduced-motion: reduce)')` **ou** `matchMedia('(pointer: fine)')` faux :
motif rendu figé, sans listener ni boucle rAF.

## Réglages exposés

Constantes en haut du composant : `SPACING`, `RADIUS`, `MAX_ROT`, `EASE`, `CHECK_SIZE`, opacité (CSS).

## Fichiers

- ✦ nouveau `components/games/summerGames/checkmarkBackground.tsx`
- ✎ `components/games/summerGames/homeBlock.tsx` — wrap du contenu dans `.shellContent` + insertion du calque
- ✎ `styles/summerGames.module.scss` — `.checkField`, `.check`, `.shellContent`

## Hors périmètre

- Pas de jitter / irrégularité du motif (régularité voulue).
- Pas d'animation automatique au repos.
- Spécifique aux Summer Games (pas de composant générique réutilisable pour l'instant).
