# Migration Next.js 15 → 16

> Recherche effectuée le 2026-07-20, uniquement à partir de sources primaires (docs officielles nextjs.org, registre npm, repos officiels des dépendances). Chaque affirmation est sourcée. Prérequis : la mise à jour vers le dernier 15.5.x (recherche parallèle : `docs/research/nextjs-15.5.16-upgrade.md`) doit être faite d'abord.

## Résumé (TL;DR)

- **Version cible : `next@16.2.10`** (dist-tag `latest` sur npm au 2026-07-20, vérifié via `npm view next dist-tags`).
- **React : `react@19.2.3` déjà installé est suffisant.** Le peer dependency de next@16.2.10 est `react: ^18.2.0 || ^19.0.0` (npm). Pas de montée de version React obligatoire.
- **Node.js minimum : 20.9.0** — CI sur `node-version: 20` (Playwright + Vitest workflows) → OK. TypeScript minimum 5.1 — repo en 5.5.4 → OK.
- **Effort estimé : MOYEN** (~2 à 4 jours dev + tests). Le code applicatif est déjà quasi prêt (async `params`/`searchParams` déjà migrés en 15). Le gros du travail est périphérique :
  1. **`@sentry/nextjs` v8 → v10** : bloquant, v8 ne supporte pas Next 16 (peer deps npm). Deux majeures à franchir.
  2. **Turbopack par défaut** : le bloc `webpack` custom de `next.config.js` (règle woff2 pour react-dsfr) fait **échouer le build** ; à supprimer ou opt-out `--webpack`.
  3. **`next lint` supprimé** : script `lint` + `.eslintrc.json` legacy + eslint 8 → migration ESLint 9 / flat config.
  4. **`middleware.ts` → `proxy.ts`** (déprécié, codemod dispo) — attention au changement de runtime edge → nodejs.
