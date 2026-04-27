# Scission de batiment : nouvelle approche par decoupe

## Objectif

Remplacer le mode actuel de scission (ou l'utilisateur redessine un polygone par nouveau batiment) par un mode "decoupe" : l'utilisateur trace une ou plusieurs lignes sur le polygone existant pour le decouper en sous-parties.

---

## Fonctionnement actuel de la scission

### Flux utilisateur actuel

1. L'utilisateur clique sur le bouton "Scinder" (`EditionButton` avec `operationType='split'`)
2. L'operation passe en mode `split` dans le store Redux
3. **Etape 1** - Selection du batiment : l'utilisateur clique sur un batiment sur la carte
4. L'utilisateur choisit le nombre de batiments enfants (2 a 9) via un select
5. **Etapes 2 a N** - Pour chaque enfant :
   - L'utilisateur definit le statut du batiment
   - L'utilisateur ajoute des adresses
   - L'utilisateur **dessine un nouveau polygone** sur la carte (mode `draw_polygon` de Mapbox Draw)
   - Un double-clic termine le trace
6. **Etape finale** - Recapitulatif avec commentaire optionnel
7. Soumission via `POST /buildings/{id}/split/`

### Fichiers impliques

#### Composants UI

| Fichier | Role |
|---------|------|
| `components/contribution/SplitPanel.tsx` | Panel principal avec wizard multi-etapes (Initial, ChildInfos, Summary) |
| `components/contribution/EditionPanel.tsx` | Panel parent qui route vers SplitPanel quand `operation === 'split'` |
| `components/contribution/EditionButton.tsx` | Bouton declencheur de l'operation split |
| `components/contribution/BuildingStatus.tsx` | Dropdown de selection du statut |
| `components/contribution/BuildingAddresses.tsx` | Gestion des adresses |
| `components/contribution/BuildingInfo.tsx` | Affichage des infos batiment (utilise dans le recapitulatif) |
| `components/contribution/drawStyle.tsx` | Styles des polygones dessines (couleurs, tailles des vertices) |

#### State management (Redux)

| Fichier | Role |
|---------|------|
| `stores/edition/edition-slice.tsx` | Slice Redux : actions, reducers, types, listener middleware |
| `stores/edition/edition-selector.tsx` | Selectors : transformation des donnees pour l'API |
| `stores/store.tsx` | Configuration du store Redux |

#### Interaction carte

| Fichier | Role |
|---------|------|
| `components/map/useMapEditBuildingShape.ts` | Integration Mapbox Draw : gestion du dessin de polygones |
| `components/map/useEditionMapEvents.ts` | Evenements clic/survol de la carte pour la selection du batiment candidat |
| `components/map/useMapLayers.ts` | Definition des layers et sources de la carte |

#### Utilitaires

| Fichier | Role |
|---------|------|
| `utils/geojsonToReducedPrecisionWKT.ts` | Conversion GeoJSON -> WKT avec precision reduite (7 decimales) |
| `utils/use-rnb-fetch.tsx` | Wrapper fetch avec token d'authentification |

### Structure de donnees dans le store Redux

```typescript
// State principal pour la scission
type SplitInfos = {
  splitCandidateId: string | null;       // ID RNB du batiment a scinder
  location: [number, number] | null;     // Coordonnees [lng, lat] pour la recherche d'adresses
  selectedChildIndex: number | null;     // Index de l'enfant en cours d'edition (null = etape 1)
  children: SplitChild[];               // Tableau des batiments enfants
};

type SplitChild = {
  status: BuildingStatusType;            // 'constructed', 'demolished', etc.
  shape: GeoJSON.Geometry | null;        // Geometrie GeoJSON du polygone dessine
  shapeId: string | null | undefined | number; // ID de la feature Mapbox Draw
  addresses: BuildingAddressType[];      // Adresses associees
};
```

### Actions Redux principales (dans `edition-slice.tsx`)

| Action | Role |
|--------|------|
| `setOperation('split')` | Declenche le mode scission, reset le state, sauvegarde le candidat si un batiment est deja selectionne |
| `setSplitCandidateAndLocation()` | Enregistre le batiment a scinder + ses coordonnees |
| `setSplitChildrenNumber(n)` | Cree N enfants vides |
| `setCurrentChildSelected(index)` | Selectionne un enfant, active le mode `drawing` ou `updating` |
| `setSplitChildBuildingShape()` | Stocke la geometrie d'un enfant (premiere creation) |
| `updateSplitBuildingShape()` | Met a jour la geometrie d'un enfant (edition) |
| `setCurrentChildFromShapeId()` | Selectionne l'enfant correspondant quand on clique sur une shape deja dessinee |
| `setSplitChildStatus()` | Change le statut d'un enfant |
| `setSplitChildAddresses()` | Change les adresses d'un enfant |

### Flux du dessin de forme (dans `useMapEditBuildingShape.ts`)

1. Quand `shapeInteractionMode` passe a `'drawing'` et `operation === 'split'`, Mapbox Draw entre en mode `draw_polygon`
2. L'utilisateur dessine un polygone (clic = vertex, double-clic = fin)
3. L'evenement `draw.create` est capture :
   - Dispatch `setSplitChildBuildingShape({ shape, shapeId })`
   - Puis `setShapeInteractionMode('updating')` pour passer en mode edition
4. Si l'utilisateur clique sur un polygone deja dessine :
   - `draw.selectionchange` declenche `setCurrentChildFromShapeId()`
   - L'enfant correspondant est selectionne dans le panel
5. Les modifications de polygone (`draw.update`) mettent a jour la geometrie via `updateSplitBuildingShape()`

### Modes de dessin

- **Polygone** (defaut) : clic pour ajouter des vertices, double-clic pour terminer
- **Rectangle** : bascule via `Shift+R`
- **Echap** : annule le polygone en cours et relance le dessin
- **Entree** : termine le polygone
- **Delete/Backspace** : supprime un vertex selectionne en mode `direct_select`

### API de soumission

```
POST /buildings/{splitCandidateId}/split/?from=site
```

Body :
```json
{
  "created_buildings": [
    {
      "status": "constructed",
      "addresses_cle_interop": ["id_adresse_1"],
      "shape": "POLYGON((lng lat, lng lat, ...))"  // format WKT
    }
  ],
  "comment": "Commentaire optionnel"
}
```

La transformation GeoJSON -> WKT est faite dans `selectSplitChildrenForAPI` via `geojsonToReducedPrecisionWKT()`.

### Mise en evidence du batiment candidat (dans `useEditionMapEvents.ts`)

Quand le batiment candidat est selectionne, son feature state `in_panel` est mis a `true` sur la source `SRC_BDGS_SHAPES`, ce qui le met en surbrillance sur la carte.

---

## Nouvelle approche : decoupe par traits

### Concept

Au lieu de redessiner N polygones independants, l'utilisateur :
1. Selectionne le batiment a scinder (inchange)
2. Trace un ou plusieurs **traits de decoupe** (lignes) sur le polygone existant
3. Le systeme calcule automatiquement les sous-polygones resultants
4. L'utilisateur attribue ensuite statut et adresses a chaque sous-partie

### Avantages

- Plus intuitif : l'utilisateur "coupe" comme avec un outil de decoupe
- Plus precis : les nouvelles formes partagent les aretes du polygone d'origine
- Plus rapide : pas besoin de retracer les contours existants du batiment
- Le nombre de batiments enfants est automatiquement deduit du nombre de traits

---

## Plan d'implementation

### Nouveau flux utilisateur

1. L'utilisateur clique sur "Scinder"
2. **Etape 1** - Selection du batiment (inchange)
3. **Etape 2** - Decoupe :
   - Le polygone du batiment est affiche sur la carte (non editable)
   - L'utilisateur trace des **lignes de decoupe** (mode `draw_line_string`)
   - Chaque ligne doit traverser le polygone (entrer et sortir)
   - Un apercu en temps reel montre les sous-polygones resultants
   - L'utilisateur peut supprimer une ligne et recommencer
   - Bouton "Valider la decoupe" quand le resultat convient
4. **Etapes 3 a N** - Infos par enfant (statut, adresses) — similaire a l'actuel mais les shapes sont deja calculees
5. **Etape finale** - Recapitulatif + soumission (inchange)

### Librairies et plugins

#### Turf.js (`@turf/turf` v7.1.0) — deja installe

Turf.js n'a **pas** de fonction `splitPolygon` native. Il faut composer l'algorithme a partir de plusieurs fonctions.

**Approche retenue : polygonToLine + lineSplit + polygonize**

C'est l'approche la plus precise (pas de micro-gap entre les sous-polygones).

```typescript
import * as turf from '@turf/turf';

function splitPolygonByLine(
  polygon: GeoJSON.Feature<GeoJSON.Polygon>,
  cutLine: GeoJSON.Feature<GeoJSON.LineString>
): GeoJSON.FeatureCollection<GeoJSON.Polygon> | null {
  // 1. Convertir les contours du polygone en LineString
  const outerLine = turf.polygonToLine(polygon);

  // 2. Tronquer les coordonnees pour eviter les erreurs de precision
  const truncatedLine = turf.truncate(cutLine, { precision: 7 });

  // 3. Trouver les points d'intersection entre la ligne et le contour
  const intersects = turf.lineIntersect(outerLine, truncatedLine);
  if (intersects.features.length < 2) {
    return null; // La ligne doit traverser le polygone (entrer + sortir)
  }

  // 4. Combiner les intersections en MultiPoint
  const intersectCombined = turf.combine(intersects).features[0];

  // 5. Decouper les deux lignes aux points d'intersection
  const outerPieces = turf.lineSplit(outerLine, intersectCombined);
  const cutPieces = turf.lineSplit(truncatedLine, intersectCombined);

  // 6. Combiner tous les segments
  const allPieces = turf.featureCollection([
    ...outerPieces.features,
    ...cutPieces.features,
  ]);

  // 7. Reconstruire les polygones a partir des segments
  const polygonized = turf.polygonize(allPieces);

  // 8. Ne garder que les polygones a l'interieur du polygone d'origine
  const result = polygonized.features.filter((candidate) => {
    const pt = turf.pointOnFeature(candidate);
    return turf.booleanPointInPolygon(pt, polygon);
  });

  return turf.featureCollection(result);
}
```

**Fonctions Turf utilisees** (toutes disponibles dans `@turf/turf` v7.1.0) :

| Fonction | Role |
|----------|------|
| `turf.polygonToLine()` | Convertir le contour du polygone en LineString |
| `turf.lineIntersect()` | Trouver les points d'intersection |
| `turf.lineSplit()` | Decouper une ligne a des points donnes |
| `turf.truncate()` | Limiter la precision des coordonnees |
| `turf.combine()` | Fusionner des features en Multi* |
| `turf.polygonize()` | Reconstruire des polygones a partir de segments |
| `turf.pointOnFeature()` | Obtenir un point garanti a l'interieur d'une feature |
| `turf.booleanPointInPolygon()` | Tester si un point est dans un polygone |

#### Mapbox GL Draw — deja installe

**`draw_line_string` est un mode natif** de `@mapbox/mapbox-gl-draw`. Pas besoin de plugin supplementaire.

- L'utilisateur clique pour poser des vertices, double-clic pour terminer la ligne
- L'evenement `draw.create` est emis avec la LineString complete
- Le mode est accessible via `draw.changeMode('draw_line_string')`

**Aucune nouvelle dependance n'est necessaire.**

### Fichiers a modifier

#### 1. `utils/splitPolygonByLines.ts` — **NOUVEAU FICHIER**

Fonction utilitaire pure qui prend un polygone et un tableau de lignes de decoupe, et retourne les sous-polygones.

```typescript
// Gere le cas de plusieurs traits : decoupe iterativement
function splitPolygonByLines(
  polygon: GeoJSON.Feature<GeoJSON.Polygon>,
  lines: GeoJSON.Feature<GeoJSON.LineString>[]
): GeoJSON.Feature<GeoJSON.Polygon>[]
```

**Attention** : pour N lignes, il faut decouper iterativement. Chaque ligne est appliquee a chaque sous-polygone existant.

#### 2. `stores/edition/edition-slice.tsx` — MODIFICATION

**Changements dans `SplitInfos`** :
```typescript
type SplitInfos = {
  splitCandidateId: string | null;
  location: [number, number] | null;
  selectedChildIndex: number | null;
  children: SplitChild[];
  // NOUVEAUX CHAMPS :
  cutLines: CutLine[];               // Lignes de decoupe tracees
  candidateShape: GeoJSON.Geometry | null;  // Geometrie du batiment a scinder
  cutStep: 'drawing' | 'done';       // Sous-etape de la phase de decoupe
};

type CutLine = {
  geometry: GeoJSON.Geometry;
  featureId: string | number | undefined;
};
```

**Nouvelles actions** :
| Action | Role |
|--------|------|
| `addCutLine({ geometry, featureId })` | Ajouter une ligne de decoupe |
| `removeCutLine(featureId)` | Supprimer une ligne de decoupe |
| `setCandidateShape(geometry)` | Stocker la geometrie du batiment candidat |
| `validateCut()` | Calculer les enfants a partir des lignes, passer a l'etape suivante |
| `setCutStep(step)` | Changer la sous-etape de decoupe |

**Actions supprimees ou modifiees** :
| Action | Changement |
|--------|------------|
| `setSplitChildrenNumber(n)` | **Supprimee** — le nombre d'enfants est calcule automatiquement |
| `setSplitChildBuildingShape()` | **Supprimee** — les shapes sont calculees par `validateCut()` |
| `updateSplitBuildingShape()` | **Supprimee** — plus d'edition manuelle des shapes |
| `setCurrentChildFromShapeId()` | **A adapter** — les shapes ne sont plus dessinees par l'utilisateur |
| `setCurrentChildSelected()` | **Simplifier** — ne gere plus le mode `drawing`/`updating` pour les shapes |

**Action `validateCut()`** — logique cle :
```
1. Recuperer candidateShape et cutLines depuis le state
2. Appeler splitPolygonByLines(candidateShape, cutLines)
3. Creer N enfants (un par sous-polygone) avec shape pre-remplie
4. Passer a l'etape infos enfants
```

#### 3. `stores/edition/edition-selector.tsx` — MODIFICATION

Le selector `selectSplitChildrenForAPI` reste identique — les enfants ont toujours une `shape` GeoJSON a convertir en WKT.

Ajouter un **nouveau selector** :
```typescript
// Calcule les sous-polygones en temps reel pour l'apercu
export const selectCutPreview = createSelector(
  [(state) => state.edition.split.candidateShape, (state) => state.edition.split.cutLines],
  (candidateShape, cutLines) => {
    if (!candidateShape || cutLines.length === 0) return null;
    return splitPolygonByLines(candidateShape, cutLines);
  }
);
```

#### 4. `components/map/useMapEditBuildingShape.ts` — MODIFICATION

**Changements majeurs** :

- Quand `operation === 'split'` et `cutStep === 'drawing'` :
  - Changer le mode Mapbox Draw en `draw_line_string` (au lieu de `draw_polygon`)
  - Afficher le polygone du batiment candidat (non editable, comme fond de reference)
  - Sur `draw.create` : dispatcher `addCutLine()` au lieu de `setSplitChildBuildingShape()`
  - Rester en mode `draw_line_string` pour permettre de tracer plusieurs lignes
  - Afficher les sous-polygones de l'apercu en surbrillance (via `selectCutPreview`)

- Quand `operation === 'split'` et `cutStep === 'done'` :
  - Afficher les sous-polygones calcules (non editables)
  - Permettre la selection visuelle d'un enfant par clic

**Gestion de `draw.create` pour le split (nouveau)** :
```typescript
if (operation === 'split') {
  // La feature creee est une LineString, pas un Polygon
  dispatch(Actions.edition.addCutLine({
    geometry: e.features[0].geometry,
    featureId: e.features[0].id,
  }));
  // Rester en mode dessin de ligne pour d'autres traits
  drawRef.current.changeMode('draw_line_string');
}
```

**Gestion de `draw.selectionchange` pour le split** :
A adapter — au lieu de selectionner un enfant via `shapeId` d'un polygone dessine, on pourrait permettre de supprimer une ligne de decoupe quand elle est selectionnee.

**Affichage du polygone candidat** :
Quand le split demarre, ajouter la shape du batiment candidat comme feature non-editable sur la carte (via un layer MapLibre dedie, pas via Mapbox Draw).

#### 5. `components/contribution/SplitPanel.tsx` — MODIFICATION

**`SplitBuildingInitialStep`** :
- **Supprimer** le select "En combien de batiments souhaitez-vous scinder ?"
- Apres selection du batiment candidat, passer directement a l'etape de decoupe

**Nouvelle etape : `SplitBuildingCutStep`** (remplace le debut de la boucle ChildInfos) :
```
- Instruction : "Tracez des traits de decoupe sur le batiment"
- Compteur : "X trait(s) trace(s) → Y batiments"
- Bouton "Supprimer le dernier trait"
- Bouton "Tout effacer"
- Apercu des sous-polygones (optionnel : couleurs differentes)
- Bouton "Valider la decoupe" (actif si au moins 1 trait valide)
```

**`SplitBuildingChildInfosStep`** :
- **Supprimer** tout ce qui concerne le dessin de shape (`currentChildHasNoShape`, message "Tracez la geometrie...")
- Les shapes sont deja definies par la decoupe, l'utilisateur ne modifie que statut et adresses
- Ajouter un indicateur visuel montrant quel sous-polygone correspond a l'enfant selectionne

**`SplitBuildingSummaryStep`** :
- La verification `currentChildHasNoShape` n'est plus necessaire car toutes les shapes sont automatiquement generees
- Le reste (commentaire, bouton scinder) reste identique

#### 6. `components/contribution/drawStyle.tsx` — MODIFICATION

Ajouter des styles pour :
- Les lignes de decoupe (style visuel distinct : couleur rouge/orange, ligne pleine, epaisseur visible)
- L'apercu des sous-polygones (couleurs differentes par sous-polygone)

#### 7. `components/map/useEditionMapEvents.ts` — MODIFICATION MINEURE

Le comportement au clic pour la selection du batiment candidat (`splitCandidateId === null`) reste identique.

Changement : une fois le candidat selectionne, il faut **recuperer la shape du batiment** et la stocker dans le state via `setCandidateShape()`. Actuellement seuls le `rnb_id` et la `location` sont stockes.

#### 8. `tests/edition-page.spec.ts` — MODIFICATION

Adapter les tests de scission :
- Remplacer le dessin de 2 polygones par le dessin de 1 ligne de decoupe
- Adapter l'assertion sur le body API (les shapes seront calculees, pas dessinee manuellement)
- Ajouter un test pour le cas "ligne qui ne traverse pas le polygone"

#### 9. `tests/fixtures/pages/edition-page.ts` — MODIFICATION

- Adapter `drawShape()` ou ajouter `drawCutLine()` pour tracer une LineString
- Ajouter `validateCut()` pour cliquer sur le bouton de validation de la decoupe

### Points d'attention

#### 1. Precision geometrique

`turf.lineSplit` est sensible aux erreurs de precision flottante. Utiliser `turf.truncate({ precision: 7 })` systematiquement sur les lignes de decoupe avant le calcul. C'est coherent avec la precision deja utilisee dans `geojsonToReducedPrecisionWKT.ts`.

#### 2. Validation des lignes de decoupe

Une ligne de decoupe doit :
- Traverser le polygone (au moins 2 intersections avec le contour)
- Ne pas simplement toucher un sommet ou longer un bord

Si la ligne ne coupe pas correctement, afficher un message d'erreur et ne pas l'ajouter aux `cutLines`.

#### 3. Decoupe iterative (plusieurs traits)

Quand l'utilisateur trace plusieurs lignes :
```
Polygone initial → Ligne 1 → [PolA, PolB]
[PolA, PolB] → Ligne 2 → [PolA1, PolA2, PolB] (si Ligne 2 ne coupe que PolA)
```
Chaque nouvelle ligne doit etre testee contre tous les sous-polygones existants.

#### 4. Affichage du polygone candidat

Le polygone du batiment candidat doit etre visible pendant le dessin des lignes. Il ne doit **pas** etre editable (pas via Mapbox Draw). Options :
- Ajouter un layer MapLibre dedie avec la geometrie du candidat
- Ou utiliser le feature state `in_panel` deja existant pour le mettre en surbrillance (deja en place dans `useEditionMapEvents.ts`)

#### 5. Recuperation de la shape du batiment candidat

Actuellement, `setSplitCandidateAndLocation()` ne stocke que l'ID et la localisation. Il faut aussi recuperer la shape complète du batiment. Deux options :
- Ajouter la shape dans l'action `setSplitCandidateAndLocation()` — necessite que la shape soit disponible a ce moment
- Faire un fetch de la shape via l'API au moment de la selection — plus fiable (la shape dans le tile vectoriel n'est pas forcement precise)

