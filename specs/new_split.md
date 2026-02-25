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