- **Risque principal** : compatibilité de `@codegouvfr/react-dsfr` avec Turbopack (comportements étranges rapportés sous Next 15 + Turbopack, issue #361 du repo) — à valider par les tests e2e, sinon fallback `--webpack`.

---

## 1. Version cible et prérequis de versions

Source : registre npm (`npm view next dist-tags --json`, `npm view next@16 peerDependencies engines`), vérifié le 2026-07-20.

| Élément                  | Valeur                                                                                                            | Statut repo                                                                                                                   |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `latest` npm             | **16.2.10**                                                                                                       | repo en 15.5.9                                                                                                                |
| peerDeps React           | `^18.2.0 \|\| ^19.0.0`                                                                                            | `react@19.2.3` → **OK, aucun changement requis**                                                                              |
| `engines.node`           | `>=20.9.0`                                                                                                        | CI `node-version: 20` (`.github/workflows/playwright.yml:19`, `.github/workflows/vitest.yml:19`) → OK ; local en Node 23 → OK |
| TypeScript min           | 5.1.0 ([upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16))                                  | `typescript@5.5.4` → OK                                                                                                       |
| Navigateurs              | Chrome/Edge/Firefox 111+, Safari 16.4+ ([upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)) | à noter, pas d'action                                                                                                         |
| peerDep optionnel `sass` | `^1.3.0`                                                                                                          | `sass@^1.77.8` → OK                                                                                                           |

Note : `@types/react`/`@types/react-dom` sont déjà en 19.2.3 via `overrides` dans `package.json` — le guide recommande de les garder à jour.

## 2. Breaking changes de Next.js 16

Sources primaires : [guide de migration officiel v16](https://nextjs.org/docs/app/guides/upgrading/version-16) et [blog post de release Next.js 16](https://nextjs.org/blog/next-16) (21 oct. 2025).

### 2.1 Turbopack devient le bundler par défaut (stable)

- `next dev` et `next build` utilisent Turbopack par défaut, plus besoin de `--turbopack`.
- **Si un `webpack` custom est présent dans `next.config.js`, `next build` échoue volontairement** ("the build will fail to prevent misconfiguration issues").
- Options : (a) migrer la config vers `turbopack` (top-level, sorti d'`experimental`), (b) builder avec `next build --turbopack` en ignorant la config webpack, (c) opt-out complet avec `--webpack` (`next dev --webpack`, `next build --webpack`).
- Sass : l'import tilde `~package/...` n'est pas supporté par Turbopack (contournement `turbopack.resolveAlias`).
- `sass-loader` passe en v16 (API Sass moderne).
- Babel : si une config babel est trouvée, Turbopack l'active automatiquement (plus d'erreur dure).

### 2.2 Async Request APIs — suppression définitive de l'accès synchrone

- L'accès synchrone (compat temporaire de la v15) à `cookies()`, `headers()`, `draftMode()`, `params` (layout/page/route/default/opengraph-image/twitter-image/icon/apple-icon) et `searchParams` (page) est **supprimé** ; accès uniquement asynchrone (`await`).
- Les fonctions de génération d'images (`opengraph-image`, `icon`, etc.) reçoivent désormais `params` et `id` comme Promises ; idem `id` dans `sitemap` (via `generateSitemaps`).
- Migration : codemod `next-async-request-api` + helpers de types via `npx next typegen` (`PageProps`, `LayoutProps`, `RouteContext`).

### 2.3 `middleware.ts` → `proxy.ts` (déprécié, pas encore supprimé)

- Renommage fichier `middleware.ts` → `proxy.ts` et export `middleware` → `proxy`.
- **Le runtime de `proxy` est `nodejs`, non configurable ; le runtime `edge` n'est PAS supporté dans `proxy`.** Pour rester sur edge, garder `middleware.ts` (encore disponible mais déprécié, suppression dans une version future — [blog](https://nextjs.org/blog/next-16#proxyts-formerly-middlewarets)).
- Flags de config renommés : `skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`, etc. (le codemod les gère).

### 2.4 Suppression de `next lint`

- La commande `next lint` est **supprimée** ; `next build` ne lance plus le lint. L'option `eslint` de `next.config.js` est supprimée aussi.
- Migration : codemod `next-lint-to-eslint-cli` (crée `eslint.config.mjs` flat config, remplace le script par `eslint .`).
- `@next/eslint-plugin-next` passe par défaut au **flat config ESLint** ; `eslint-config-next@16.2.10` exige `eslint >= 9.0.0` (peerDeps npm).

### 2.5 Suppression du support AMP

- Toutes les APIs AMP supprimées : `useAmp` / imports `next/amp`, `export const config = { amp: true }`, config `amp` de `next.config.js`.

### 2.6 Changements `next/image`

| Changement                       | Avant → Après                                                                                 | Migration                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `minimumCacheTTL` (défaut)       | 60 s → **4 h (14400 s)**                                                                      | remettre `images.minimumCacheTTL: 60` si besoin                   |
| `qualities` (défaut)             | toutes valeurs 1..100 → **`[75]`** ; le prop `quality` est arrondi à la valeur la plus proche | configurer `images.qualities` si besoin                           |
| `imageSizes` (défaut)            | `16` retiré du tableau                                                                        | réajouter si besoin                                               |
| Images locales avec query string | désormais **bloquées** sans `images.localPatterns.search` (anti-énumération)                  | configurer `localPatterns`                                        |
| IP locales                       | optimisation d'images depuis IP locale **bloquée** par défaut                                 | `images.dangerouslyAllowLocalIP: true` (réseaux privés seulement) |
| `maximumRedirects` (défaut)      | illimité → **3**                                                                              | configurable                                                      |
| `next/legacy/image`              | **déprécié**                                                                                  | utiliser `next/image`                                             |
| `images.domains`                 | **déprécié**                                                                                  | utiliser `images.remotePatterns`                                  |

### 2.7 Caching : cacheComponents, "use cache", PPR

- **PPR : le flag expérimental `experimental.ppr` et le segment config `experimental_ppr` sont supprimés.** PPR s'obtient désormais via `cacheComponents: true` (top-level).
- **`cacheComponents` est la config stable top-level** (remplace `experimental.dynamicIO` et `experimental.useCache`, dépréciés). Le modèle "Cache Components" / directive `"use cache"` est la nouveauté phare de la v16 ([blog](https://nextjs.org/blog/next-16#cache-components)) — opt-in, non activé par défaut.
- `cacheLife` et `cacheTag` sont **stables** (préfixe `unstable_` retiré).
- **`revalidateTag(tag)` à 1 argument est déprécié** : exige désormais un profil `cacheLife` en 2e argument (`revalidateTag('posts', 'max')`). Nouvelles APIs Server Actions : `updateTag()` (read-your-writes) et `refresh()`.

### 2.8 Autres suppressions et changements de comportement

- **`serverRuntimeConfig` / `publicRuntimeConfig` supprimés** → variables d'environnement (`NEXT_PUBLIC_*`, `connection()` pour lecture au runtime).
- **`devIndicators`** : options `appIsrStatus`, `buildActivity`, `buildActivityPosition` supprimées.
- **`unstable_rootParams` supprimé** (remplaçant à venir).
- **Scroll behavior** : Next n'écrase plus `scroll-behavior: smooth` pendant les navigations ; opt-in de l'ancien comportement via `data-scroll-behavior="smooth"` sur `<html>`.
- **Parallel routes** : chaque slot `@xxx` exige désormais un `default.js` explicite, sinon le build échoue.
- **`next dev` / `next build` séparés** : dev sort dans `.next/dev`, lockfile anti-instances multiples ; exécution concurrente possible.
- **Output de build** : métriques `size` / `First Load JS` retirées de `next build`.
- **`next dev` ne charge plus la config 2×** : `process.argv.includes('dev')` dans `next.config.js` renvoie `false` en dev (utiliser `NODE_ENV` ou `phase`).
- Routing/prefetch réécrits (layout deduplication, incremental prefetching) — pas de changement de code requis, mais plus de petites requêtes de prefetch.
- React Compiler : `reactCompiler` stable (opt-in) ; App Router basé sur React canary avec les features 19.2 (View Transitions, `useEffectEvent`, `Activity`).

## 3. Codemods officiels

Source : [docs codemods officielles](https://nextjs.org/docs/app/guides/upgrading/codemods) (+ commandes citées dans le [guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16)).

Commande globale d'upgrade (met à jour next/react/react-dom et propose les codemods) :

```bash
pnpm dlx @next/codemod@canary upgrade latest
```

Codemods spécifiques 16.0 :

| Codemod                               | Ce qu'il automatise                                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `middleware-to-proxy`                 | renomme `middleware.ts` → `proxy.ts`, l'export `middleware` → `proxy`, et les flags de config (`skipMiddlewareUrlNormalize` → `skipProxyUrlNormalize`, etc.)       |
| `next-lint-to-eslint-cli` (`@canary`) | crée `eslint.config.mjs` (flat config `next/core-web-vitals`), remplace le script `next lint` par `eslint .`, ajoute les deps ESLint, préserve la config existante |
| `remove-unstable-prefix`              | `unstable_cacheTag`/`unstable_cacheLife` → `cacheTag`/`cacheLife`                                                                                                  |
| `remove-experimental-ppr`             | supprime `export const experimental_ppr` des pages/layouts                                                                                                         |

Le codemod `upgrade` sait aussi déplacer `experimental.turbopack` → `turbopack` top-level ([guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16)). Pour les restes d'APIs synchrones : `next-async-request-api` (codemod 15.0, toujours disponible). Alternative outillée : Next.js DevTools MCP (`next-devtools-mcp`) proposé par le guide officiel.

## 4. Impact sur ce repo (mapping fichier par fichier)

### 4.1 Touché — action requise

| Fichier                                                                     | Constat                                                                                                                                             | Action                                                                                                                                                                                                          |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next.config.js` (l. 22–29)                                                 | **bloc `webpack` custom** (règle `.woff2` → `asset/resource`, issue de la doc d'installation react-dsfr) → **`next build` échouera** sous Turbopack | Supprimer le bloc : Turbopack gère nativement les `.woff2` (constat dans [react-dsfr#361](https://github.com/codegouvfr/react-dsfr/issues/361)). Fallback si problème : scripts `--webpack`                     |
| `package.json` (l. 10)                                                      | `"lint": "next lint"` — commande **supprimée** en v16                                                                                               | Codemod `next-lint-to-eslint-cli` ; passer `eslint` de ^8.57 à ^9 (exigé par `eslint-config-next@16`, peerDeps npm)                                                                                             |
| `.eslintrc.json`                                                            | format legacy (`extends: "next/core-web-vitals"`)                                                                                                   | Remplacer par `eslint.config.mjs` flat config (généré par le codemod)                                                                                                                                           |
| `package.json` (l. 41)                                                      | `eslint-config-next: 15.3.2` (déjà désynchronisé de next 15.5.9)                                                                                    | → `eslint-config-next@16.2.10`                                                                                                                                                                                  |
| `middleware.ts`                                                             | middleware CSP (nonce, en-têtes) ; export `middleware` + `config.matcher`                                                                           | Codemod `middleware-to-proxy` → `proxy.ts`. Le code (Buffer, `crypto.randomUUID`, `NextResponse`) tourne sans souci en runtime nodejs. Déprécié seulement — peut se faire dans un 2e temps                      |
| `package.json` (l. 27) + `next.config.js` (l. 49–90) + `sentry.*.config.ts` | `@sentry/nextjs@^8.55.0` : **peerDeps `next ^13.2 \|\| ^14 \|\| ^15` — pas de Next 16** (npm)                                                       | → `@sentry/nextjs@^10` (≥ 10.20.0, première version avec peerDep `next ^16.0.0-0`, vérifié npm). Voir §5                                                                                                        |
| `next.config.js` (l. 80)                                                    | option Sentry `hideSourceMaps`                                                                                                                      | **Supprimée en Sentry v9** ("removed without replacements", [guide v8→v9](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v8-to-v9.md)) — à retirer lors de la montée Sentry                |
| `sentry.client.config.ts`                                                   | convention historique                                                                                                                               | La doc Sentry actuelle utilise `instrumentation-client.ts` (requis pour Turbopack, [manual setup](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/)) — renommer lors de la montée Sentry |
| `sentry.edge.config.ts` + `instrumentation.ts`                              | branche `NEXT_RUNTIME === 'edge'` chargée aujourd'hui par le middleware (edge)                                                                      | Après passage à `proxy.ts` (nodejs), la branche edge devient inutilisée — à garder (inoffensif) ou nettoyer                                                                                                     |

### 4.2 Vérifié — déjà conforme, aucune action

| Sujet                                                  | Vérification                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Async `params`/`searchParams`**                      | Déjà migrés en 15 : `app/(normalLayout)/auth/mdp-nouveau/[b64UserId]/[token]/page.tsx`, `app/(normalLayout)/auth/mdp-oublie/page.tsx`, `app/(normalLayout)/blog/[slug]/page.tsx`, `app/(normalLayout)/blog/page.tsx`, `app/(normalLayout)/inscription/page.tsx`, `app/(normalLayout)/connexion/page.tsx`, `app/(fullscreenMap)/batiments/[id]/historique/page.tsx` — tous typés `Promise<...>` et `await`és (y compris `generateMetadata`) |
| **`headers()` async**                                  | `app/layout.tsx:31` (`await headers()`), `connexion`/`inscription` : déjà `await`                                                                                                                                                                                                                                                                                                                                                          |
| Pages client                                           | `activation/page.tsx` et `auth/proconnect/callback/page.tsx` utilisent `useSearchParams()` (hook client, non concerné)                                                                                                                                                                                                                                                                                                                     |
| App Router only                                        | dossier `app/` uniquement, pas de `pages/`                                                                                                                                                                                                                                                                                                                                                                                                 |
| `runtime = 'edge'`                                     | aucune occurrence dans `app/`/`components/`                                                                                                                                                                                                                                                                                                                                                                                                |
| `next/legacy/image`, `next/amp`                        | aucune occurrence                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `revalidateTag`/`unstable_cache`/`next/cache`          | aucune occurrence                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `next/config` (`getConfig`) / runtime config           | aucune occurrence                                                                                                                                                                                                                                                                                                                                                                                                                          |
| Parallel routes (`@slot`)                              | aucune                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `opengraph-image`/`sitemap`/`icon` fichiers dynamiques | aucun                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| Sass tilde (`@import '~...'`)                          | aucune occurrence dans `styles/`/`app/`/`components/`                                                                                                                                                                                                                                                                                                                                                                                      |
| `scroll-behavior: smooth`                              | aucune occurrence CSS                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `images` config                                        | déjà `remotePatterns` (pas `domains`) ; aucun prop `quality`, pas d'images locales avec query string                                                                                                                                                                                                                                                                                                                                       |
| `.babelrc` / config babel                              | absente → Turbopack pur (SWC)                                                                                                                                                                                                                                                                                                                                                                                                              |
| PPR / `experimental_ppr` / `dynamicIO`                 | non utilisés                                                                                                                                                                                                                                                                                                                                                                                                                               |

### 4.3 Points d'attention comportementaux (sans changement de code)

- **`images.minimumCacheTTL` 60 s → 4 h** : les images optimisées depuis `rnb-open.s3.fr-par.scw.cloud` seront revalidées moins souvent. Probablement souhaitable ; sinon fixer `minimumCacheTTL: 60`.
- **`images.qualities` → `[75]`** : aucun `quality` custom dans le code, donc pas d'effet visible.
- **Prefetch** : plus de petites requêtes de prefetch (rewrite du routing) — surveiller les logs serveur/CSP après migration. Le matcher du middleware exclut déjà les prefetch (`next-router-prefetch`/`purpose: prefetch`), vérifier que le comportement reste identique dans `proxy.ts`.
- **`productionBrowserSourceMaps: true` + `tunnelRoute` Sentry** : à re-tester sous Turbopack build (upload de source maps Sentry v10 compatible Turbopack, cf. [doc Sentry](https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/) qui couvre "Next.js 15+ with Turbopack").

## 5. Compatibilité des dépendances (sources : registre npm + repos officiels)

| Dépendance (version repo)                                          | Support Next 16                                                                                                                                                                                                                                                                                                                                                                                        | Source / action                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `next-auth@^4.24.12`                                               | **OK** — peerDeps de 4.24.12 : `next ^12.2.5 \|\| ^13 \|\| ^14 \|\| ^15 \|\| ^16`                                                                                                                                                                                                                                                                                                                      | npm. Monter au passage vers 4.24.14 (dernière v4)                                                                                                                                                                                                                                                                                                                                  |
| `@sentry/nextjs@^8.55.0`                                           | **BLOQUANT** — peerDeps v8 : `next ^13.2 \|\| ^14 \|\| ^15` (pas de 16). Premier support : **10.20.0** (`^16.0.0-0`) ; latest 10.67.0                                                                                                                                                                                                                                                                  | npm (`npm view @sentry/nextjs@<v> peerDependencies.next`). Migration en 2 majeures : [v8→v9](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v8-to-v9.md), [v9→v10](https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v9-to-v10.md). Impacts connus ici : `hideSourceMaps` supprimé, `sentry.client.config.ts` → `instrumentation-client.ts` |
| `eslint-config-next@15.3.2` + `eslint@^8.57`                       | à monter : `eslint-config-next@16.2.10` exige `eslint >= 9.0.0`                                                                                                                                                                                                                                                                                                                                        | npm peerDeps                                                                                                                                                                                                                                                                                                                                                                       |
| `@codegouvfr/react-dsfr@^1.21.1`                                   | pas de peerDep `next` (npm) → pas de blocage déclaré. **Risque Turbopack** : comportements étranges rapportés sous Next 15 + Turbopack (navigation, sous-menus, `brandTop`) et règle webpack woff2 devenue inutile/incompatible — [issue #361](https://github.com/codegouvfr/react-dsfr/issues/361) (fermée). Le repo utilise un bootstrap custom (`dsfr-bootstrap/`), pas l'intégration `next-appdir` | Valider via e2e Playwright ; fallback `--webpack`                                                                                                                                                                                                                                                                                                                                  |
| `@vercel/analytics@^1.3.1`                                         | OK — peerDep `next >= 13`                                                                                                                                                                                                                                                                                                                                                                              | npm                                                                                                                                                                                                                                                                                                                                                                                |
| `react-map-gl`, `maplibre-gl`, `@reduxjs/toolkit`, `fuse.js`, etc. | non couplés à Next                                                                                                                                                                                                                                                                                                                                                                                     | —                                                                                                                                                                                                                                                                                                                                                                                  |

## 6. Procédure de migration recommandée

Prérequis : être sur le dernier **15.5.x** (`backport` npm : 15.5.20) et que le build/e2e passent — c'est l'état de référence.

```bash
# 0. Branche dédiée
git switch -c chore/nextjs-16

# 1. (peut se faire AVANT Next 16, sur la branche 15) Monter Sentry v8 → v10
pnpm add @sentry/nextjs@^10
#    - retirer `hideSourceMaps` de next.config.js (supprimé en v9)
#    - renommer sentry.client.config.ts -> instrumentation-client.ts
#    - suivre les guides v8→v9 puis v9→v10 (liens §5)

# 2. Upgrade automatisé Next 16 (met à jour next/react/react-dom + propose les codemods)
pnpm dlx @next/codemod@canary upgrade latest

# 3. Codemods ciblés (si non appliqués par l'étape 2)
pnpm dlx @next/codemod@canary next-lint-to-eslint-cli .   # next lint -> eslint CLI + flat config
pnpm dlx @next/codemod@latest middleware-to-proxy .        # middleware.ts -> proxy.ts (optionnel, déprécié seulement)

# 4. ESLint 9 + config next 16
pnpm add -D eslint@^9
pnpm add eslint-config-next@latest   # (ou en devDependencies, à harmoniser)
#    supprimer .eslintrc.json au profit de eslint.config.mjs

# 5. Turbopack : supprimer le bloc `webpack` (règle woff2) de next.config.js
#    (Turbopack gère les .woff2 nativement ; fallback: scripts "--webpack")

# 6. Vérifications (scripts du repo)
pnpm lint          # eslint . (nouveau)
pnpm build         # next build sous Turbopack — inclut le typecheck (ignoreBuildErrors: false)
pnpm test          # vitest
pnpm e2e           # playwright — valider en particulier le rendu DSFR (header, nav, fonts),
                   # la CSP (nonce via proxy.ts) et Sentry (tunnel /monitoring)
pnpm dev           # smoke test manuel dev (Turbopack)
```

Vérifications spécifiques post-migration :

1. Fonts DSFR (woff2) chargées correctement sans la règle webpack.
2. CSP : le nonce est bien injecté par `proxy.ts` et le matcher se comporte comme avant (exclusion `/monitoring`, prefetch).
3. Sentry : remontée d'erreurs client/serveur + upload des source maps en build Turbopack.
4. Images optimisées depuis le bucket S3 Scaleway (remotePatterns) OK ; décider si `minimumCacheTTL: 60` doit être restauré.
5. CI : les workflows Playwright/Vitest passent (Node 20 OK).

## 7. Estimation d'effort

**Classement : MOYEN.** Le cœur applicatif est prêt (async APIs déjà migrées, App Router pur, pas d'AMP/PPR/caching legacy). L'effort porte sur l'outillage et une dépendance.

Travaux dans l'ordre suggéré :

| #   | Tâche                                                                                                                            | Effort | Risque                                                                                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------ |
| 1   | Montée `@sentry/nextjs` 8 → 10 (config + `instrumentation-client.ts` + retrait `hideSourceMaps`) — faisable en amont sur Next 15 | ½–1 j  | moyen (2 majeures, mais app peu couplée à Sentry)                                          |
| 2   | `pnpm dlx @next/codemod@canary upgrade latest` (next 16.2.10 + codemods)                                                         | ¼ j    | faible                                                                                     |
| 3   | Suppression du bloc `webpack` woff2 + validation du rendu DSFR sous Turbopack (dev + build)                                      | ¼–1 j  | **moyen/élevé** (react-dsfr × Turbopack, cf. issue #361) — fallback `--webpack` disponible |
| 4   | Migration ESLint (`next-lint-to-eslint-cli`, eslint 9, flat config, `eslint-config-next@16`)                                     | ¼–½ j  | faible                                                                                     |
| 5   | `middleware.ts` → `proxy.ts` (codemod) + re-test CSP/nonce                                                                       | ¼ j    | faible (déprécié seulement — peut être différé)                                            |
| 6   | Passe de vérification complète (build, vitest, e2e Playwright, smoke test Sentry/images)                                         | ½–1 j  | —                                                                                          |

Total estimé : **2 à 4 jours** selon l'issue de la validation react-dsfr/Turbopack et de la montée Sentry.

## 8. Sources

Primaires (Next.js / Vercel) :

- Guide de migration officiel v15 → v16 : https://nextjs.org/docs/app/guides/upgrading/version-16 (consulté le 2026-07-20, version docs 16.2.10)
- Blog post de release Next.js 16 (21 oct. 2025) : https://nextjs.org/blog/next-16
- Docs codemods officielles : https://nextjs.org/docs/app/guides/upgrading/codemods

Registre npm (vérifié le 2026-07-20 via `npm view`) :

- `next` dist-tags (`latest: 16.2.10`, `backport: 15.5.20`), peerDependencies et `engines` de `next@16.2.10`
- peerDependencies de `next-auth@4.24.12`, `@sentry/nextjs@8.55.0` et `@sentry/nextjs@10.x` (10.19.0 → pas de 16 ; 10.20.0 → `^16.0.0-0`), `eslint-config-next@16.2.10` (`eslint >= 9`), `@vercel/analytics`

Repos / docs officiels des dépendances :

- Sentry — manual setup Next.js (Turbopack, `instrumentation-client.ts`) : https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/
- Sentry — migration v8 → v9 (`hideSourceMaps` supprimé) : https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v8-to-v9.md ; v9 → v10 : https://docs.sentry.io/platforms/javascript/guides/nextjs/migration/v9-to-v10.md
- react-dsfr — issue Turbopack : https://github.com/codegouvfr/react-dsfr/issues/361

Fichiers du repo analysés : `package.json`, `next.config.js`, `middleware.ts`, `.eslintrc.json`, `instrumentation.ts`, `sentry.{client,edge,server}.config.ts`, `app/**` (pages avec `params`/`searchParams`), `styles/**`, `.github/workflows/*.yml`, `tsconfig.json`.