**La 2eme option est preferable** : utiliser `fetchBuilding(rnbId)` (deja disponible dans `utils/requests.ts`) pour recuperer la shape precise du batiment via l'API.

#### 6. Performance du calcul de l'apercu

Le selector `selectCutPreview` est un `createSelector` memorise. Le recalcul ne se fait que si `candidateShape` ou `cutLines` changent. Comme l'utilisateur n'ajoute que quelques lignes (1 a ~5), la performance ne devrait pas poser probleme.

#### 7. Compatibilite avec l'API existante

Le format d'envoi a l'API (`POST /buildings/{id}/split/`) reste identique :
- `created_buildings` avec `status`, `addresses_cle_interop`, `shape` (WKT)
- La seule difference : les shapes sont calculees cote client au lieu d'etre dessinee manuellement

L'API n'a **pas besoin d'etre modifiee**.

#### 8. Cas limites a gerer

- Batiment avec geometrie `Point` (pas de polygone) : interdire la scission par decoupe (garder le comportement actuel ou afficher un message)
- Polygone avec trous (MultiPolygon) : a evaluer — `turf.polygonToLine` gere les trous mais le resultat peut etre inattendu
- Ligne de decoupe qui passe exactement par un sommet du polygone : source potentielle de bugs avec `lineSplit`
- L'utilisateur trace une ligne courbe (nombreux vertices) : devrait fonctionner mais a tester
