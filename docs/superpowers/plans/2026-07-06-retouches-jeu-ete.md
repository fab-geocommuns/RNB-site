# Retouches jeu de l'été 2026 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Traiter les retouches de l'issue #471 sur le jeu de l'été 2026 (page Mes trophées, bloc classement, modale de gain, bloc score de la page édition), sur la branche `trophies` (PR #472).

**Architecture:** Retouches ciblées sur des composants React existants. La logique nouvelle (nommage des paliers Bronze/Argent/Or, libellé « Gagné par X personnes », exposition des paliers du catalogue dans `TrophyDetails`) est centralisée dans `utils/trophies.tsx` et testée avec vitest. Le reste est du rendu (JSX + SCSS modules) vérifié visuellement.

**Tech Stack:** Next.js (App Router), React, TypeScript, SCSS modules, DSFR (`@codegouvfr/react-dsfr`), vitest.

## Global Constraints

- Tous les textes utilisateur sont en français.
- Les labels de trophées viennent de l'API en minuscules (ex. `"validateur"`, `"course de fond"`) : la majuscule est appliquée en CSS via `::first-letter`, jamais `text-transform: capitalize` (qui donnerait « Course De Fond »).
- L'API catalogue `GET /trophies/` renvoie par trophée : `{trophy, trophy_label, description, count, levels: [{level, level_label, condition, count}]}`. Le champ `condition` est une phrase complète (ex. « Valider 10 bâtiments »).
- Le trophée `superv` a un seul niveau (`level_label: null`) : pas de préfixe Bronze/Argent/Or pour lui.
- Décisions produit validées par Paul : conditions au format « Bronze ✅ : Valider 10 bâtiments » ; bouton « Voir tous les trophées » en petit sous la grille des trophées, seulement si connecté ; lien blog : ne rien changer pour l'instant ; bloc édition : garder `EditMapSummerScore` mais adapter textes/données/visuel.
- Tests : `npx vitest run` (runner vitest). Typecheck : `npx tsc --noEmit`.
- Messages de commit en français (style du dépôt), un commit par tâche.

---

### Task 1: Utils trophées — nom des paliers, libellé « Gagné par », paliers dans TrophyDetails

**Files:**

- Modify: `utils/trophies.tsx`
- Create: `utils/trophies.test.ts`

**Interfaces:**

- Consumes: types existants `Trophy`, `TrophyData`, `LevelData`, `TrophyDetails` de `utils/trophies.tsx`.
- Produces (utilisés par les tâches 2 et 3) :
  - `trophyLevelName(level: number): string` → `'Bronze' | 'Argent' | 'Or'` (1 → Bronze, 2 → Argent, ≥3 → Or).
  - `wonByLabel(count: number | null | undefined): string` → « Pas encore gagné » / « Gagné par 1 personne » / « Gagné par N personnes » (N formaté `fr-FR`).
  - `TrophyDetails` enrichi de `levels: LevelData[]` et `userLevel: number` (0 si non gagné). Les champs `currentLevel`/`nextLevel` sont CONSERVÉS dans cette tâche (supprimés en tâche 2).
  - `getUserTrophyData` matche désormais sur l'identifiant `trophy` (stable) et non plus sur `trophy_label` ; `count` devient le compteur du trophée (`TrophyData.count`), pas celui du palier.
  - `getUserTrophieDetails` renvoie `count: trophy.count` (et non plus `firstLevel.count`).

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `utils/trophies.test.ts` :

