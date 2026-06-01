# Valider un bâtiment depuis l'écran d'édition — Design

Ticket : https://github.com/fab-geocommuns/RNB-site/issues/449
Branche : `validate_in_edit`
Date : 2026-06-01

## Contexte

Le RNB permet déjà d'afficher les validations d'un bâtiment en consultation
(panneau `VisuPanel` → `BuildingPanel`), via le bloc vert « Bâtiment validé »
listant les utilisateurs ayant validé (`validated_by`).

Cette branche ajoute :

1. La possibilité d'**ajouter / retirer sa propre validation** depuis l'écran
   d'édition d'un bâtiment.
2. La **mutualisation** de l'affichage des validations dans un composant React
   dédié, utilisé en consultation (lecture seule) et en édition (avec actions).
3. Le **verrouillage du formulaire d'édition** lorsqu'un bâtiment a déjà au moins
   une validation, avec une case à cocher pour le déverrouiller en avertissant
   que la modification effacera les validations existantes.

## API (back-end RNB)

Endpoint unique de modification d'un bâtiment :

```
PATCH /buildings/{rnb_id}/
```

(via `useRNBFetch`, qui ajoute le header `Authorization: Token …` et le
paramètre `from=site`.)

- **Lecture** : le champ `validated_by` (liste de `PublicUser`) est déjà retourné
  par l'API et présent dans le type `SelectedBuilding`. (Anciennement
  `marked_as_correct`.)
- **Écriture** : champ booléen `is_valid` (anciennement `mark_as_correct`).
  - `{ "is_valid": true }` → l'utilisateur courant ajoute sa validation.
  - `{ "is_valid": false }` → l'utilisateur courant retire sa validation.
- La validation est **par utilisateur** : `validated_by` est l'ensemble des
  utilisateurs ayant validé.
- **Comportement clé** : toute modification de contenu (`status`, `shape`,
  `addresses_cle_interop`) **réinitialise** côté back-end la liste `validated_by`.
  Le front n'a donc **aucun appel supplémentaire** à faire pour « effacer » les
  validations lors d'une édition — c'est automatique.
- Contrainte API : on ne peut pas envoyer `is_valid` **et** `is_active`
  simultanément. Nos appels de validation n'envoient que `is_valid`, donc OK.
- Réponse : `204 No Content`. Il faut donc recharger le bâtiment après l'appel
  pour rafraîchir `validated_by`.

> Note : l'API locale (`localhost:8000`) est à jour avec les noms `validated_by`
> / `is_valid`. La doc GitBook publique peut encore mentionner les anciens noms
> `marked_as_correct` / `mark_as_correct`.

## Composant `BuildingValidations` (nouveau)

Fichier : `components/BuildingValidations.tsx`

### Props

```ts
interface BuildingValidationsProps {
  building: SelectedBuilding; // pour validated_by + rnb_id
  allowEdit: boolean; // false en consultation, true en édition
  // En édition, passé à true quand le formulaire a été déverrouillé pour
  // modification : désactive le bouton de validation (intentions valider vs
  // modifier mutuellement exclusives). Optionnel, défaut false.
  actionsDisabled?: boolean;
}
```

### Comportement

Le composant est **auto-suffisant** : il gère son propre appel API
(`useRNBFetch`), son état de chargement, et le rafraîchissement du bâtiment via
le store. Il connaît l'utilisateur courant via `useRNBAuthentication()`.

- **Affichage des validations** : reprend à l'identique le style vert existant
  (`panel.module.scss` → `.validated`, `.validatedIconShell`, etc.), avec la
  liste des `validated_by` (display_name + organisation entre parenthèses).

- **`allowEdit = false`** (consultation) :
  - Le bloc n'est rendu **que si** `validated_by.length > 0`.
  - Aucun bouton d'action. ⇒ comportement actuel strictement préservé.

- **`allowEdit = true`** (édition) :
  - Le bloc est **toujours rendu** (même si `validated_by` est vide), afin de
    permettre d'être le premier validateur.
  - Un bouton DSFR, selon que l'utilisateur courant a déjà validé ou non :
    - absent de `validated_by` → **« Valider ce bâtiment »** → `PATCH { is_valid: true }`
    - présent dans `validated_by` → **« Retirer ma validation »** → `PATCH { is_valid: false }`
  - Détection « ma validation » :
    `validated_by.some(u => u.username === currentUser.username)`.
  - Pendant l'appel : bouton en état `loading` / désactivé.
  - Après succès : `dispatch(Actions.map.selectBuilding(rnb_id))` +
    `dispatch(Actions.map.reloadBuildings())` pour rafraîchir l'affichage.
  - En cas d'erreur : `toasterError`.

### Couplage avec le verrouillage du formulaire (voir plus bas)

