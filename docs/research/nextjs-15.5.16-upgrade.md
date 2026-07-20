# Montée de version Next.js : 15.5.9 → 15.5.x (recherche, 2026-07-20)

## Résumé (TL;DR)

- **Version cible recommandée : `next@15.5.20`** (dernier patch 15.5.x, publié le 2026-07-01, dist-tag npm `backport`).
- **15.5.16 est un minimum insuffisant** : le correctif du « Middleware / Proxy bypass via segment-prefetch routes » livré en 15.5.16 était **incomplet**. Le correctif complet ([CVE-2026-45109 / GHSA-26hh-7cqf-hhc6](https://github.com/advisories/GHSA-26hh-7cqf-hhc6)) n'est présent qu'à partir de **15.5.18**. Ce repo utilisant un middleware (CSP), le vrai minimum de sécurité est **15.5.18**.
- Entre 15.5.9 et 15.5.20 : **4 releases de sécurité** (15.5.10, 15.5.13, 15.5.15, 15.5.16/15.5.18) couvrant **18 advisories** au total, dont plusieurs touchent directement ce repo : middleware bypass, XSS via CSP nonces, DoS de l'Image Optimization API (`images.remotePatterns` est configuré), DoS des React Server Components.
- **Aucun breaking change** documenté : ce sont des backports de bug fixes (« This release is backporting bug fixes ») ; les peer dependencies sont inchangées, **React 19.2.3 reste compatible** (`react: ^18.2.0 || ^19.0.0`).
- La version **15.5.17 n'existe pas sur npm** (jamais publiée) ; 15.5.12 est une re-release de 15.5.11 ; 15.5.20 ne contient aucun changement de code (publication du package `@next/swc-wasm-web` uniquement).
- Attention : le repo impose **pnpm** (`preinstall: npx only-allow pnpm`) — la commande de mise à jour est donc `pnpm add`, pas `npm install`.

## Versions et changements

Versions 15.5.x publiées sur npm après 15.5.9 (source : `npm view next versions --json` et `npm view next time --json`, registre npm, consulté le 2026-07-20) :

| Version                                                            | Date npm   | Type                | Contenu                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------ | ---------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [15.5.10](https://github.com/vercel/next.js/releases/tag/v15.5.10) | 2026-01-26 | **Sécurité**        | CVE-2025-59471, CVE-2025-59472, CVE-2026-23864 (voir section sécurité)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [15.5.11](https://github.com/vercel/next.js/releases/tag/v15.5.11) | 2026-01-28 | Bug fixes           | Fix memory leak dans le span map de tracing ([#85529](https://github.com/vercel/next.js/pull/85529)) ; taille minimale des items du LRU cache pour éviter une croissance non bornée ([#89134](https://github.com/vercel/next.js/pull/89134)) ; LRU cache avec scoping par invocation ID pour le response cache en minimal mode ([#89129](https://github.com/vercel/next.js/pull/89129)) ; fixes Turbopack/NFT tracing ([#82340](https://github.com/vercel/next.js/pull/82340), [#82757](https://github.com/vercel/next.js/pull/82757), [#84155](https://github.com/vercel/next.js/pull/84155), [#85323](https://github.com/vercel/next.js/pull/85323), [#83810](https://github.com/vercel/next.js/pull/83810)) |
| [15.5.12](https://github.com/vercel/next.js/releases/tag/v15.5.12) | 2026-02-04 | Re-release          | « This is a re-release of v15.5.11 applying the turbopack changes » ; fix « unlock in publish-native »                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| [15.5.13](https://github.com/vercel/next.js/releases/tag/v15.5.13) | 2026-03-16 | **Sécurité**        | Patch de `http-proxy` contre le request smuggling dans les rewrites — CVE-2026-29057                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| [15.5.14](https://github.com/vercel/next.js/releases/tag/v15.5.14) | 2026-03-19 | Bug fixes / feature | `next/image` : ajout d'un LRU disk cache et de l'option `images.maximumDiskCacheSize` ([#91660](https://github.com/vercel/next.js/pull/91660)) ; Pages Router : restauration de `Content-Length` et `ETag` sur les réponses JSON `/_next/data/` ([#90304](https://github.com/vercel/next.js/pull/90304))                                                                                                                                                                                                                                                                                                                                                                                                       |
| [15.5.15](https://github.com/vercel/next.js/releases/tag/v15.5.15) | 2026-04-08 | **Sécurité**        | DoS des React Server Components — CVE-2026-23869 (cf. [changelog Vercel](https://vercel.com/changelog/summary-of-cve-2026-23869))                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| [15.5.16](https://github.com/vercel/next.js/releases/tag/v15.5.16) | 2026-05-06 | **Sécurité**        | 12 advisories (6 high, 4 moderate, 2 low), CVE-2026-44572 à CVE-2026-44582 — voir section sécurité                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 15.5.17                                                            | —          | —                   | **Jamais publiée sur npm** (absente de `npm view next versions`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| [15.5.18](https://github.com/vercel/next.js/releases/tag/v15.5.18) | 2026-05-07 | **Sécurité**        | Les 12 advisories de 15.5.16 **plus** le follow-up du fix incomplet du middleware bypass (CVE-2026-45109 / GHSA-26hh-7cqf-hhc6)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| [15.5.19](https://github.com/vercel/next.js/releases/tag/v15.5.19) | 2026-06-01 | Bug fix             | « Don't drop `FormData` entries » ([#94244](https://github.com/vercel/next.js/pull/94244)) — concerne les Server Actions avec `FormData`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| [15.5.20](https://github.com/vercel/next.js/releases/tag/v15.5.20) | 2026-07-01 | Packaging           | « Contains no changes except publishing `@next/swc-wasm-web` » (package non publié depuis 15.5.15)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

## Correctifs de sécurité

Détails vérifiés via l'API GitHub Advisory (`api.github.com/advisories/<GHSA>`), qui fait autorité sur les plages de versions affectées.

### 15.5.10 (release de sécurité du 2026-01-26)

| Advisory                                                                 | CVE            | Sévérité | Description                                                                                              | Versions affectées → corrigée                                                                           |
| ------------------------------------------------------------------------ | -------------- | -------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [GHSA-9g9p-9gw9-jx7f](https://github.com/advisories/GHSA-9g9p-9gw9-jx7f) | CVE-2025-59471 | Medium   | DoS des applications self-hosted via la configuration `images.remotePatterns` de l'Image Optimizer       | `>= 10.0.0, < 15.5.10` → 15.5.10                                                                        |
| [GHSA-5f7q-jpqc-wp7h](https://github.com/advisories/GHSA-5f7q-jpqc-wp7h) | CVE-2025-59472 | Medium   | Consommation mémoire non bornée via le PPR Resume Endpoint                                               | Les versions **stables** 15.5.x ne sont **pas** dans les plages affectées (16.x et canaries uniquement) |
| [GHSA-83fc-fqcc-2hmg](https://github.com/advisories/GHSA-83fc-fqcc-2hmg) | CVE-2026-23864 | **High** | Multiples DoS dans React Server Components (`react-server-dom-webpack` < 19.2.4, vendorisé dans Next.js) | corrigé côté Next par 15.5.10                                                                           |

### 15.5.13 (2026-03-16)

| Advisory                                                                 | CVE            | Sévérité | Description                                                      | Versions affectées → corrigée   |
| ------------------------------------------------------------------------ | -------------- | -------- | ---------------------------------------------------------------- | ------------------------------- |
| [GHSA-ggv3-7p47-pfv8](https://github.com/advisories/GHSA-ggv3-7p47-pfv8) | CVE-2026-29057 | Medium   | HTTP request smuggling dans les rewrites (patch de `http-proxy`) | `>= 9.5.0, < 15.5.13` → 15.5.13 |

### 15.5.15 (2026-04-08)

| Advisory                                                                 | CVE            | Sévérité | Description                                                                       | Versions affectées → corrigée                                                                              |
| ------------------------------------------------------------------------ | -------------- | -------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| [GHSA-479c-33wc-g2pg](https://github.com/advisories/GHSA-479c-33wc-g2pg) | CVE-2026-23869 | **High** | DoS dans React Server Components (`react-server-dom-webpack` < 19.2.5, vendorisé) | corrigé côté Next par 15.5.15 ([changelog Vercel](https://vercel.com/changelog/summary-of-cve-2026-23869)) |

### 15.5.16 (2026-05-06) et 15.5.18 (2026-05-07)

Sévérité **high** :

| Advisory                                                                 | CVE            | Description                                                             | Corrigée en         |
| ------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------------- | ------------------- |
| [GHSA-8h8q-6873-q5fj](https://github.com/advisories/GHSA-8h8q-6873-q5fj) | —              | DoS avec Server Components                                              | 15.5.16             |
| [GHSA-267c-6grr-h53f](https://github.com/advisories/GHSA-267c-6grr-h53f) | CVE-2026-44575 | Middleware / Proxy bypass (App Router) via segment-prefetch routes      | 15.5.16 (incomplet) |
| [GHSA-26hh-7cqf-hhc6](https://github.com/advisories/GHSA-26hh-7cqf-hhc6) | CVE-2026-45109 | **Follow-up du fix incomplet** ci-dessus                                | **15.5.18**         |
| [GHSA-mg66-mrh9-m8jx](https://github.com/advisories/GHSA-mg66-mrh9-m8jx) | CVE-2026-44579 | DoS par connection exhaustion (Cache Components)                        | 15.5.16             |
| [GHSA-492v-c6pp-mqqv](https://github.com/advisories/GHSA-492v-c6pp-mqqv) | CVE-2026-44574 | Middleware / Proxy bypass par injection de paramètre de route dynamique | 15.5.16             |
| [GHSA-c4j6-fc7j-m34r](https://github.com/advisories/GHSA-c4j6-fc7j-m34r) | CVE-2026-44578 | SSRF via WebSocket upgrades                                             | 15.5.16             |
| [GHSA-36qx-fr4f-26g5](https://github.com/advisories/GHSA-36qx-fr4f-26g5) | CVE-2026-44573 | Middleware / Proxy bypass (Pages Router + i18n)                         | 15.5.16             |

Sévérité **moderate** :

| Advisory                                                                 | CVE            | Description                                                       | Corrigée en |
| ------------------------------------------------------------------------ | -------------- | ----------------------------------------------------------------- | ----------- |
| [GHSA-ffhc-5mcf-pf4q](https://github.com/advisories/GHSA-ffhc-5mcf-pf4q) | CVE-2026-44581 | XSS dans les applications App Router utilisant des **CSP nonces** | 15.5.16     |
| [GHSA-gx5p-jg67-6x7h](https://github.com/advisories/GHSA-gx5p-jg67-6x7h) | CVE-2026-44580 | XSS via scripts `beforeInteractive` avec entrée non fiable        | 15.5.16     |
| [GHSA-h64f-5h5j-jqjh](https://github.com/advisories/GHSA-h64f-5h5j-jqjh) | CVE-2026-44577 | DoS de l'Image Optimization API                                   | 15.5.16     |
| [GHSA-wfc6-r584-vfw7](https://github.com/advisories/GHSA-wfc6-r584-vfw7) | CVE-2026-44576 | Cache poisoning des réponses React Server Component               | 15.5.16     |

Sévérité **low** : [GHSA-vfv6-92ff-j949](https://github.com/advisories/GHSA-vfv6-92ff-j949) (CVE-2026-44582, cache poisoning par collisions du cache-busting RSC) et [GHSA-3g8h-86w9-wvmq](https://github.com/advisories/GHSA-3g8h-86w9-wvmq) (CVE-2026-44572, cache poisoning des redirects du middleware), corrigées en 15.5.16.

## Breaking changes / changements de comportement

- Aucun breaking change documenté. Les release notes 15.5.11 à 15.5.20 précisent : « This release is backporting bug fixes. It does **not** include all pending features/changes on canary » (ex. [v15.5.11](https://github.com/vercel/next.js/releases/tag/v15.5.11)).
- **Peer dependencies inchangées** entre 15.5.10 et 15.5.20 : `react`/`react-dom` `^18.2.0 || ^19.0.0` (source : `npm view next@15.5.16 peerDependencies`, idem 15.5.10 et 15.5.20). **React 19.2.3 est donc compatible, aucune mise à jour de React requise.**
- Changements de comportement mineurs à connaître :
  - 15.5.14 ([#91660](https://github.com/vercel/next.js/pull/91660)) : le cache disque de `next/image` devient un LRU borné, avec une nouvelle option `images.maximumDiskCacheSize` — comportement de cache image potentiellement différent en production self-hosted.
  - 15.5.10/15.5.16 : durcissements de l'Image Optimizer et du routing (prefetch, paramètres dynamiques) liés aux fixes de sécurité ; à couvrir par un passage de smoke test sur les images et la navigation.

## Impact sur ce repo

Scan léger du repo (état au 2026-07-20) :

- [`package.json`](../../package.json) : `next` épinglé en exact `15.5.9`, `react`/`react-dom` `19.2.3`, `next-auth ^4.24.12`, `@sentry/nextjs ^8.55.0`, `eslint-config-next 15.3.2`. Package manager **pnpm** (`packageManager: pnpm@10.23.0`, `preinstall: npx only-allow pnpm`).
- [`middleware.ts`](../../middleware.ts) : middleware **CSP avec nonce** appliqué à quasi toutes les routes → **directement concerné** par les 3 advisories de middleware bypass (CVE-2026-44574, CVE-2026-44575, CVE-2026-45109 — d'où le minimum réel **15.5.18**) et par le XSS via CSP nonces (CVE-2026-44581).
- [`next.config.js`](../../next.config.js) : `images.remotePatterns` configuré (S3 Scaleway) → **directement concerné** par CVE-2025-59471 (DoS via `remotePatterns`, fixé en 15.5.10) et CVE-2026-44577 (DoS Image Optimization API, fixé en 15.5.16). Beaucoup de composants utilisent `next/image`.
- App Router avec React Server Components → concerné par les DoS RSC : CVE-2026-23864 (15.5.10), CVE-2026-23869 (15.5.15), GHSA-8h8q-6873-q5fj et le cache poisoning RSC (15.5.16).
- **Server Actions** (`'use server'` dans `app/(normalLayout)/auth/mdp-oublie/page.tsx` et `app/(normalLayout)/mon-compte/page.tsx`) → concerné par le fix `FormData` de 15.5.19 ([#94244](https://github.com/vercel/next.js/pull/94244)).
- Rewrites : pas de `rewrites()` dans `next.config.js`, mais le `tunnelRoute: '/monitoring'` de `@sentry/nextjs` s'appuie sur le mécanisme de rewrite → CVE-2026-29057 (15.5.13) potentiellement pertinent, par prudence.
- Non concerné : Cache Components (non activé — CVE-2026-44579), i18n Pages Router (CVE-2026-44573), WebSocket upgrades custom (CVE-2026-44578), scripts `beforeInteractive` avec entrée non fiable (CVE-2026-44580) — ces fixes arrivent quand même avec la montée de version, sans action requise.

## Procédure de montée de version

Le repo impose pnpm ; la version étant épinglée en exact, mettre à jour explicitement (et aligner `eslint-config-next`, dont la 15.5.20 [existe sur npm](https://www.npmjs.com/package/eslint-config-next)) :

```bash
pnpm add next@15.5.20
pnpm add eslint-config-next@15.5.20   # optionnel : alignement (actuellement 15.3.2)
```

Puis vérifier (scripts du [`package.json`](../../package.json)) :

```bash
pnpm lint      # next lint
pnpm build     # next build (prebuild: only-include-used-icons)
pnpm test      # vitest
pnpm e2e       # playwright (nécessite l'environnement e2e)
```

Points de vigilance au smoke test : le header CSP + nonce sur les pages (middleware), l'optimisation d'images distantes (S3 Scaleway), les Server Actions (`mdp-oublie`, `mon-compte`), le tunnel Sentry `/monitoring`.

## Sources

- Registre npm : `npm view next versions --json`, `npm view next time --json`, `npm view next@{15.5.10,15.5.16,15.5.20} peerDependencies` (consultés le 2026-07-20). Dist-tags : `backport: 15.5.20`, `latest: 16.2.10`.
- Release notes GitHub : [v15.5.10](https://github.com/vercel/next.js/releases/tag/v15.5.10) · [v15.5.11](https://github.com/vercel/next.js/releases/tag/v15.5.11) · [v15.5.12](https://github.com/vercel/next.js/releases/tag/v15.5.12) · [v15.5.13](https://github.com/vercel/next.js/releases/tag/v15.5.13) · [v15.5.14](https://github.com/vercel/next.js/releases/tag/v15.5.14) · [v15.5.15](https://github.com/vercel/next.js/releases/tag/v15.5.15) · [v15.5.16](https://github.com/vercel/next.js/releases/tag/v15.5.16) · [v15.5.18](https://github.com/vercel/next.js/releases/tag/v15.5.18) · [v15.5.19](https://github.com/vercel/next.js/releases/tag/v15.5.19) · [v15.5.20](https://github.com/vercel/next.js/releases/tag/v15.5.20)
- GitHub Security Advisories (via `api.github.com/advisories/<id>`) : liens individuels dans les tableaux ci-dessus ; liste complète sur [github.com/vercel/next.js/security/advisories](https://github.com/vercel/next.js/security/advisories).
- Changelog Vercel (officiel) : [Summary of CVE-2026-23869](https://vercel.com/changelog/summary-of-cve-2026-23869).
