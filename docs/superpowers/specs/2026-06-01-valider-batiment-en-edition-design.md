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
}
```

### Comportement

**Aucun appel API au montage / à l'initialisation.** Le composant ne consulte
jamais l'API pour récupérer le bâtiment : il reçoit en prop `building` la donnée
**déjà affichée** dans le panneau latéral (le `selectedItem` du store map). Il en
dérive `validated_by` directement.

Le seul appel réseau que le composant déclenche est l'**écriture** (PATCH
`is_valid`) provoquée par un clic de l'utilisateur sur le bouton de validation
(uniquement en `allowEdit=true`). Il utilise pour cela `useRNBFetch`, gère son
propre état de chargement, et connaît l'utilisateur courant via
`useRNBAuthentication()`.

- **Affichage des validations** : reprend à l'identique le style vert existant
  (`panel.module.scss` → `.validated`, `.validatedIconShell`, etc.), avec la
  liste des `validated_by` (display_name + organisation entre parenthèses).
  Donnée lue depuis la prop `building` (store), sans aucune requête.

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
  - Après succès (204) : rafraîchissement (voir section dédiée ci-dessous).
  - En cas d'erreur : `toasterError`.

### Rafraîchissement après écriture (validation / retrait / édition)

Les écritures renvoient `204 No Content` : aucune donnée n'est retournée. Le store
(`selectedItem`) contient donc encore l'ancien `validated_by` juste après l'appel.
On **ne fait pas d'update optimiste** ; on récupère la donnée autoritative en
re-consultant le bâtiment.

- **Après validation / retrait de validation** (PATCH `is_valid`) : le composant
  `dispatch(Actions.map.selectBuilding(rnb_id))`. Ce thunk re-consulte le bâtiment
  (`GET /buildings/{rnb_id}/`) et remplace `selectedItem` dans le store ; la nouvelle
  liste `validated_by` (avec les `display_name` / organisations corrects) est alors
  propagée à tous les composants qui lisent le store, y compris `BuildingValidations`.
  Ce re-fetch est volontaire et distinct de l'interdiction d'appel **au montage** :
  il n'a lieu qu'en réponse à une action explicite de l'utilisateur.
  - `reloadBuildings()` n'est ajouté **que si** l'état de validation modifie le rendu
    cartographique d'un bâtiment (à vérifier à l'implémentation ; a priori non
    nécessaire car la validation ne change ni la géométrie ni le statut).

- **Après édition du bâtiment** (soumission du formulaire, `handleSubmit`
  existant) : le flux actuel `dispatch(selectBuilding(rnbId))` +
  `dispatch(reloadBuildings())` est **conservé tel quel**. Comme le back-end
  réinitialise `validated_by` lors d'une modification, le re-fetch ramène une liste
  vide et le bloc de validation se met à jour automatiquement. Aucune logique
  supplémentaire n'est nécessaire.

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
<BuildingValidations building={selectedBuilding} allowEdit={true} />
```

### Verrouillage du formulaire

- Nouvel état local dans `EditSelectedBuildingPanelContent` :
  `const [editUnlocked, setEditUnlocked] = useState(false)`.
- `const hasValidations = selectedBuilding.validated_by.length > 0`.
- `const locked = hasValidations && !editUnlocked`.
- Réinitialiser `editUnlocked` à `false` quand `selectedBuilding` change
  (dans le `useEffect` existant qui réinitialise `newStatus` / `localAddresses`).

### Vue lecture seule, puis bascule vers le formulaire

Quand `locked` (le bâtiment a au moins une validation et la case n'est pas
cochée), on **n'affiche pas le formulaire** : on présente les données en
**lecture seule, comme dans le panneau de consultation**, suivies de la case à
cocher. Cocher la case **remplace** la vue lecture seule + la case par le
formulaire d'édition complet.

```tsx
{locked ? (
  <>
    {/* Lecture seule, mêmes composants/markup que la consultation */}
    <section> « Statut du bâtiment » → <ContributionStatusPicker currentStatus={selectedBuilding.status} /> </section>
    <section> « Adresses » → <BuildingAdresses adresses={selectedBuilding.addresses} /> </section>
    <Checkbox … case à cocher de déverrouillage … />
  </>
) : (
  <>
    <BuildingStatus … />
    <BuildingAddresses … />
    <BuildingShape … />
    {/* textarea commentaire */}
  </>
)}
```