Le bouton « Valider ce bâtiment » est **désactivé** lorsque le formulaire
d'édition a été déverrouillé (`editUnlocked = true`) : les intentions « valider »
et « modifier (donc effacer les validations) » sont mutuellement exclusives.
Le parent d'édition passe pour cela `actionsDisabled={editUnlocked}` (voir
Intégration en édition). En consultation, le prop est omis (`false`).

## Intégration en consultation

Fichier : `components/panel/BuildingPanel.tsx`

Remplacer le bloc vert codé en dur (actuellement ~lignes 97-124) par :

```tsx
<BuildingValidations building={bdg} allowEdit={false} />
```

## Intégration en édition

Fichier : `components/contribution/EditionPanel.tsx`
(composant `EditSelectedBuildingPanelContent` + `BodyPanel`)

### Bloc validation

Ajouter en **haut du corps** (après l'en-tête RNBID / `PanelTabs`) :

```tsx
<BuildingValidations
  building={selectedBuilding}
  allowEdit={true}
  actionsDisabled={editUnlocked}
/>
```

### Verrouillage du formulaire

- Nouvel état local dans `EditSelectedBuildingPanelContent` :
  `const [editUnlocked, setEditUnlocked] = useState(false)`.
- `const hasValidations = selectedBuilding.validated_by.length > 0`.
- `const locked = hasValidations && !editUnlocked`.
- Réinitialiser `editUnlocked` à `false` quand `selectedBuilding` change
  (dans le `useEffect` existant qui réinitialise `newStatus` / `localAddresses`).

### Formulaire grisé en place (approche A)

La zone éditable (`BuildingStatus`, `BuildingAddresses`, `BuildingShape`, et la
textarea commentaire) est enveloppée dans :

```tsx
<fieldset disabled={locked} className={locked ? styles.locked : undefined}>
  … formulaire …
</fieldset>
```

- `fieldset[disabled]` désactive nativement tous les contrôles de formulaire à
  l'intérieur : radios de statut, champ de recherche d'adresse, textarea, et le
  bouton qui déclenche l'édition de la forme sur la carte. Comme l'édition de la
  forme ne peut être amorcée que via ce bouton, la carte reste de fait
  non-éditable.
- Classe CSS `.locked { opacity: 0.5; pointer-events: none; }` pour l'aspect
  grisé et bloquer tout clic résiduel (sécurité).
- Aucune modification des sous-composants `BuildingStatus` / `BuildingAddresses`
  / `BuildingShape`.

### Case à cocher de déverrouillage

Affichée **au-dessus du formulaire**, uniquement quand `hasValidations` :

> ☐ « Je souhaite modifier ce bâtiment et effacer les validations faites par
> **xxx, yyy**. »

- `xxx, yyy` = liste des `display_name` de `validated_by`.
- La cocher → `setEditUnlocked(true)` → `locked = false` → formulaire actif.
- À la soumission d'une modification (`handleSubmit` existant), le back-end
  réinitialise automatiquement `validated_by` ; le `selectBuilding` post-submit
  déjà présent rafraîchit l'état → la case disparaît et le bloc redevient vide.
- Composant DSFR `Checkbox` (`@codegouvfr/react-dsfr/Checkbox`) pour rester
  cohérent avec le reste de l'UI.

### Soumission

Aucun changement de logique sur `handleSubmit` : quand `locked`, aucune
modification n'est possible donc `anyChanges` reste `false` et le bouton
« Valider les modifications » est déjà désactivé. (Le `fieldset disabled` empêche
toute interaction de toute façon.)

## Styles

Fichier : `styles/panel.module.scss` (réutilisé par consultation **et** édition).

- Ajouter le style du bouton/zone d'action de validation dans le bloc vert.
- Ajouter `.locked { opacity: 0.5; pointer-events: none; }`.
- Style de la case à cocher d'avertissement.
- Ajouter les classes manquantes `.user`, `.userName`, `.userOrganization`
  (actuellement référencées par `BuildingPanel` mais absentes du SCSS → rendu non
  stylé). Le nouveau composant les réutilise ; on les définit proprement.

## Tests

- **Composant `BuildingValidations`** :
  - rend la liste des validateurs ;
  - `allowEdit=false` : aucun bouton, et rien si `validated_by` vide ;
  - `allowEdit=true` : bouton « Valider ce bâtiment » si l'utilisateur n'a pas
    validé, « Retirer ma validation » s'il a validé.
- **e2e** (`tests/edition-page.spec.ts`) :
  - formulaire grisé/désactivé quand le bâtiment a une validation ;
  - déverrouillage via la case à cocher → formulaire éditable ;
  - validation puis dévalidation depuis l'écran d'édition.

## Hors périmètre

- La « modal intermédiaire » mentionnée dans le ticket #449 est remplacée par la
  case à cocher inline (décision produit retenue lors du design).
- Pas de validation possible depuis la consultation (`allowEdit=false`) :
  l'ajout/retrait de validation se fait uniquement depuis l'écran d'édition.