```ts
import { describe, expect, it } from 'vitest';
import {
  trophyLevelName,
  wonByLabel,
  getUserTrophyData,
  getUserTrophieDetails,
  TrophyData,
  Trophy,
} from './trophies';

const catalogTrophy: TrophyData = {
  trophy: 'validateur',
  trophy_label: 'validateur',
  description: 'Gagnez ce trophée en validant des bâtiments.',
  count: 2,
  levels: [
    {
      level: 1,
      level_label: 'apprenti',
      condition: 'Valider 10 bâtiments',
      count: 2,
    },
    {
      level: 2,
      level_label: 'maçon',
      condition: 'Valider 100 bâtiments',
      count: 1,
    },
    {
      level: 3,
      level_label: 'entreprise du bâtiment',
      condition: 'Valider 250 bâtiments',
      count: 1,
    },
  ],
};

describe('trophyLevelName', () => {
  it('nomme les paliers Bronze, Argent puis Or', () => {
    expect(trophyLevelName(1)).toBe('Bronze');
    expect(trophyLevelName(2)).toBe('Argent');
    expect(trophyLevelName(3)).toBe('Or');
    expect(trophyLevelName(4)).toBe('Or');
  });
});

describe('wonByLabel', () => {
  it('gère zéro, un et plusieurs gagnants', () => {
    expect(wonByLabel(0)).toBe('Pas encore gagné');
    expect(wonByLabel(1)).toBe('Gagné par 1 personne');
    expect(wonByLabel(3)).toBe('Gagné par 3 personnes');
    expect(wonByLabel(undefined)).toBe('Pas encore gagné');
    expect(wonByLabel(null)).toBe('Pas encore gagné');
  });
});

describe('getUserTrophyData', () => {
  const userTrophy: Trophy = {
    trophy: 'validateur',
    trophy_label: 'validateur',
    level: 2,
    level_label: 'maçon',
  };

  it('expose les paliers du catalogue et le palier atteint', () => {
    const details = getUserTrophyData([catalogTrophy], userTrophy);
    expect(details.levels).toEqual(catalogTrophy.levels);
    expect(details.userLevel).toBe(2);
    expect(details.count).toBe(2); // compteur du trophée, pas du palier
  });

  it('reste utilisable si le trophée est absent du catalogue', () => {
    const details = getUserTrophyData([], userTrophy);
    expect(details.levels).toEqual([]);
    expect(details.userLevel).toBe(2);
  });
});

describe('getUserTrophieDetails', () => {
  it('expose les paliers du catalogue et un palier utilisateur nul', () => {
    const details = getUserTrophieDetails(catalogTrophy);
    expect(details.levels).toEqual(catalogTrophy.levels);
    expect(details.userLevel).toBe(0);
    expect(details.count).toBe(2);
  });
});
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `npx vitest run utils/trophies.test.ts`
Expected: FAIL — `trophyLevelName` et `wonByLabel` n'existent pas ; `levels`/`userLevel` absents des retours.

- [ ] **Step 3: Implémenter dans `utils/trophies.tsx`**

Ajouter après `trophyMedalColor` :

```ts
/**
 * Nom du palier affiché à l'utilisateur, aligné sur la couleur de médaille
 * (cf. `trophyMedalColor`) : Bronze pour le premier, Argent pour le deuxième,
 * Or au-delà.
 */
export function trophyLevelName(level: number): string {
  if (level <= 1) return 'Bronze';
  if (level === 2) return 'Argent';
  return 'Or';
}

/**
 * Libellé « Gagné par N personnes » (format demandé par l'issue #471),
 * avec les cas zéro et singulier.
 */
export function wonByLabel(count: number | null | undefined): string {
  const n = count ?? 0;
  if (n <= 0) return 'Pas encore gagné';
  if (n === 1) return 'Gagné par 1 personne';
  return `Gagné par ${n.toLocaleString('fr-FR')} personnes`;
}
```

Enrichir `TrophyDetails` (les champs `currentLevel`/`nextLevel` restent pour l'instant, `TrophyItem` les utilise encore — ils sont supprimés en tâche 2) :

```ts
export interface TrophyDetails {
  description: string;
  currentLevel: LevelData | undefined;
  nextLevel: LevelData | undefined;
  levels: LevelData[]; // paliers du catalogue (vide si trophée inconnu)
  userLevel: number; // palier atteint par l'utilisateur (0 si non gagné)
  count: number | null | undefined;
}
```

Dans `getUserTrophyData` : matcher sur l'identifiant stable et compléter le retour. Remplacer

```ts
const trophyInfos = trophies?.find(
  (t) => t.trophy_label === userTrophy.trophy_label,
);
```

par

```ts
const trophyInfos = trophies?.find((t) => t.trophy === userTrophy.trophy);
```

et remplacer le calcul de `count` ainsi que le `return` par :

```ts
return {
  description: trophyInfos?.description || '',
  currentLevel,
  nextLevel,
  levels: trophyInfos?.levels ?? [],
  userLevel: userTrophy.level,
  count: trophyInfos?.count,
};
```

(supprimer le bloc `const count = ...` basé sur `levels[currentLevelIndex].count`).

Dans `getUserTrophieDetails`, remplacer le corps par :

```ts
export const getUserTrophieDetails = (trophy: TrophyData): TrophyDetails => {
  return {
    description: trophy.description || '',
    currentLevel: trophy.levels[0],
    nextLevel: undefined,
    levels: trophy.levels,
    userLevel: 0,
    count: trophy.count,
  };
};
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `npx vitest run`
Expected: PASS (y compris `utils/summerGames.test.ts` existant).

