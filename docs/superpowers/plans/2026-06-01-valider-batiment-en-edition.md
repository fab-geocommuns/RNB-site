# Valider un bâtiment depuis l'édition — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre d'ajouter / retirer sa validation d'un bâtiment depuis l'écran d'édition, mutualiser l'affichage des validations dans un composant React partagé, et verrouiller le formulaire d'édition (grisé + case à cocher) tant qu'un bâtiment a au moins une validation.

**Architecture:** Un composant `BuildingValidations` (prop `allowEdit`) lit `validated_by` depuis le store (jamais d'appel au montage) et déclenche, sur clic, un `PATCH {is_valid}` puis un re-`GET` via `selectBuilding`. En édition, le formulaire est enveloppé dans un `<fieldset disabled>` grisé tant que `validated_by.length > 0` et que la case à cocher de déverrouillage n'est pas cochée.

**Tech Stack:** Next.js (App Router), React, Redux Toolkit, `@codegouvfr/react-dsfr`, Vitest (unit), Playwright (e2e).

**Spec de référence:** `docs/superpowers/specs/2026-06-01-valider-batiment-en-edition-design.md`

**Note sur les tests:** le projet n'a pas d'infra de test composant React (`@testing-library/react` absent). On teste donc : (1) la logique pure en **Vitest**, (2) les comportements UI bout-en-bout en **Playwright**. Pour rendre les e2e déterministes, on mocke la réponse `GET` du bâtiment (l'utilitaire `http-mock` est étendu pour enchaîner plusieurs requêtes).

---

## Structure des fichiers

| Fichier                                               | Rôle                                                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `utils/validations.ts` (créer)                        | Helpers purs : `hasUserValidated`, `formatValidatorNames`                             |
| `utils/validations.test.ts` (créer)                   | Tests Vitest des helpers                                                              |
| `components/BuildingValidations.tsx` (créer)          | Composant partagé d'affichage + actions de validation                                 |
| `styles/panel.module.scss` (modifier)                 | Classes `.user*`, `.validationAction`, `.validationEmpty`, `.locked`, `.unlockNotice` |
| `components/panel/BuildingPanel.tsx` (modifier)       | Utilise `BuildingValidations` (consultation)                                          |
| `components/contribution/EditionPanel.tsx` (modifier) | Monte le composant + verrouillage (fieldset/checkbox)                                 |
| `tests/fixtures/utils/http-mock.ts` (modifier)        | Ajoute `mockAPIRoutes` (multi-requêtes)                                               |
| `tests/fixtures/data/building.ts` (créer)             | Fabrique de réponse bâtiment pour les mocks                                           |
| `tests/fixtures/pages/edition-page.ts` (modifier)     | Locators + helpers de validation + `getCurrentUsername`                               |
| `tests/validation-edition.spec.ts` (créer)            | E2e : verrouillage, validation, retrait                                               |

---

## Task 1: Helpers purs de validation (Vitest, TDD)

**Files:**

- Create: `utils/validations.ts`
- Test: `utils/validations.test.ts`

- [ ] **Step 1: Écrire le test qui échoue**

Créer `utils/validations.test.ts` :

```ts
import { describe, it, expect } from 'vitest';
import { hasUserValidated, formatValidatorNames } from './validations';
import { PublicUser } from '@/stores/map/map-slice';

const user = (over: Partial<PublicUser>): PublicUser => ({
  id: 1,
  display_name: 'Jean Dupont',
  username: 'jdupont',
  organization_name: 'IGN',
  ...over,
});

describe('hasUserValidated', () => {
  it('retourne false si la liste est vide', () => {
    expect(hasUserValidated([], 'jdupont')).toBe(false);
  });

  it('retourne false si username est undefined', () => {
    expect(hasUserValidated([user({ username: 'jdupont' })], undefined)).toBe(
      false,
    );
  });

  it('retourne true si l’utilisateur courant est dans la liste', () => {
    expect(
      hasUserValidated(
        [user({ username: 'autre' }), user({ username: 'jdupont' })],
        'jdupont',
      ),
    ).toBe(true);
  });

  it('retourne false si l’utilisateur courant n’est pas dans la liste', () => {
    expect(hasUserValidated([user({ username: 'autre' })], 'jdupont')).toBe(
      false,
    );
  });
});

describe('formatValidatorNames', () => {
  it('retourne une chaîne vide pour une liste vide', () => {
    expect(formatValidatorNames([])).toBe('');
  });

  it('liste un seul nom', () => {
    expect(formatValidatorNames([user({ display_name: 'Jean Dupont' })])).toBe(
      'Jean Dupont',
    );
  });

  it('joint plusieurs noms par des virgules', () => {
    expect(
      formatValidatorNames([
        user({ id: 1, display_name: 'Jean Dupont' }),
        user({ id: 2, display_name: 'Marie Martin' }),
      ]),
    ).toBe('Jean Dupont, Marie Martin');
  });
});
```

- [ ] **Step 2: Lancer le test pour vérifier qu’il échoue**

Run: `pnpm exec vitest run utils/validations.test.ts`
Expected: FAIL — `Failed to resolve import "./validations"` (le module n’existe pas encore).

- [ ] **Step 3: Implémenter le module**

Créer `utils/validations.ts` :

```ts
import { PublicUser } from '@/stores/map/map-slice';

/**
 * Indique si l'utilisateur courant (identifié par son username) fait partie
 * des validateurs du bâtiment.
 */
export function hasUserValidated(
  validatedBy: PublicUser[],
  username: string | undefined,
): boolean {
  if (!username) return false;
  return validatedBy.some((u) => u.username === username);
}

/**
 * Formate la liste des validateurs en une énumération de noms d'affichage
 * séparés par des virgules. Ex : "Jean Dupont, Marie Martin".
 */
export function formatValidatorNames(validatedBy: PublicUser[]): string {
  return validatedBy.map((u) => u.display_name).join(', ');
}
```

- [ ] **Step 4: Lancer le test pour vérifier qu’il passe**

Run: `pnpm exec vitest run utils/validations.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add utils/validations.ts utils/validations.test.ts
git commit -m "feat: helpers purs de validation de bâtiment (#449)"
```

---

## Task 2: Styles du bloc de validation

**Files:**

- Modify: `styles/panel.module.scss`

Ces classes sont consommées par le composant de la Task 3 et l'intégration édition de la Task 5. Les classes `.user`, `.userName`, `.userOrganization` sont aujourd'hui référencées par `BuildingPanel.tsx` mais absentes du SCSS.

- [ ] **Step 1: Ajouter les classes**

Dans `styles/panel.module.scss`, après le bloc `.validatedIconShell { … }` (vers la ligne 156), ajouter :

```scss
.user {
  margin-bottom: 0.2rem;
  &:last-child {
    margin-bottom: 0;
  }
}

.userName {
  font-weight: 500;
}

.userOrganization {
  opacity: 0.8;
}

.validationAction {
  margin-top: 0.8rem;
}

.validationEmpty {
  display: flex;
  align-items: center;
  background: #f6f6f6;
  padding: 1rem 0.8rem 1rem 1rem;
  border-radius: 4px;
  color: #3a3a3a;
}

.locked {
  opacity: 0.5;
  pointer-events: none;
}

.unlockNotice {
  margin-bottom: 1rem;
}
```

- [ ] **Step 2: Vérifier la compilation des styles**

Run: `pnpm lint`
Expected: PASS (pas d'erreur de lint introduite).

- [ ] **Step 3: Commit**

```bash
git add styles/panel.module.scss
git commit -m "style: classes pour le bloc de validation et le verrouillage (#449)"
```

---

## Task 3: Composant `BuildingValidations`

**Files:**

- Create: `components/BuildingValidations.tsx`

Composant partagé. En consultation (`allowEdit=false`) : affichage seul, et rien si aucune validation. En édition (`allowEdit=true`) : toujours rendu, avec un bouton valider/retirer. Aucun appel au montage : `validated_by` vient de la prop `building` (store). Le seul appel réseau est le `PATCH {is_valid}` sur clic, suivi d'un re-`GET` via `selectBuilding`.

- [ ] **Step 1: Créer le composant**

Créer `components/BuildingValidations.tsx` :

```tsx
'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Button from '@codegouvfr/react-dsfr/Button';

import { Actions, AppDispatch } from '@/stores/store';
import {
  SelectedBuilding,
  PublicUser,
  bdgApiUrl,
} from '@/stores/map/map-slice';
import { useRNBFetch } from '@/utils/useRNBFetch';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';
import { hasUserValidated } from '@/utils/validations';
import {
  toasterError,
  toasterSuccess,
} from '@/components/contribution/toaster';

import panelStyles from '@/styles/panel.module.scss';

interface BuildingValidationsProps {
  building: SelectedBuilding;
  allowEdit: boolean;
}

export default function BuildingValidations({
  building,
  allowEdit,
}: BuildingValidationsProps) {
  const dispatch: AppDispatch = useDispatch();
  const { fetch } = useRNBFetch();
  const { user } = useRNBAuthentication();
  const [isLoading, setIsLoading] = useState(false);

  const validatedBy = building.validated_by;
  const userHasValidated = hasUserValidated(validatedBy, user?.username);

  // En consultation, rien à afficher s'il n'y a aucune validation.
  if (!allowEdit && validatedBy.length === 0) return null;

  const setValidation = async (isValid: boolean) => {
    setIsLoading(true);
    try {
      const response = await fetch(bdgApiUrl(`${building.rnb_id}/`), {
        method: 'PATCH',
        body: JSON.stringify({ is_valid: isValid }),
      });
      if (!response.ok) {
        toasterError(
          dispatch,
          'Erreur lors de la mise à jour de la validation',
        );
      } else {
        toasterSuccess(
          dispatch,
          isValid ? 'Validation enregistrée' : 'Validation retirée',
        );
        // Re-consultation du bâtiment pour rafraîchir validated_by (réponse 204).
        await dispatch(Actions.map.selectBuilding(building.rnb_id));
      }
    } catch (err: any) {
      toasterError(
        dispatch,
        err.message || 'Erreur lors de la mise à jour de la validation',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const actionButton = allowEdit && user && (
    <div className={panelStyles.validationAction}>
      <Button
        size="small"
        priority={userHasValidated ? 'tertiary' : 'primary'}
        disabled={isLoading}
        onClick={() => setValidation(!userHasValidated)}
      >
        {userHasValidated ? 'Retirer ma validation' : 'Valider ce bâtiment'}
      </Button>
    </div>
  );

  // Cas édition sans aucune validation : bloc neutre + bouton "Valider".
  if (validatedBy.length === 0) {
    return (
      <div className={panelStyles.section}>
        <div className={panelStyles.validationEmpty}>
          <div>
            <h2 className={panelStyles.sectionTitle}>Bâtiment non validé</h2>
            <div className={panelStyles.sectionBody}>
              <span>Aucune validation pour le moment.</span>
              {actionButton}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Cas avec validations : bloc vert (style existant) + liste + bouton éventuel.
  return (
    <div className={panelStyles.section}>
      <div className={panelStyles.validated}>
        <div className={panelStyles.validatedIconShell}>
          <i className="fr-icon-success-fill" aria-hidden="true"></i>
        </div>
        <div>
          <h2 className={panelStyles.sectionTitle}>Bâtiment validé</h2>
          <div className={panelStyles.sectionBody}>
            {validatedBy.map((u: PublicUser) => (
              <div key={u.id} className={panelStyles.user}>
                <span>
                  <span className={panelStyles.userName}>
                    par {u.display_name}
                  </span>{' '}
                  {u.organization_name && (
                    <span className={panelStyles.userOrganization}>
                      ({u.organization_name})
                    </span>
                  )}
                </span>
              </div>
            ))}
            {actionButton}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Vérifier types et lint**

Run: `npx tsc --noEmit -p tsconfig.json && pnpm lint`
Expected: PASS (aucune erreur de type/lint).

- [ ] **Step 3: Commit**

```bash
git add components/BuildingValidations.tsx
git commit -m "feat: composant BuildingValidations (affichage + valider/retirer) (#449)"
```

---

## Task 4: Utiliser le composant en consultation

**Files:**

- Modify: `components/panel/BuildingPanel.tsx`

Remplacer le bloc vert codé en dur par le composant en `allowEdit=false` (comportement strictement identique : rien si pas de validation).

- [ ] **Step 1: Importer le composant**

Dans `components/panel/BuildingPanel.tsx`, ajouter l'import après les autres imports de composants (vers la ligne 15) :

```tsx
import BuildingValidations from '@/components/BuildingValidations';
```

- [ ] **Step 2: Remplacer le bloc vert**

Remplacer ce bloc (actuellement ~lignes 97-124) :

```tsx
{
  bdg.validated_by.length > 0 && (
    <div className={panelStyles.section}>
      <div className={panelStyles.validated}>
        <div className={panelStyles.validatedIconShell}>
          <i className="fr-icon-success-fill" aria-hidden="true"></i>
        </div>
        <div>
          <h2 className={panelStyles.sectionTitle}>Bâtiment validé</h2>
          <div className={panelStyles.sectionBody}>
            {bdg.validated_by.map((user: PublicUser) => (
              <div key={user.id} className={panelStyles.user}>
                <span>
                  <span className={panelStyles.userName}>
                    par {user.display_name}
                  </span>{' '}
                  {user.organization_name && (
                    <span className={panelStyles.userOrganization}>
                      ({user.organization_name})
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

par :

```tsx
<BuildingValidations building={bdg} allowEdit={false} />
```

- [ ] **Step 3: Nettoyer l'import inutilisé**

`PublicUser` n'est probablement plus utilisé dans ce fichier après le remplacement. Vérifier l'import en tête de fichier :

```tsx
import {
  bdgApiUrl,
  Plot,
  PublicUser,
  SelectedBuilding,
} from '@/stores/map/map-slice';
```

Si `PublicUser` n'est plus référencé ailleurs dans le fichier, le retirer de l'import :

```tsx
import { bdgApiUrl, Plot, SelectedBuilding } from '@/stores/map/map-slice';
```

- [ ] **Step 4: Vérifier types et lint**

Run: `npx tsc --noEmit -p tsconfig.json && pnpm lint`
Expected: PASS (en particulier, aucune erreur "PublicUser is declared but never used").

- [ ] **Step 5: Commit**

```bash
git add components/panel/BuildingPanel.tsx
git commit -m "refactor: BuildingPanel utilise BuildingValidations (#449)"
```

---

## Task 5: Intégration en édition (verrouillage + montage du composant)

**Files:**

- Modify: `components/contribution/EditionPanel.tsx`

Monter `BuildingValidations` en haut du corps (édition), ajouter l'état de verrouillage, la case à cocher de déverrouillage et l'enveloppe `fieldset` grisée.

- [ ] **Step 1: Ajouter les imports**

Dans `components/contribution/EditionPanel.tsx`, ajouter en tête (avec les autres imports) :

```tsx
import { Checkbox } from '@codegouvfr/react-dsfr/Checkbox';
import BuildingValidations from '@/components/BuildingValidations';
import { formatValidatorNames } from '@/utils/validations';
```

- [ ] **Step 2: Ajouter l'état de verrouillage dans `EditSelectedBuildingPanelContent`**

Dans `EditSelectedBuildingPanelContent`, à côté des autres `useState` (après `localAddresses`, ~ligne 58), ajouter :

```tsx
const [editUnlocked, setEditUnlocked] = useState<boolean>(false);
const hasValidations = selectedBuilding.validated_by.length > 0;
const locked = hasValidations && !editUnlocked;
```

- [ ] **Step 3: Réinitialiser le déverrouillage quand le bâtiment change**

Dans le `useEffect` existant qui réinitialise `newStatus` / `localAddresses` (~ligne 84), ajouter la ligne `setEditUnlocked(false)` :

```tsx
useEffect(() => {
  setNewStatus(selectedBuilding.status);
  setLocalAddresses(selectedBuilding.addresses);
  setEditUnlocked(false);
}, [selectedBuilding]);
```

- [ ] **Step 4: Passer les nouvelles props à `BodyPanel`**

Dans le rendu de `EditSelectedBuildingPanelContent`, modifier l'appel `<BodyPanel … />` pour ajouter `locked`, `editUnlocked`, `setEditUnlocked` (conserver toutes les props existantes) :

```tsx
<BodyPanel
  rnbId={rnbId}
  isLoading={isLoading}
  isActive={isActive}
  newStatus={newStatus}
  selectedBuilding={selectedBuilding}
  localAddresses={localAddresses}
  shapeInteractionMode={shapeInteractionMode}
  commentValue={commentValue}
  setNewStatus={setNewStatus}
  handleEditAddress={handleEditAddress}
  handleChange={handleChange}
  toggleBuildingActivation={toggleBuildingActivation}
  locked={locked}
  editUnlocked={editUnlocked}
  setEditUnlocked={setEditUnlocked}
/>
```

- [ ] **Step 5: Étendre la signature de `BodyPanel`**

Dans la définition de `function BodyPanel({ … })`, ajouter les trois props à la déstructuration et au type :

```tsx
function BodyPanel({
  rnbId,
  isLoading,
  isActive,
  newStatus,
  selectedBuilding,
  localAddresses,
  shapeInteractionMode,
  commentValue,
  setNewStatus,
  handleEditAddress,
  handleChange,
  toggleBuildingActivation,
  locked,
  editUnlocked,
  setEditUnlocked,
}: {
  rnbId: string;
  isLoading: boolean;
  isActive: boolean;
  newStatus: BuildingStatusType;
  selectedBuilding: SelectedBuilding;
  localAddresses: BuildingAddressType[];
  shapeInteractionMode: ShapeInteractionMode;
  commentValue: string;
  setNewStatus: (status: BuildingStatusType) => void;
  handleEditAddress: (addresses: BuildingAddressType[]) => void;
  handleChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  toggleBuildingActivation: (isActive: boolean) => void;
  locked: boolean;
  editUnlocked: boolean;
  setEditUnlocked: (value: boolean) => void;
}) {
```

- [ ] **Step 6: Monter le composant + checkbox + fieldset dans le corps `isActive`**

Dans `BodyPanel`, remplacer le bloc `isActive && ( … )` actuel :

```tsx
isActive && (
  <>
    <BuildingStatus status={newStatus} onChange={setNewStatus}></BuildingStatus>
    <BuildingAddresses
      buildingPoint={selectedBuilding.point.coordinates}
      addresses={localAddresses}
      onChange={handleEditAddress}
    />
    <BuildingShape
      shapeInteractionMode={shapeInteractionMode}
      selectedBuilding={selectedBuilding}
    ></BuildingShape>
    <div className={`${styles.panelSection}`}>
      <div className={`fr-text--xs ${styles.sectionTitle}`}>
        <label htmlFor="comment">Commentaire</label>
      </div>
      <textarea
        value={commentValue}
        onChange={handleChange}
        id="comment"
        name="text"
        className={`fr-text--sm fr-input fr-mb-4v ${styles.textarea}`}
        placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ? Laissez un commentaire ici."
      />
    </div>
  </>
);
```

par (ajoute `BuildingValidations`, la `Checkbox` de déverrouillage, et l'enveloppe `<fieldset>`) :

```tsx
isActive && (
  <>
    <BuildingValidations building={selectedBuilding} allowEdit={true} />
    {locked && (
      <Checkbox
        className={panelStyles.unlockNotice}
        options={[
          {
            label: `Je souhaite modifier ce bâtiment et effacer les validations faites par ${formatValidatorNames(
              selectedBuilding.validated_by,
            )}.`,
            nativeInputProps: {
              checked: editUnlocked,
              onChange: (e) => setEditUnlocked(e.target.checked),
            },
          },
        ]}
      />
    )}
    <fieldset
      disabled={locked}
      className={locked ? panelStyles.locked : undefined}
      style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
    >
      <BuildingStatus
        status={newStatus}
        onChange={setNewStatus}
      ></BuildingStatus>
      <BuildingAddresses
        buildingPoint={selectedBuilding.point.coordinates}
        addresses={localAddresses}
        onChange={handleEditAddress}
      />
      <BuildingShape
        shapeInteractionMode={shapeInteractionMode}
        selectedBuilding={selectedBuilding}
      ></BuildingShape>
      <div className={`${styles.panelSection}`}>
        <div className={`fr-text--xs ${styles.sectionTitle}`}>
          <label htmlFor="comment">Commentaire</label>
        </div>
        <textarea
          value={commentValue}
          onChange={handleChange}
          id="comment"
          name="text"
          className={`fr-text--sm fr-input fr-mb-4v ${styles.textarea}`}
          placeholder="Vous souhaitez signaler quelque chose à propos d'un bâtiment ? Laissez un commentaire ici."
        />
      </div>
    </fieldset>
  </>
);
```

Note : la `Checkbox` est **hors** du `fieldset` (sinon elle serait désactivée et ne pourrait pas déverrouiller).

- [ ] **Step 7: Importer `panelStyles`**

`BodyPanel` utilise maintenant `panelStyles` (pour `.unlockNotice` et `.locked`). En tête du fichier, vérifier/ajouter l'import du module de styles panel (le fichier importe déjà `styles` depuis `editPanel.module.scss`) :

```tsx
import panelStyles from '@/styles/panel.module.scss';
```

- [ ] **Step 8: Vérifier types et lint**

Run: `npx tsc --noEmit -p tsconfig.json && pnpm lint`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add components/contribution/EditionPanel.tsx
git commit -m "feat: validation + verrouillage du formulaire en édition (#449)"
```

---

## Task 6: Étendre l'utilitaire de mock HTTP (multi-requêtes)

**Files:**

- Modify: `tests/fixtures/utils/http-mock.ts`

L'actuel `mockAPIRequest` ne gère qu'une requête et ne « continue » pas les requêtes non-matchées (ce qui bloquerait la navigation si on mocke avant `goto`). On ajoute `mockAPIRoutes` : un **seul** handler qui matche plusieurs définitions, `fulfill` sur match, `route.continue()` sinon (quand `allowOtherAPIRequests`).

- [ ] **Step 1: Ajouter le type et la méthode**

Dans `tests/fixtures/utils/http-mock.ts`, ajouter le type `RouteMock` après `MockResponse` :

```ts
export type RouteMock = {
  method: string;
  path: string; // chemin relatif après /api/alpha, ex: "/buildings/ID/?from=site"
  body?: any | null; // si fourni, assert sur le corps de la requête
  response: MockResponse;
};
```

Puis, à l'intérieur de la classe `HttpMocker`, ajouter la méthode (après `mockAPIRequest`) :

```ts
  /**
   * Mocke plusieurs routes via un seul handler.
   * - match (méthode + chemin) -> fulfill avec la réponse fournie
   * - non-match + allowOtherAPIRequests -> route.continue() (réseau réel, ex: tuiles)
   * - non-match sinon -> abort + throw
   * Le dernier appel à mockAPIRoutes prend la priorité (Playwright: handler le plus récent).
   */
  async mockAPIRoutes(
    mocks: RouteMock[],
    allowOtherAPIRequests: boolean = false,
  ) {
    await this.page.route('**/api/alpha/**', async (route, request) => {
      const url = new URL(request.url());
      const fullPath = url.pathname + url.search;
      const match = mocks.find(
        (m) =>
          fullPath === '/api/alpha' + m.path && request.method() === m.method,
      );

      if (match) {
        if (match.body) {
          expect(request.postDataJSON()).toMatchObject(match.body);
        }
        await route.fulfill({
          status: match.response.status || 200,
          headers: {
            'Content-Type': 'application/json',
            ...match.response.headers,
          },
          body:
            typeof match.response.body === 'string'
              ? match.response.body
              : JSON.stringify(match.response.body),
        });
        return;
      }

      if (allowOtherAPIRequests) {
        await route.continue();
        return;
      }

      await route.abort();
      throw new Error(
        `Unexpected API request: ${request.method()} ${url}. Set allowOtherAPIRequests=true to allow other API requests.`,
      );
    });
  }
```

- [ ] **Step 2: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/utils/http-mock.ts
git commit -m "test: mockAPIRoutes multi-requêtes dans http-mock (#449)"
```

---

## Task 7: Fabrique de réponse bâtiment pour les mocks

**Files:**

- Create: `tests/fixtures/data/building.ts`

Une fonction qui produit une réponse `GET /buildings/{id}/` complète et valide pour le rendu du panneau d'édition (statut, point, shape Polygon, adresses vides, validated_by paramétrable).

- [ ] **Step 1: Créer la fabrique**

Créer `tests/fixtures/data/building.ts` :

```ts
import { PublicUser } from '@/stores/map/map-slice';

type BuildingResponseOverrides = {
  rnb_id?: string;
  status?: string;
  is_active?: boolean;
  validated_by?: PublicUser[];
  addresses?: any[];
};

/**
 * Réponse JSON d'un GET /buildings/{id}/ suffisamment complète pour rendre
 * le panneau d'édition. La clé est `validated_by` (nom à jour de l'API).
 */
export function makeBuildingResponse(
  overrides: BuildingResponseOverrides = {},
) {
  return {
    rnb_id: 'PG46YY6YWCX8',
    status: 'constructed',
    is_active: true,
    point: { type: 'Point', coordinates: [2.424, 48.8452] },
    shape: {
      type: 'Polygon',
      coordinates: [
        [
          [2.423721634213109, 48.84523835886833],
          [2.4237562502758863, 48.84539782325717],
          [2.4242824144108397, 48.84534770593274],
          [2.4242477983494553, 48.84518368524684],
          [2.423721634213109, 48.84523835886833],
        ],
      ],
    },
    addresses: [],
    validated_by: [],
    ext_ids: [],
    plots: [],
    ...overrides,
  };
}

/** Un validateur fictif (utilisé pour les listes validated_by). */
export function makeValidator(over: Partial<PublicUser> = {}): PublicUser {
  return {
    id: 1,
    display_name: 'Camille Témoin',
    username: 'ctemoin',
    organization_name: 'Organisation Test',
    ...over,
  };
}
```

- [ ] **Step 2: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/data/building.ts
git commit -m "test: fabrique de réponse bâtiment pour les mocks (#449)"
```

---

## Task 8: Helpers et locators de la page d'édition

**Files:**

- Modify: `tests/fixtures/pages/edition-page.ts`

Ajouter les locators (bouton valider/retirer, case à cocher, select de statut) et un helper `getCurrentUsername` (lecture de la session NextAuth au runtime, car l'username du compte de test n'est pas connu statiquement).

- [ ] **Step 1: Ajouter locators et helpers**

Dans la classe `EditionPage` de `tests/fixtures/pages/edition-page.ts`, ajouter ces membres (par exemple après `deactivateBuilding`) :

```ts
  get validateButton(): Locator {
    return this.panel.getByRole('button', { name: /Valider ce bâtiment/i });
  }

  get removeValidationButton(): Locator {
    return this.panel.getByRole('button', { name: /Retirer ma validation/i });
  }

  get unlockCheckbox(): Locator {
    return this.panel.getByRole('checkbox', {
      name: /Je souhaite modifier ce bâtiment/i,
    });
  }

  get statusSelect(): Locator {
    // Le select de statut (BuildingStatus) est le premier select du formulaire.
    return this.panel.locator('select').first();
  }

  async clickValidate() {
    await this.validateButton.scrollIntoViewIfNeeded();
    await this.validateButton.click();
  }

  async clickRemoveValidation() {
    await this.removeValidationButton.scrollIntoViewIfNeeded();
    await this.removeValidationButton.click();
  }

  /** Username de l'utilisateur connecté, lu depuis la session NextAuth. */
  async getCurrentUsername(): Promise<string> {
    const res = await this.page.request.get('/api/auth/session');
    const json = await res.json();
    return json.username;
  }
```

- [ ] **Step 2: Vérifier les types**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add tests/fixtures/pages/edition-page.ts
git commit -m "test: locators et helpers de validation pour EditionPage (#449)"
```

---

## Task 9: E2e — verrouillage du formulaire

**Files:**

- Create: `tests/validation-edition.spec.ts`

Bâtiment validé (par un autre utilisateur) → formulaire grisé/désactivé ; cocher la case déverrouille.

- [ ] **Step 1: Écrire le test**

Créer `tests/validation-edition.spec.ts` :

```ts
import { expect } from '@playwright/test';
import { test } from '@/tests/fixtures';
import {
  makeBuildingResponse,
  makeValidator,
} from '@/tests/fixtures/data/building';

const BUILDING_ID = 'PG46YY6YWCX8';
const GET_PATH = `/buildings/${BUILDING_ID}/?from=site&withPlots=1`;
const PATCH_PATH = `/buildings/${BUILDING_ID}/?from=site`;

test.describe('Validation depuis l’édition', () => {
  test.setTimeout(60000);

  test('formulaire verrouillé tant qu’une validation existe', async ({
    browserName,
    editionPage,
    httpMocker,
  }) => {
    test.skip(
      browserName === 'firefox',
      'Pas de support de WebGL2 sur Firefox headless',
    );

    // Bâtiment validé par un autre utilisateur (verrouille le formulaire).
    await httpMocker.mockAPIRoutes(
      [
        {
          method: 'GET',
          path: GET_PATH,
          response: {
            status: 200,
            body: makeBuildingResponse({
              rnb_id: BUILDING_ID,
              validated_by: [makeValidator({ display_name: 'Camille Témoin' })],
            }),
          },
        },
      ],
      true,
    );

    await editionPage.goToBuilding(BUILDING_ID);
    await expect(editionPage.panel).toBeVisible();

    // Le select de statut est désactivé (formulaire verrouillé).
    await expect(editionPage.statusSelect).toBeDisabled();
    // La case à cocher de déverrouillage est présente (son libellé nomme le
    // validateur "Camille Témoin", ce que le locator unlockCheckbox vérifie
    // via son name au plus proche du texte attendu).
    await expect(editionPage.unlockCheckbox).toBeVisible();

    // Cocher déverrouille le formulaire.
    await editionPage.unlockCheckbox.check();
    await expect(editionPage.statusSelect).toBeEnabled();
  });
});
```

- [ ] **Step 2: Lancer le test**

Run: `pnpm exec playwright test tests/validation-edition.spec.ts --project=chromium`
Expected: PASS (1 test).

- [ ] **Step 3: Commit**

```bash
git add tests/validation-edition.spec.ts
git commit -m "test(e2e): verrouillage du formulaire si bâtiment validé (#449)"
```

---

## Task 10: E2e — valider un bâtiment depuis l'édition

**Files:**

- Modify: `tests/validation-edition.spec.ts`

Bâtiment non validé → bouton « Valider ce bâtiment » → `PATCH {is_valid:true}` → toaster de succès.

- [ ] **Step 1: Ajouter le test**

Dans `tests/validation-edition.spec.ts`, ajouter ce test à l'intérieur du `test.describe` :

```ts
test('valider un bâtiment depuis l’édition', async ({
  browserName,
  editionPage,
  httpMocker,
}) => {
  test.skip(
    browserName === 'firefox',
    'Pas de support de WebGL2 sur Firefox headless',
  );

  // État initial : bâtiment non validé.
  await httpMocker.mockAPIRoutes(
    [
      {
        method: 'GET',
        path: GET_PATH,
        response: {
          status: 200,
          body: makeBuildingResponse({
            rnb_id: BUILDING_ID,
            validated_by: [],
          }),
        },
      },
    ],
    true,
  );

  await editionPage.goToBuilding(BUILDING_ID);
  await expect(editionPage.panel).toBeVisible();
  await expect(editionPage.validateButton).toBeVisible();

  // Mocks pour le clic : PATCH is_valid:true puis re-GET (validé).
  // Ce nouvel enregistrement masque le précédent (handler le plus récent).
  await httpMocker.mockAPIRoutes(
    [
      {
        method: 'PATCH',
        path: PATCH_PATH,
        body: { is_valid: true },
        response: { status: 204 },
      },
      {
        method: 'GET',
        path: GET_PATH,
        response: {
          status: 200,
          body: makeBuildingResponse({
            rnb_id: BUILDING_ID,
            validated_by: [makeValidator()],
          }),
        },
      },
    ],
    true,
  );

  await editionPage.clickValidate();
  await expect(
    editionPage.toaster.getByText(/validation enregistrée/i),
  ).toBeVisible();
});
```

- [ ] **Step 2: Lancer les tests du fichier**

Run: `pnpm exec playwright test tests/validation-edition.spec.ts --project=chromium`
Expected: PASS (2 tests).

- [ ] **Step 3: Commit**

```bash
git add tests/validation-edition.spec.ts
git commit -m "test(e2e): valider un bâtiment depuis l’édition (#449)"
```

---

## Task 11: E2e — retirer sa validation

**Files:**

- Modify: `tests/validation-edition.spec.ts`

Bâtiment validé **par l'utilisateur courant** → bouton « Retirer ma validation » → `PATCH {is_valid:false}` → toaster. L'username courant est lu au runtime puis injecté dans la fixture pour que le composant détecte « ma validation ».

- [ ] **Step 1: Ajouter le test**

Dans `tests/validation-edition.spec.ts`, ajouter ce test à l'intérieur du `test.describe` :

```ts
test('retirer sa validation depuis l’édition', async ({
  browserName,
  editionPage,
  httpMocker,
}) => {
  test.skip(
    browserName === 'firefox',
    'Pas de support de WebGL2 sur Firefox headless',
  );

  // Connexion puis récupération de l'username courant.
  await editionPage.goToBuilding(BUILDING_ID);
  const username = await editionPage.getCurrentUsername();

  // État initial : bâtiment validé par l'utilisateur courant.
  await httpMocker.mockAPIRoutes(
    [
      {
        method: 'GET',
        path: GET_PATH,
        response: {
          status: 200,
          body: makeBuildingResponse({
            rnb_id: BUILDING_ID,
            validated_by: [makeValidator({ username, display_name: 'Moi' })],
          }),
        },
      },
    ],
    true,
  );

  // Recharger la page pour partir de l'état mocké (validé par moi).
  await editionPage.goToBuilding(BUILDING_ID);
  await expect(editionPage.panel).toBeVisible();
  await expect(editionPage.removeValidationButton).toBeVisible();

  // Mocks pour le clic : PATCH is_valid:false puis re-GET (non validé).
  await httpMocker.mockAPIRoutes(
    [
      {
        method: 'PATCH',
        path: PATCH_PATH,
        body: { is_valid: false },
        response: { status: 204 },
      },
      {
        method: 'GET',
        path: GET_PATH,
        response: {
          status: 200,
          body: makeBuildingResponse({
            rnb_id: BUILDING_ID,
            validated_by: [],
          }),
        },
      },
    ],
    true,
  );

  await editionPage.clickRemoveValidation();
  await expect(
    editionPage.toaster.getByText(/validation retirée/i),
  ).toBeVisible();
});
```

Note : `getCurrentUsername` est appelé après un premier `goToBuilding` pour garantir que la connexion a eu lieu (cookies de session présents).

- [ ] **Step 2: Lancer tous les tests du fichier**

Run: `pnpm exec playwright test tests/validation-edition.spec.ts --project=chromium`
Expected: PASS (3 tests).

- [ ] **Step 3: Commit**

```bash
git add tests/validation-edition.spec.ts
git commit -m "test(e2e): retirer sa validation depuis l’édition (#449)"
```

---

## Vérification finale

- [ ] **Tous les tests unitaires**

Run: `pnpm exec vitest run`
Expected: PASS.

- [ ] **Tous les e2e de validation**

Run: `pnpm exec playwright test tests/validation-edition.spec.ts --project=chromium`
Expected: PASS (3 tests).

- [ ] **Non-régression e2e édition existante**

Run: `pnpm exec playwright test tests/edition-page.spec.ts --project=chromium`
Expected: PASS.

- [ ] **Types + lint global**

Run: `npx tsc --noEmit -p tsconfig.json && pnpm lint`
Expected: PASS.

---

## Vérifications manuelles recommandées (non automatisées)

- En consultation, un bâtiment validé affiche toujours le bloc vert (inchangé) ; un bâtiment non validé n'affiche aucun bloc.
- En édition, le bloc de validation apparaît toujours ; cliquer « Valider ce bâtiment » puis « Retirer ma validation » fonctionne et rafraîchit la liste.
- Sur un bâtiment édité (statut/forme/adresse) alors qu'il était validé, le backend réinitialise `validated_by` : après soumission, le bloc redevient « non validé ».
- L'édition de la **forme via la carte** est bien impossible tant que le formulaire est verrouillé (le bouton d'édition de forme est désactivé par le `fieldset`).