- Composants réutilisés de la consultation (aucun nouveau composant) :
  `ContributionStatusPicker` (`components/panel/ContributionStatusPicker`) et
  `BuildingAdresses` (`components/panel/adresse/BuildingAdresses`), avec le même
  markup de section que `BuildingPanel` (`<h2 class="sectionTitle">` +
  `<div class="sectionBody">`).
- Données lecture seule = valeurs **persistées** `selectedBuilding.status` /
  `selectedBuilding.addresses` (cohérent avec la consultation).
- **Plus de `<fieldset disabled>` ni de greyage** : le masquage du formulaire
  est un simple rendu conditionnel. La classe SCSS `.locked` n'est plus
  nécessaire.
- Le bloc `BuildingValidations` (vert) est affiché **au-dessus** tant que la case
  n'est pas cochée ; **il est masqué une fois la case cochée** (`editUnlocked`),
  pendant l'édition (rendu : `{!editUnlocked && <BuildingValidations … />}`).
- Le bloc de (dés)activation `BuildingActivationToggle` est **masqué tant que la
  case n'est pas cochée** sur un bâtiment actif validé, c.-à-d. quand
  `isActive && locked`. Il reste visible sinon — notamment sur un bâtiment déjà
  **désactivé** (pour permettre la réactivation) et une fois la case cochée.
- Aucune modification des sous-composants d'édition `BuildingStatus` /
  `BuildingAddresses` / `BuildingShape`.

### Case à cocher de déverrouillage

Affichée **sous les données en lecture seule**, uniquement quand `locked` :

> ☐ « Je souhaite modifier ce bâtiment et effacer les validations faites par
> **xxx, yyy**. »

- `xxx, yyy` = liste des `display_name` de `validated_by`
  (`formatValidatorNames`).
- La cocher → `setEditUnlocked(true)` → `locked = false` → la vue lecture seule
  et la case sont remplacées par le formulaire d'édition.
- À la soumission d'une modification (`handleSubmit` existant), le back-end
  réinitialise automatiquement `validated_by` ; le `selectBuilding` post-submit
  déjà présent rafraîchit l'état → retour à l'état non validé.
- Composant DSFR `Checkbox` (`@codegouvfr/react-dsfr/Checkbox`).

### Soumission

Aucun changement de logique sur `handleSubmit` : quand `locked`, le formulaire
n'est pas rendu, donc aucune modification n'est possible et le bouton « Valider
les modifications » du pied de panneau reste désactivé (`anyChanges` reste
`false`).

## Styles

Fichier : `styles/panel.module.scss` (réutilisé par consultation **et** édition).

- Ajouter le style du bouton/zone d'action de validation dans le bloc vert.
- Style de la case à cocher d'avertissement (`.unlockNotice`).
- (La classe `.locked` n'est plus utilisée : l'ancien greyage par `<fieldset>`
  est remplacé par une vue lecture seule en rendu conditionnel.)
- Ajouter les classes manquantes `.user`, `.userName`, `.userOrganization`
  (actuellement référencées par `BuildingPanel` mais absentes du SCSS → rendu non
  stylé). Le nouveau composant les réutilise ; on les définit proprement.

## Tests

- **Composant `BuildingValidations`** :
  - rend la liste des validateurs ;
  - `allowEdit=false` : aucun bouton, et rien si `validated_by` vide ;
  - `allowEdit=true` : bouton « Valider ce bâtiment » si l'utilisateur n'a pas
    validé, « Retirer ma validation » s'il a validé.
- **e2e** (`tests/validation-edition.spec.ts`) :
  - bâtiment validé en édition → données Statut/Adresses en lecture seule, **pas
    de champ de formulaire** (`<select>` absent), case à cocher visible ;
  - cocher la case → le formulaire apparaît (le `<select>` de statut devient
    présent) ;
  - validation puis dévalidation depuis l'écran d'édition.

## Hors périmètre

- La « modal intermédiaire » mentionnée dans le ticket #449 est remplacée par la
  case à cocher inline (décision produit retenue lors du design).
- Pas de validation possible depuis la consultation (`allowEdit=false`) :
  l'ajout/retrait de validation se fait uniquement depuis l'écran d'édition.
