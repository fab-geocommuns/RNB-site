# Alerte Dependabot : axios ≥ 1.13.5 (dépendance transitive via @tryghost/content-api)

> Recherche effectuée le 2026-07-20, uniquement à partir de sources primaires (advisories GitHub officiels d'axios via l'API GitHub `repos/axios/axios/security-advisories`, CHANGELOG.md du repo axios, registre npm, repo TryGhost/SDK, doc officielle pnpm.io). Chaque affirmation est sourcée. Les incertitudes sont signalées explicitement.

## Résumé (TL;DR)

- **L'alerte Dependabot vise [GHSA-43fc-jf86-j433](https://github.com/axios/axios/security/advisories/GHSA-43fc-jf86-j433) / CVE-2026-25639** : DoS via une clé `__proto__` dans `mergeConfig` (sévérité **High**, CVSS 7.5), corrigé dans **axios 1.13.5** (publié le 2026-02-08).
- **Le projet n'est en pratique pas exploitable** : axios n'est même pas exécuté à runtime — `utils/blog.tsx:72-89` passe un `makeRequest` custom basé sur `fetch` à `GhostContentAPI`, qui court-circuite entièrement axios. Et même sans cela, la vulnérabilité exige une config axios contrôlée par un attaquant, ce qui n'est pas le cas ici (appels sortants vers le CMS Ghost, paramètres construits par le SDK). C'est de l'hygiène de dépendances, pas une urgence.
- **⚠️ Monter à 1.13.5 exactement ne suffit pas** : axios a subi une vague massive d'advisories entre avril et juillet 2026 (~25 advisories publiés, dont plusieurs High, corrigés successivement en 1.15.0, 1.15.1, 1.15.2, 1.16.0 et 1.18.0). **Seul axios ≥ 1.18.0 est sans advisory connu à ce jour** (dernière version : **1.18.1**, publiée le 2026-06-22).
- **La voie la plus propre est de mettre à jour @tryghost/content-api : 1.12.0 → 1.12.10** (dernière version, publiée le 2026-07-07). Depuis la 1.12.4, Ghost épingle axios à une version exacte, et **la 1.12.10 épingle `axios@1.18.1`**. Le diff 1.12.0 → 1.12.10 du paquet ne contient **aucun changement de code source** (uniquement bumps de dépendances, config de build et tests) → aucun breaking change. Le `package.json` du repo déclare `^1.11.21`, donc la 1.12.10 est déjà dans la plage.
- **Commande recommandée** : `pnpm update @tryghost/content-api`, puis vérification avec `pnpm why axios` (doit afficher 1.18.1) et `pnpm audit`. Aucun override pnpm nécessaire.

---

## 1. Vulnérabilités corrigées entre axios 1.12.2 et 1.13.5

Source : liste complète des advisories officiels du repo axios, obtenue via l'API GitHub (`gh api /repos/axios/axios/security-advisories`), recoupée avec les pages advisories individuelles.

### 1.1 L'advisory qui motive l'alerte Dependabot

