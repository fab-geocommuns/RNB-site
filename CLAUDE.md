# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Front du Référentiel National des Bâtiments (rnb.beta.gouv.fr). Next.js 15 (App Router),
React 19, TypeScript `strict`, DSFR via `@codegouvfr/react-dsfr`, MapLibre, Redux Toolkit,
next-auth. Toute la donnée vient de l'API de `RNB-coeur` (`NEXT_PUBLIC_API_BASE`, sans slash
final) : ce dépôt n'a pas de base de données.

## Commandes

**pnpm uniquement** (`preinstall: only-allow pnpm`). CI sur Node 20.

```bash
pnpm i
cp .env.local.example .env.local   # puis compléter (README : demander le .env.local à un collègue)
pnpm dev                           # port 3000 ; predev lance only-include-used-icons
pnpm lint                          # next lint (next/core-web-vitals)
pnpm exec tsc --noEmit             # typecheck (pas de script dédié)
pnpm exec vitest run utils/validations.test.ts          # un test unitaire
pnpm exec playwright test tests/map-page.spec.ts        # un spec e2e
pnpm exec playwright test -g "nom du test" --project=chromium
```

Pré-commit (husky + lint-staged) : `prettier --write` sur les fichiers indexés (single quotes,
trailing commas). Les deux workflows CI (vitest, playwright) tournent sur les PR vers `main`.

## Tests

1. **Vitest** : fichiers `*.test.ts` colocalisés (`utils/`, `components/map/snap/`), logique pure
   uniquement. `tests/` est exclu.
2. **Playwright** (`tests/*.spec.ts`) : **le README est faux**, les tests ne tapent plus le
   staging. `playwright.config.ts` démarre deux serveurs :
   `tests/mock-server/index.mjs` (127.0.0.1:8001) absorbe les appels faits **côté serveur**
   (Ghost, `diffusion_databases`…), puis `pnpm dev` avec `NEXT_PUBLIC_API_BASE` pointé dessus et
   les feature flags forcés.
   Les appels **côté navigateur** se stubbent test par test via la fixture `HttpMocker`
   (`tests/fixtures/utils/http-mock.ts`) ; l'authentification via `signInAs`
   (`auth-mock.ts`), qui forge un cookie next-auth signé avec le `NEXTAUTH_SECRET` de test.
   Les pages sont des page objects dans `tests/fixtures/pages/`, les assertions sur la carte
   passent par `@mapgrab/playwright` (d'où `NEXT_PUBLIC_ENABLE_MAPGRAB=true`).
   Un serveur dev déjà lancé sur :3000 est réutilisé hors CI : il doit alors pointer sur le
   mock, sinon les tests partent sur ton `.env.local`.

## Architecture

### Routes (`app/`)

Trois groupes de routes, un layout chacun :

1. `(normalLayout)` : pages éditoriales, compte, auth, blog (Ghost CMS), FAQ, classement.
2. `(map)/carte` : carte de consultation, `VisuMap`.
3. `(fullscreenMap)/edition` et `batiments/[id]` : carte d'édition plein écran, `EditMap`.

`middleware.ts` pose la **CSP avec nonce** sur toutes les pages. Tout nouveau domaine appelé
depuis le navigateur (API, tuiles, médias) doit y être ajouté, sinon il est bloqué en silence.
`/monitoring` est le tunnel Sentry, exclu du middleware.

### État (`stores/`)

Un store Redux unique (`stores/store.tsx`) : slices `map`, `app`, `edition`, `report`, exposées
via `Actions.<slice>.<action>`. Le slice `edition` porte l'opération en cours
(`create | update | split | merge`) ; un `listenerMiddleware` réagit à `setOperation` pour
préparer l'opération. La carte ne se pilote pas directement : on dispatch (`moveTo`, `marker`…) et
`useMapStateSync` répercute sur l'instance MapLibre.

### Carte (`components/map/`)

`VisuMap` / `EditMap` composent une série de hooks `useMap*` (couches, événements, dessin,
snap, merge, split). Les couches sont déclarées dans `components/map/layers/`, les styles de
fond dans `mapstyles/*.json`. Le dessin d'édition utilise `@mapbox/mapbox-gl-draw`,
l'aimantation vit dans `snap/snapEngine.ts` (testé), la découpe dans
`utils/splitPolygonByLines.ts` (testé).
**Piège** : `'#' + Math.random()` sur les sources de tuiles `buildings`, `ads`, `reports`
désactive volontairement le cache ; ne pas le « corriger » sans en parler.

### Appels API et authentification

1. Côté client authentifié : `useRNBFetch()` (`utils/useRNBFetch.tsx`) ajoute
   `Authorization: Token <accessToken>` et `?from=site`. Ne pas appeler `fetch` nu pour une
   écriture. Les panneaux d'édition (`components/contribution/*Panel.tsx`) l'utilisent.
2. Lectures publiques : helpers de `utils/requests.ts` et URL construites dans les slices
   (`bdgApiUrl`) ou `logic/`.
3. Server actions : `actions/auth.ts` (mot de passe).
4. next-auth (`app/api/auth/[...nextauth]/auth.ts`) : provider `credentials` qui délègue à
   `POST /login/` de l'API, provider `proconnect` qui **ne valide pas le token** et code en dur
   `groups: ['Contributors']` (TODO en attente d'un endpoint back).
5. Droits côté front : `useRNBAuthentication()` et l'enum `RNBGroup`
   (`Contributors`, `Reviewers`). Le vrai contrôle reste au back : un bouton visible peut
   renvoyer 403 (ex. rollback, groupe `Rollback` côté RNB-coeur).

### Feature flags

Variables `NEXT_PUBLIC_*` comparées à la chaîne `'true'` : `ENABLE_EDITION_MODE`,
`SHOW_REPORTS`, `ENABLE_CAPTCHA`, `ENABLE_MAPGRAB`. `MERGE_ENABLED` et `ENABLE_CREATE_ACCOUNT`
figurent dans `.env.local.example` mais ne sont plus lus nulle part. Ajouter un flag = l'ajouter aussi à
`playwright.config.ts` pour que les e2e ne dépendent pas du `.env.local` du dev.

## Conventions

1. **Composant DSFR d'abord, toujours.** Avant d'écrire un élément d'interface, chercher son
   équivalent dans `@codegouvfr/react-dsfr` (`Button`, `Alert`, `CallOut`, `Tag`, `Badge`,
   `Tabs`, `Modal`, `Input`, `Select`, `Table`…) et l'utiliser.
   Interdit quand le composant existe : le reconstituer avec des classes `fr-*` posées à la
   main, ou avec du style custom (CSS, `style={…}`, module SCSS).
   Couleurs via `fr.colors.getHex(...)`, espacements via `fr.spacing(...)`, jamais de valeur
   en dur, styles MapLibre compris.
   Classes `fr-*` et style custom seulement sans équivalent DSFR, ou pour ajuster la mise en
   page autour d'un composant.
2. Imports absolus `@/…` (racine du dépôt).
3. Composants client marqués `'use client'` ; le store et la carte ne vivent que côté client.
4. Libellés UI en français. Le terme « Valider » est réservé à la validation d'un bâtiment.