Run: `npx tsc --noEmit`
Expected: aucune erreur.

- [ ] **Step 5: Commit**

```bash
git add utils/trophies.tsx utils/trophies.test.ts
git commit -m "Utils trophées : paliers Bronze/Argent/Or, libellé « Gagné par », paliers dans TrophyDetails"
```

---

### Task 2: Page Mes trophées — conditions par niveau avec coches, bordure neutral, marge, « Gagné par »

**Files:**

- Modify: `app/(normalLayout)/mon-compte/(subpages)/mes-trophees/components/TrophyItem.tsx`
- Modify: `app/(normalLayout)/mon-compte/(subpages)/mes-trophees/page.tsx`
- Modify: `utils/trophies.tsx` (suppression de `currentLevel`/`nextLevel` devenus inutiles)
- Modify: `styles/mes-trophees.module.scss`

**Interfaces:**

- Consumes: `trophyLevelName(level)`, `wonByLabel(count)`, `TrophyDetails.levels`, `TrophyDetails.userLevel` (tâche 1) ; `Medal` accepte `color: 'bronze' | 'silver' | 'gold' | 'neutral'`.
- Produces: `TrophyDetails` final = `{ description: string; levels: LevelData[]; userLevel: number; count: number | null | undefined }` (sans `currentLevel`/`nextLevel`).

- [ ] **Step 1: Réécrire `TrophyItem.tsx`**

Remplacer tout le fichier par :

```tsx
import {
  TrophyDetails,
  trophyImageUrl,
  trophyLevelName,
  trophyMedalColor,
  wonByLabel,
  Trophy,
  TrophyData,
} from '@/utils/trophies';
import styles from '@/styles/mes-trophees.module.scss';
import Medal from '@/components/games/summerGames/Medal';

interface TrophyItemProps {
  trophy: Trophy | TrophyData;
  details: TrophyDetails;
}

export default function TrophyItem({ trophy, details }: TrophyItemProps) {
  const { description, levels, userLevel, count } = details;
  const won = userLevel > 0;
  // superv est un trophée unique : son visuel PNG se suffit à lui-même quand
  // il est gagné. Tous les autres cas passent par la médaille ; bordure
  // `neutral` tant que le trophée n'est pas gagné (issue #471).
  const showRawImage = trophy.trophy === 'superv' && won;

  return (
    <li className={styles.item}>
      <div className={styles.imageContainer}>
        {showRawImage ? (
          <img src={trophyImageUrl(trophy)} alt={trophy.trophy_label} />
        ) : (
          <Medal
            color={won ? trophyMedalColor(userLevel) : 'neutral'}
            image={trophyImageUrl(trophy)}
            size={120}
            alt={trophy.trophy_label}
          />
        )}
      </div>
      <div className={styles.textContainer}>
        <span className={styles.trophyTitle}>{trophy.trophy_label}</span>
        <p className={styles.trophyDescription}>{description}</p>
        {levels.length > 0 && (
          <ul className={styles.levelsList}>
            {levels.map((level) => (
              <li key={level.level}>
                {/* Pas de préfixe Bronze/Argent/Or pour un trophée à palier
                    unique (superv). */}
                {levels.length > 1 && (
                  <span className={styles.levelName}>
                    {trophyLevelName(level.level)}
                    {userLevel >= level.level && (
                      <span aria-label="niveau remporté"> ✅</span>
                    )}
                    {' : '}
                  </span>
                )}
                {level.condition}
                {levels.length === 1 && userLevel >= level.level && (
                  <span aria-label="niveau remporté"> ✅</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className={styles.trophyDescription}>{wonByLabel(count)}</p>
      </div>
    </li>
  );
}
```