|                        |                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| **Advisory**           | [GHSA-43fc-jf86-j433](https://github.com/axios/axios/security/advisories/GHSA-43fc-jf86-j433) |
| **CVE**                | CVE-2026-25639                                                                                |
| **Titre**              | Denial of Service via `__proto__` Key in mergeConfig                                          |
| **Sévérité**           | High — CVSS 7.5                                                                               |
| **Versions affectées** | `>= 1.0.0` (branche 1.x) ; `<= 0.30.2` (branche 0.x)                                          |
| **Versions corrigées** | **`>= 1.13.5`** ; `>= 0.30.3`                                                                 |
| **Publié le**          | 2026-02-08                                                                                    |

**Vecteur** : `mergeConfig` (`lib/core/mergeConfig.js`) itérait sur les clés d'objets de config sans filtrer `__proto__`. Si une application passe à axios un objet de config issu de JSON contrôlé par un attaquant (p. ex. `JSON.parse('{"__proto__": {...}}')`), la fusion provoque un `TypeError` immédiat et fait crasher le process Node → déni de service. Le correctif (PR [#7369](https://github.com/axios/axios/pull/7369)) fait ignorer les clés `__proto__`, `constructor` et `prototype` ([notes de release v1.13.5](https://github.com/axios/axios/releases/tag/v1.13.5)).

### 1.2 Autre advisory dont la version corrigée est dans l'intervalle 1.12.2 → 1.13.5

| Advisory                                                                                                                                | CVE            | Sévérité | Affecté                    | Corrigé     | Remarque                                                                                                                                                                                                                                                |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------- | -------- | -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [GHSA-qj83-cq47-w5f8](https://github.com/axios/axios/security/advisories/GHSA-qj83-cq47-w5f8) — HTTP/2 Session Cleanup State Corruption | CVE-2026-39865 | Medium   | `> 1.0.0` (plage déclarée) | `>= 1.13.2` | Le code HTTP/2 n'a été introduit qu'en **1.13.0** ([changelog 1.13.0](https://github.com/axios/axios/blob/v1.x/CHANGELOG.md), PR #7150) : la plage déclarée est plus large que le code réellement vulnérable ; **axios 1.12.2 n'embarque pas ce code**. |

Pour mémoire, le DoS via `data:` URI ([GHSA-4hjh-wcwx-xvwj](https://github.com/advisories/GHSA-4hjh-wcwx-xvwj), CVE-2025-58754, High 7.5) a été corrigé en **1.12.0** : la 1.12.2 installée dans le repo est **déjà** couverte pour celui-là.

### 1.3 ⚠️ Advisories qui restent ouverts sur axios 1.13.5

Point important que Dependabot ne montre pas : **1.13.5 n'est pas une version "propre"**. La liste officielle des advisories du repo axios (source : [API GitHub security-advisories](https://github.com/axios/axios/security/advisories), consultée le 2026-07-20) montre une vague de publications entre avril et juillet 2026. Advisories dont la plage affectée **inclut 1.13.5** :

| Vague              | Corrigé dans        | Exemples (sévérité)                                                                                                                                                                                                                       |
| ------------------ | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-09         | **1.15.0**          | CVE-2025-62718 SSRF via bypass `NO_PROXY` (Medium) ; CVE-2026-40175 exfiltration métadonnées cloud (Medium)                                                                                                                               |
| 2026-04-24         | **1.15.1**          | CVE-2026-42033 gadgets prototype pollution (High) ; CVE-2026-42035 header injection (High) ; CVE-2026-42043 bypass du patch `NO_PROXY` (High) ; + ~7 Medium (CRLF injection, bypass `maxContentLength`, SSRF via alias IP…)               |
| 2026-04-24 / 05-29 | **1.15.2 / 1.16.0** | CVE-2026-42264 credential injection (High) ; CVE-2026-44492 `NO_PROXY` IPv4-mapped IPv6 (High) ; CVE-2026-44496 ReDoS cookies (High) ; CVE-2026-44486 fuite `Proxy-Authorization` (High) ; CVE-2026-44488 DoS (High) ; + plusieurs Medium |
| 2026-07-06         | **1.18.0**          | 10 advisories sans CVE assigné, quasi tous Medium (récursion `formDataToJSON`, gadgets prototype pollution, bypass `maxBodyLength`…), dont plusieurs avec plage `>= 1.0.0`                                                                |

Conclusion : **la seule cible raisonnable aujourd'hui est axios ≥ 1.18.0** (latest npm : **1.18.1**, publié le 2026-06-22 d'après le champ `time` du [registre npm](https://registry.npmjs.org/axios)). Aucun advisory publié à ce jour n'affecte 1.18.1.

---

## 2. Le projet est-il réellement exposé ?

**Non, pour trois raisons cumulatives.**

1. **axios n'est jamais exécuté.** Le repo construit son client Ghost avec un `makeRequest` custom qui utilise `fetch` natif (`/Users/paul/projects/rnb-site/utils/blog.tsx`, lignes 72-89, commentaire explicite : « The Ghost client tries to use Axios to fetch pages, which throws an error in a Next.js 14 app »). Le SDK Ghost n'appelle axios que si aucun `makeRequest` n'est fourni ; ici axios est installé dans `node_modules` mais **mort à runtime**.
2. **Le vecteur de CVE-2026-25639 n'existe pas ici.** Il faut qu'un attaquant contrôle l'objet de config passé à axios (JSON parsé côté serveur et injecté en config de requête). Dans l'usage `@tryghost/content-api`, la config est construite par le SDK à partir de l'URL/clé du CMS (variables d'env `NEXT_GHOST_API_URL`/`NEXT_GHOST_API_KEY`) et de paramètres de pagination internes — aucune entrée utilisateur.
3. **Les familles SSRF `NO_PROXY` et proxy ne s'appliquent pas non plus** : elles supposent qu'axios fasse des requêtes vers des URLs influencées par un attaquant derrière une config proxy — ici les appels sortants vont vers une URL fixe (le CMS Ghost).

L'alerte Dependabot est donc à traiter comme de **l'hygiène de chaîne d'approvisionnement** (et pour faire disparaître l'alerte), pas comme un correctif urgent d'une faille exploitable.

---

## 3. Breaking changes axios 1.12.2 → 1.13.5 (et au-delà)

Source : [CHANGELOG.md du repo axios (branche v1.x)](https://github.com/axios/axios/blob/v1.x/CHANGELOG.md) et [releases GitHub](https://github.com/axios/axios/releases), sections 1.13.0 → 1.13.5 lues intégralement.

**Aucune section "BREAKING CHANGES" n'apparaît dans le changelog entre 1.12.2 et 1.13.5** (la seule du fichier concerne la 1.8.0, antérieure et donc hors sujet). Changements de comportement notables quand même :

| Version (date)          | Changement                                                                                                                                                                                                                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1.13.0** (2025-10-27) | Ajout du **support HTTP/2** (opt-in, PR #7150). Pas de breaking change déclaré.                                                                                                                                                                                                    |
| **1.13.1** (2025-10-28) | Fix régression : stream de réponse interrompu pour les statuts HTTP non-OK.                                                                                                                                                                                                        |
| **1.13.2** (2025-11-04) | Fix « socket hang up » sur keep-alive + timeouts ; correctif de l'advisory HTTP/2 (voir §1.2).                                                                                                                                                                                     |
| **1.13.3** (2026-01-20) | Grosse release : `AxiosError` devient une erreur native (#5558), gestion d'erreur dans le même intercepteur (#6269), condition d'export `bun`, champ `main` aligné sur les artefacts CJS. **A introduit des régressions** (dont la perte du champ `status` sur `AxiosError`).      |
| **1.13.4** (2026-01-27) | Corrige les régressions de la 1.13.3 (merge configs cassés, exports TypeScript).                                                                                                                                                                                                   |
| **1.13.5** (2026-02-08) | Correctif de sécurité `mergeConfig` (§1.1) ; restaure `AxiosError.status` ; ajoute l'option `useLegacyInterceptorOrder` pour **restaurer l'ordre d'exécution des intercepteurs d'avant la v1.13** — signe qu'un changement d'ordre des intercepteurs a eu lieu dans la série 1.13. |

Impact pour ce repo : **nul** — le code n'utilise pas axios directement (pas d'intercepteurs, pas d'`AxiosError` attrapé), et le SDK Ghost n'utilise que `axios.get`/instance basique. Par ailleurs, pour la montée jusqu'à 1.18.1 : c'est **Ghost lui-même qui épingle `axios@1.18.1`** dans @tryghost/content-api@1.12.10 (voir §4) et fait tourner sa suite de tests dessus, ce qui sert de validation amont. Le `package.json` d'axios 1.18.1 ne déclare pas de champ `engines` (source : [registre npm](https://registry.npmjs.org/axios/latest)) — pas de contrainte Node nouvelle.

---

## 4. @tryghost/content-api : la mise à jour du parent règle tout

Source : [registre npm @tryghost/content-api](https://registry.npmjs.org/@tryghost/content-api) (champs `dist-tags`, `versions[].dependencies`, `time`), consulté le 2026-07-20.

### 4.1 Versions publiées après 1.12.0 et plage axios déclarée

| Version                | Publiée le | `dependencies.axios`     |
| ---------------------- | ---------- | ------------------------ |
| 1.12.0 _(installée)_   | 2025-07-22 | `^1.0.0`                 |
| 1.12.2                 | 2025-11-19 | `^1.0.0`                 |
| 1.12.3                 | 2026-01-12 | `^1.0.0`                 |
| 1.12.4 / 1.12.5        | 2026-02-26 | `1.13.5` (épinglé exact) |
| 1.12.6                 | 2026-03-18 | `1.13.6`                 |
| 1.12.7                 | 2026-04-27 | `1.15.2`                 |
| 1.12.8                 | 2026-05-12 | `1.16.0`                 |
| 1.12.9                 | 2026-06-08 | `1.17.0`                 |
| **1.12.10** (`latest`) | 2026-07-07 | **`1.18.1`**             |

Constats :

- La version installée (1.12.0) déclare `axios: "^1.0.0"` : **la plage accepte déjà 1.13.5 et même 1.18.1**. Un simple rafraîchissement de la résolution dans le lockfile suffirait donc _techniquement_ sans toucher à @tryghost/content-api (voir §5.2 pour les limites de cette approche).
- Depuis la 1.12.4 (juste après CVE-2026-25639), Ghost **épingle axios à une version exacte** et suit les correctifs de sécurité release après release (Renovate dans le repo [TryGhost/SDK](https://github.com/TryGhost/SDK) : commits « Update dependency axios to v1.15.0 [SECURITY] », etc.).
- Corollaire : après passage en 1.12.10, les futurs correctifs axios nécessiteront une nouvelle release de @tryghost/content-api (le pin exact empêche un simple refresh de lockfile) — Ghost les publie rapidement d'après l'historique ci-dessus.

### 4.2 Breaking changes 1.12.0 → 1.12.10 ?

**Aucun.** Le diff officiel entre les deux tags ([TryGhost/SDK compare @tryghost/content-api@1.12.0...@tryghost/content-api@1.12.10](https://github.com/TryGhost/SDK/compare/@tryghost/content-api@1.12.0...@tryghost/content-api@1.12.10)) ne touche, dans `packages/content-api/`, que : `package.json` (bumps de dépendances), `rollup.config.js` (renommage de plugins de build), `LICENSE`/`README` (cosmétique) et **des tests ajoutés** (dont des tests d'intégration). Zéro modification du code source `lib/`. Ce sont toutes des releases patch (1.12.x), conformes à semver.

### 4.3 Compatibilité avec ce repo

`/Users/paul/projects/rnb-site/package.json` déclare `"@tryghost/content-api": "^1.11.21"` → la 1.12.10 est dans la plage, **aucune modification de `package.json` n'est nécessaire**. Le garde-fou `minimumReleaseAge: 2880` (2 jours) de `pnpm-workspace.yaml` est satisfait : content-api 1.12.10 a 13 jours, axios 1.18.1 a 28 jours.

---

## 5. Méthodes pnpm pour forcer une transitive (comparées)

Contexte outillage : `packageManager: pnpm@10.23.0` dans `package.json` (confirmé par `pnpm --version` → 10.23.0). axios n'apparaît qu'une seule fois dans `pnpm-lock.yaml`, uniquement via @tryghost/content-api.

### 5.1 Mettre à jour le parent — **recommandé ici**

```bash
pnpm update @tryghost/content-api
```

Monte à 1.12.10 (dans la plage `^1.11.21`), qui épingle `axios@1.18.1`. Résout l'alerte Dependabot **et** tous les advisories d'avril-juillet 2026, sans override à maintenir, en suivant la version validée par Ghost.

### 5.2 `pnpm update axios` (refresh de résolution)

Puisque la 1.12.0 installée déclare `axios: ^1.0.0`, re-résoudre la plage donnerait axios 1.18.1 sans changer @tryghost/content-api. **Réserve** : la [doc officielle de `pnpm update`](https://pnpm.io/cli/update) ne documente pas explicitement la mise à jour d'une dépendance _transitive_ nommée (l'option `--depth` n'y est illustrée que pour la récursion dans un workspace) — le comportement de `pnpm update axios` quand axios n'est pas une dépendance directe n'est donc pas garanti par la doc. C'est une option de repli, pas la voie principale ; et elle laisse le projet sur content-api 1.12.0 alors que 1.12.10 est sans risque.

### 5.3 Overrides pnpm

Pour pnpm 10, les overrides se déclarent dans **`pnpm-workspace.yaml`** (« the overrides field can only be set at the root of the project », [doc pnpm — settings/overrides](https://pnpm.io/settings#overrides)) :

```yaml
# pnpm-workspace.yaml
overrides:
  '@tryghost/content-api>axios': '>=1.18.1' # ciblage du seul parent, syntaxe "parent>enfant" documentée
  # ou, plus simple, globalement : "axios": ">=1.18.1"
```

La syntaxe `qar@1>zoo` (n'écraser `zoo` que sous `qar@1`) est documentée sur la même page. **Non nécessaire ici** : l'override est un marteau à réserver aux cas où le parent refuse la version voulue — or content-api 1.12.10 embarque déjà la bonne version. Un override ajouterait un réglage permanent à maintenir (et à penser à retirer).

---

## 6. Recommandation et vérification

```bash
# 1. Mise à jour (dans /Users/paul/projects/rnb-site)
pnpm update @tryghost/content-api

# 2. Vérifications
pnpm why axios                      # attendu : @tryghost/content-api 1.12.10 → axios 1.18.1
pnpm ls @tryghost/content-api       # attendu : 1.12.10
pnpm audit                          # plus d'advisory axios
pnpm build && pnpm test             # le blog (utils/blog.tsx) est la seule surface concernée
```

Risque de la manœuvre : quasi nul (patch releases sans changement de code source côté content-api ; axios non exécuté à runtime dans ce repo). Si l'on voulait le strict minimum pour éteindre Dependabot, `axios@1.13.5` suffirait — mais ce serait rester exposé (théoriquement) à ~25 advisories publiés depuis, pour aucun gain.

---

## Sources

- Advisory principal : https://github.com/axios/axios/security/advisories/GHSA-43fc-jf86-j433 (CVE-2026-25639)
- Liste complète des advisories axios : https://github.com/axios/axios/security/advisories (détail machine via `gh api /repos/axios/axios/security-advisories`, consulté le 2026-07-20)
- Advisory SSRF NO_PROXY : https://github.com/advisories/GHSA-3p68-rc4w-qgx5 (CVE-2025-62718) ; bypass du patch : https://github.com/axios/axios/security/advisories/GHSA-pmwg-cvhr-8vh7 (CVE-2026-42043)
- Advisory data: URI (déjà corrigé en 1.12.0) : https://github.com/advisories/GHSA-4hjh-wcwx-xvwj (CVE-2025-58754)
- Changelog axios : https://github.com/axios/axios/blob/v1.x/CHANGELOG.md ; releases : https://github.com/axios/axios/releases (dont https://github.com/axios/axios/releases/tag/v1.13.5 et v1.13.0)
- Registre npm axios (dates, latest 1.18.1) : https://registry.npmjs.org/axios
- Registre npm @tryghost/content-api (versions, plages axios, dates) : https://registry.npmjs.org/@tryghost/content-api
- Diff @tryghost/content-api 1.12.0 → 1.12.10 : https://github.com/TryGhost/SDK/compare/@tryghost/content-api@1.12.0...@tryghost/content-api@1.12.10
- Doc pnpm overrides (pnpm-workspace.yaml, syntaxe `parent>enfant`) : https://pnpm.io/settings#overrides ; doc `pnpm update` : https://pnpm.io/cli/update
- Fichiers du repo : `/Users/paul/projects/rnb-site/package.json` (pnpm@10.23.0, `@tryghost/content-api: ^1.11.21`), `/Users/paul/projects/rnb-site/pnpm-lock.yaml` (axios 1.12.2, unique parent), `/Users/paul/projects/rnb-site/pnpm-workspace.yaml` (`minimumReleaseAge: 2880`), `/Users/paul/projects/rnb-site/utils/blog.tsx` (makeRequest custom via fetch, lignes 72-89)