- [ ] **Step 2: Nettoyer `utils/trophies.tsx` (suppression des champs morts)**

Dans `TrophyDetails`, supprimer `currentLevel` et `nextLevel` :

```ts
export interface TrophyDetails {
  description: string;
  levels: LevelData[]; // paliers du catalogue (vide si trophée inconnu)
  userLevel: number; // palier atteint par l'utilisateur (0 si non gagné)
  count: number | null | undefined;
}
```

Simplifier `getUserTrophyData` (tout le calcul `currentLevelIndex`/`currentLevel`/`nextLevel` disparaît) :

```ts
export const getUserTrophyData = (
  trophies: TrophyData[],
  userTrophy: Trophy,
): TrophyDetails => {
  const trophyInfos = trophies?.find((t) => t.trophy === userTrophy.trophy);

  return {
    description: trophyInfos?.description || '',
    levels: trophyInfos?.levels ?? [],
    userLevel: userTrophy.level,
    count: trophyInfos?.count,
  };
};
```

Simplifier `getUserTrophieDetails` :

```ts
export const getUserTrophieDetails = (trophy: TrophyData): TrophyDetails => {
  return {
    description: trophy.description || '',
    levels: trophy.levels,
    userLevel: 0,
    count: trophy.count,
  };
};
```

- [ ] **Step 3: Marge au-dessus de « Trophées à gagner » dans `page.tsx`**

Dans `app/(normalLayout)/mon-compte/(subpages)/mes-trophees/page.tsx`, remplacer

```tsx
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-12">
            <h2 className="block__title">Trophées à gagner</h2>
```

par

```tsx
        <div className="fr-grid-row fr-mt-12v">
          <div className="fr-col-12 fr-col-md-12">
            <h2 className="block__title">Trophées à gagner</h2>
```

(`fr-mt-12v` = 3 rem, classe d'espacement DSFR.)

- [ ] **Step 4: Styles dans `styles/mes-trophees.module.scss`**

Remplacer le bloc `.trophyTitle` (le `text-transform: capitalize` mettrait une majuscule à chaque mot : « Course De Fond ») :

```scss
.trophyTitle {
  font-weight: bold;
  font-size: 1.1rem;
  // `inline-block` requis pour que `::first-letter` s'applique.
  display: inline-block;

  &::first-letter {
    text-transform: uppercase;
  }
}
```

Remplacer le bloc `.levelsRow` (inutilisé) par :

```scss
.levelsList {
  list-style: none;
  padding: 0;
  margin: 0.4rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  font-size: 0.9rem;
  color: #444;
  line-height: 1.4;
}

.levelName {
  font-weight: 600;
}
```

- [ ] **Step 5: Vérifier**

Run: `npx vitest run` — Expected: PASS.
Run: `npx tsc --noEmit` — Expected: aucune erreur (plus aucune référence à `currentLevel`/`nextLevel`).
Vérification visuelle : `npm run dev`, ouvrir `/mon-compte/mes-trophees` (connecté) et contrôler : marge au-dessus de « Trophées à gagner », médailles `neutral` pour les trophées à gagner, liste « Bronze ✅ : Valider 10 bâtiments / Argent : … / Or : … », « Gagné par X personnes ».

- [ ] **Step 6: Commit**

```bash
git add app/\(normalLayout\)/mon-compte/\(subpages\)/mes-trophees utils/trophies.tsx styles/mes-trophees.module.scss
git commit -m "Page Mes trophées : conditions de victoire par palier, bordure neutral, marge et « Gagné par »"
```

---

### Task 3: Bloc classement — « Badges » → « Trophées », « Gagné par X personnes », lien « Voir tous les trophées »

**Files:**

- Modify: `components/games/summerGames/homeBlock.tsx`
- Modify: `components/games/summerGames/badgesList.tsx`
- Modify: `styles/summerGames.module.scss`

**Interfaces:**

- Consumes: `wonByLabel(count)` de `@/utils/trophies` (tâche 1) ; `useRNBAuthentication()` renvoie `{ user, isAuthenticated }` (déjà utilisé dans `badgesList.tsx`).
- Produces: rien de consommé par d'autres tâches.

- [ ] **Step 1: `homeBlock.tsx` — renommer le titre**

Remplacer

```tsx
<h3 className={styles.sectionTitle}>Badges à gagner</h3>
```

par

```tsx
<h3 className={styles.sectionTitle}>Trophées à gagner</h3>
```

- [ ] **Step 2: `badgesList.tsx` — libellé partagé + lien « Voir tous les trophées »**

Remplacer tout le fichier par :

```tsx
'use client';

import styles from '@/styles/summerGames.module.scss';
import Link from 'next/link';
import Medal from './Medal';
import { userTrophyStatus } from '@/utils/summerGames';
import {
  getTrophiesData,
  getUserTrophiesData,
  wonByLabel,
} from '@/utils/trophies';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';

export default function BadgesList() {
  const { data: trophies, loadingTrophies } = getTrophiesData();
  const { user, isAuthenticated } = useRNBAuthentication();
  const username = isAuthenticated ? user?.username : null;
  const { data: userTrophies } = getUserTrophiesData(username);

  if (loadingTrophies || !trophies) return null;

  return (
    <div className={styles.badges}>
      <div className={styles.badgesGrid}>
        {trophies.map((trophy) => {
          const status = userTrophyStatus(userTrophies, trophy.trophy);
          return (
            <div key={trophy.trophy} className={styles.badge}>
              <div className={styles.badgeIcon} aria-hidden="true">
                <Medal
                  color="neutral"
                  image={`/images/trophies/${trophy.trophy}.png`}
                  size={80}
                  alt=""
                />
              </div>
              <div className={styles.badgeName}>{trophy.trophy_label}</div>
              <div className={styles.badgeCount}>
                {wonByLabel(trophy.count)}
              </div>
              <div className={styles.badgeDesc}>{trophy.description}</div>
              {status.earned && (
                <div className={styles.badgeEarned}>
                  <span className={styles.badgeCheck} aria-hidden="true">
                    ✓
                  </span>
                  {status.levelLabel ? `Gagné · ${status.levelLabel}` : 'Gagné'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isAuthenticated && (
        <div className={styles.allTrophiesLinkShell}>
          <Link
            href="/mon-compte/mes-trophees"
            className={styles.allTrophiesLink}
          >
            Voir tous les trophées
          </Link>
        </div>
      )}
    </div>
  );
}
```

(Changements : import `Link` et `wonByLabel`, suppression de la fonction locale `winnersLabel`, bloc lien en fin de `.badges` visible seulement si connecté.)

- [ ] **Step 3: Styles du lien dans `styles/summerGames.module.scss`**

Ajouter après le bloc `.badgeCheck` (fin de fichier) :

```scss
.allTrophiesLinkShell {
  text-align: center;
  margin-top: 1.2rem;
}

.allTrophiesLink {
  color: white;
  font-size: 0.9em;

  &:hover {
    text-decoration: none;
  }
}
```

- [ ] **Step 4: Traquer les occurrences restantes de « badge » visibles à l'écran**

Run: `grep -rni "badge" components app --include="*.tsx" | grep -v "styles\." | grep -v "badgesList\|BadgesList\|import"`
Expected: aucune chaîne utilisateur restante contenant « badge » (les noms de classes CSS `badge*` et le nom de fichier `badgesList.tsx` peuvent rester — pas de renommage de fichiers dans cette PR).

- [ ] **Step 5: Vérifier**

Run: `npx tsc --noEmit` — Expected: aucune erreur.
Run: `npx vitest run` — Expected: PASS.
Vérification visuelle : `/classement` — titre « Trophées à gagner », « Gagné par X personnes » sous chaque trophée, lien « Voir tous les trophées » sous la grille uniquement si connecté (vérifier aussi déconnecté).

- [ ] **Step 6: Commit**

```bash
git add components/games/summerGames/homeBlock.tsx components/games/summerGames/badgesList.tsx styles/summerGames.module.scss
git commit -m "Classement : « Trophées » au lieu de « Badges », « Gagné par X personnes », lien vers Mes trophées"
```

---

### Task 4: Modale de gain — majuscule au nom du trophée

**Files:**

- Modify: `styles/trophyWon.module.scss`

**Interfaces:**

- Consumes: `.trophyName` est un `<p>` (élément bloc) dans `components/games/trophy/trophyWon.tsx` — `::first-letter` s'y applique directement.
- Produces: rien.

- [ ] **Step 1: Ajouter la majuscule CSS**

Dans `styles/trophyWon.module.scss`, compléter le bloc `.trophyName` :

```scss
.trophyName {
  color: white;
  text-align: center;
  font-weight: bold;
  margin-top: 1rem;
  overflow-wrap: break-word;
  // Les labels de trophées arrivent en minuscules de l'API (« validateur »,
  // « course de fond ») : majuscule sur la première lettre uniquement.
  &::first-letter {
    text-transform: uppercase;
  }
  // La taille de police est fixée en ligne, proportionnelle au diamètre.
  opacity: 0;
  animation: fadeIn 0.5s ease-out forwards;
  animation-delay: 1s;
}
```

- [ ] **Step 2: Vérifier**

Vérification visuelle : déclencher la modale (valider un bâtiment débloquant un trophée sur un compte de test, ou temporairement dispatcher `Actions.app.setWonTrophies([{trophy: 'course_de_fond', trophy_label: 'course de fond', level: 1, level_label: 'coureur du dimanche'}])` depuis la console React) et contrôler « Course de fond » (pas « Course De Fond »). Ne pas committer le code de test éventuel.

- [ ] **Step 3: Commit**

```bash
git add styles/trophyWon.module.scss
git commit -m "Modale de gain : majuscule sur la première lettre du nom du trophée"
```

---

### Task 5: Bloc score de la page édition — textes 2026, objectif fiabilisé, visuel harmonisé

**Files:**

- Modify: `components/games/summerGames/editMapSummerScore.tsx`
- Modify: `styles/summerGames.module.scss`
- Modify: `.env.local.example`

**Interfaces:**

- Consumes: `SUMMER_GAME_GOAL` exporté par `@/utils/summerGames` (constante front, l'API `/editions/ranking/<username>/` ne garantit pas de champ `goal`) ; `ProgressBar` accepte `{score: number, goal: number}`.
- Produces: rien.

- [ ] **Step 1: `editMapSummerScore.tsx` — textes et objectif**

Ajouter l'import :

```ts
import { useSummerGameUserData, SUMMER_GAME_GOAL } from '@/utils/summerGames';
```

(en remplacement de l'import existant de `useSummerGameUserData`).

Dans le composant, juste avant le `return`, ajouter :

```ts
// L'API ne renvoie pas toujours `goal` : repli sur l'objectif front partagé
// avec le bloc classement (SUMMER_GAME_GOAL).
const goal = summerGameUserData?.goal ?? SUMMER_GAME_GOAL;
```

Remplacer le titre :

```tsx
<div className={styles.mapSummerScoreTitle}>
  Le jeu <br />
  de l&apos;été
</div>
```

Remplacer le sous-bloc « Score global » :

```tsx
<div className={styles.mapSummerScoreSubpart}>
  <div className={styles.mapSummerScoreSubpartTitle}>Objectif global</div>
  <div className={styles.mapSummerScoreSubpartValue}>
    {summerGameUserData.global.toLocaleString('fr-FR')}/
    {goal.toLocaleString('fr-FR')}
    {isAnimating.global && (
      <span className={styles.mapSummerScoreAnimation}>
        +{scoreDiff.global}
      </span>
    )}
  </div>
</div>
```

Remplacer le `ProgressBar` :

```tsx
{
  summerGameUserData && (
    <ProgressBar score={summerGameUserData.global} goal={goal} />
  );
}
```

- [ ] **Step 2: Harmoniser le visuel avec le bloc du jeu**

Dans `styles/summerGames.module.scss`, remplacer le fond de `body .mapSummerScoreInside` (bleu générique `#0054cb`) par le bleu du shell du jeu de l'été (`#4059db`, cf. commentaire de `.rankShell`) :

```scss
body .mapSummerScoreInside {
  position: relative;
  color: white;
  background: #4059db;

  padding: 0.7rem 1.3rem;
  border-radius: 0.25rem;

  display: flex;
  align-items: center;
  &:hover {
    background: #35479f;
  }
}
```

- [ ] **Step 3: Nettoyer `.env.local.example`**

`NEXT_PUBLIC_SUMMER_GAME_API_BASE` n'est lu nulle part dans le code (vérifier avec `grep -rn "SUMMER_GAME_API_BASE" --include="*.ts*" .` → aucun résultat hors `.env.local.example`). Supprimer les lignes :

```
# Jeu de l'été : `/api/mock` pour les route handlers mock locaux, sinon retirer
# la variable pour taper la vraie API (NEXT_PUBLIC_API_BASE).
NEXT_PUBLIC_SUMMER_GAME_API_BASE=/api/mock
```

(garder `NEXT_PUBLIC_SHOW_SUMMER_GAME=true`).

- [ ] **Step 4: Vérifier**

Run: `npx tsc --noEmit` — Expected: aucune erreur.
Vérification visuelle : `npm run dev`, ouvrir `/edition` connecté avec `NEXT_PUBLIC_SHOW_SUMMER_GAME=true` : bloc en haut à droite avec titre « Le jeu de l'été », « Objectif global X/5 000 » (jamais `undefined`), « Mon score », barre de progression, fond bleu `#4059db`, lien vers `/classement` fonctionnel.

- [ ] **Step 5: Commit**

```bash
git add components/games/summerGames/editMapSummerScore.tsx styles/summerGames.module.scss .env.local.example
git commit -m "Page édition : bloc de suivi de l'objectif global remis au goût 2026"
```

---

### Task 6: Relecture des textes et espacements (interactif — session principale, PAS un subagent)

Cette tâche se fait dans la session principale avec Paul : elle produit des propositions à valider avant application.

**Files:**

- Read: `components/games/summerGames/homeBlock.tsx`, `app/(normalLayout)/classement/page.tsx`, `styles/summerGames.module.scss`
- Modify (après validation de Paul uniquement) : les mêmes.

- [ ] **Step 1: Inventorier les textes du bloc classement et de `/classement`**

Lister tous les textes visibles : titre, paragraphe d'introduction (« Participez à la validation des bâtiments du RNB… »), « Objectif : N validations », « N validations faites par la communauté », titres des classements, libellés des boutons — dont « En savoir plus TODO » (le libellé contient « TODO » visible par l'utilisateur : à signaler à Paul même si le lien blog reste inchangé pour l'instant).

- [ ] **Step 2: Contrôler les espacements de `/classement`**

Sur `npm run dev`, page `/classement` en desktop et mobile : espacement du conteneur (`fr-py-12v`), marges entre titre / intro / barre de progression / trophées / classements / boutons. Noter les corrections proposées (classes DSFR ou SCSS).

- [ ] **Step 3: Proposer les corrections à Paul**

Présenter la liste texte par texte (actuel → proposé) et les retouches d'espacement. Attendre validation.

- [ ] **Step 4: Appliquer les corrections validées, vérifier, commit**

```bash
git add components/games/summerGames/homeBlock.tsx app/\(normalLayout\)/classement/page.tsx styles/summerGames.module.scss
git commit -m "Classement : textes relus et espacements ajustés"
```

---

## Hors périmètre (décisions actées)

- **Lien vers l'article de blog** : l'article n'est pas publié, on ne change pas le lien pour l'instant (le libellé « TODO » sera discuté en tâche 6).
- Pas de renommage des fichiers/classes `badge*` (non visible utilisateur).
