# Design : Intégration ProConnect dans le frontend RNB

## Contexte

Pro Connect est la solution d'identification de l'État français pour les agents publics (OIDC/OAuth 2.0). Le backend (rnb-coeur) expose déjà les 4 endpoints nécessaires sous `/api/alpha/auth/pro_connect/`. Ce document spécifie les modifications frontend (rnb-site, Next.js 15 + NextAuth v4 + DSFR) pour proposer l'authentification via ProConnect en complément du flow email/mot de passe existant.

## Décisions

| Élément                 | Décision                                                   | Justification                                                              |
| ----------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------- |
| Approche                | Page callback dédiée + second CredentialsProvider NextAuth | Séparation claire des responsabilités, flow NextAuth standard, pas de hack |
| Bouton                  | `ProConnectButton` de `@codegouvfr/react-dsfr`             | Composant officiel DSFR, déjà disponible dans les dépendances              |
| Déconnexion             | RNB uniquement (`signOut()` NextAuth)                      | POC — pas de déconnexion Pro Connect. Pourra évoluer plus tard             |
| Feature flag            | Aucun                                                      | POC — le bouton est toujours visible                                       |
| Récupération des groups | Appel API supplémentaire dans le CredentialsProvider       | Le callback backend ne retourne pas les groups dans l'URL de redirect      |

## Décision ouverte : déconnexion RNB only vs RNB + ProConnect

Pour le POC, la déconnexion ne termine que la session RNB (simple `signOut()` NextAuth). L'alternative serait d'appeler le backend `GET /auth/pro_connect/logout/` qui redirige vers le `end_session_endpoint` de Pro Connect, nécessitant de savoir côté frontend si l'utilisateur s'est connecté via ProConnect. À réévaluer après le POC.

## Adaptation backend requise

Le `POST /login/` classique retourne `{id, token, username, groups}`. Le callback ProConnect redirige avec `?token=...&user_id=...&username=...` (sans groups). Pour que le CredentialsProvider `proconnect` puisse reconstituer un objet user complet identique à celui du flow classique, il faut **unifier la réponse des deux flows**. Solution envisagée : un endpoint `GET /auth/users/me/` qui, authentifié par token, retourne `{id, username, groups}`. Ceci sera traité séparément dans rnb-coeur.

## Flow général

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
│  /login     │     │  Backend     │     │ Pro Connect │     │  /auth/      │
│  Clic bouton│────▶│  /authorize/ │────▶│  OIDC flow  │────▶│  proconnect/ │
│  ProConnect │     │  → auth URL  │     │  → callback │     │  callback    │
└─────────────┘     └──────────────┘     └─────────────┘     └──────────────┘
                                                                    │
                                                              signIn('proconnect')
                                                                    │
                                                              ┌─────▼────────┐
                                                              │  Backend     │
                                                              │  GET /me/    │
                                                              │  → {id,      │
                                                              │   username,  │
                                                              │    groups}   │
                                                              └─────┬────────┘
                                                                    │
                                                              Session NextAuth
                                                              créée, redirect
                                                              vers /edition
```

1. **Login page** — le bouton ProConnect appelle `GET /api/alpha/auth/pro_connect/authorize/?redirect_uri={callbackUrl}` pour obtenir l'`authorization_url`, puis redirige le navigateur. Le `redirect_uri` encode également l'URL de destination finale si le login a été déclenché depuis une page protégée (ex: `/auth/proconnect/callback?redirect=%2Fmon-compte`)
2. **Pro Connect** — l'utilisateur s'identifie, Pro Connect redirige vers le backend callback
3. **Backend callback** — redirige vers `/auth/proconnect/callback?token=...&user_id=...&username=...`
4. **Page callback frontend** — extrait les params, appelle `signIn('proconnect', ...)`, le CredentialsProvider valide le token et récupère les groups via un appel backend, session créée, redirect vers la destination finale (ou `/edition` par défaut)

En cas d'erreur du backend : redirect vers `/auth/proconnect/callback?error=...&error_description=...` — la page callback affiche l'erreur et propose un lien retour vers `/login`.

## Fichiers impactés

**Modifiés :**

| Fichier                                   | Modification                                              |
| ----------------------------------------- | --------------------------------------------------------- |
| `app/api/auth/[...nextauth]/auth.ts`      | Ajouter un second `CredentialsProvider` id `'proconnect'` |
| `components/authentication/LoginForm.tsx` | Ajouter le bouton `ProConnectButton` (DSFR)               |

**Créés :**

| Fichier                                                | Contenu                                                                |
| ------------------------------------------------------ | ---------------------------------------------------------------------- |
| `app/(normalLayout)/auth/proconnect/callback/page.tsx` | Page callback : extraction des params, appel `signIn`, gestion erreurs |

**Pas de nouveau composant, hook, ou route API** — on réutilise `ProConnectButton` de DSFR et le mécanisme NextAuth existant. Pas de nouvelle variable d'environnement — l'URL `authorize` est construite depuis `NEXT_PUBLIC_API_BASE`.

## Détail des modifications

### `auth.ts` — Second CredentialsProvider

Ajout d'un provider `proconnect` aux côtés de l'existant `credentials` :

```typescript
CredentialsProvider({
  id: 'proconnect',
  name: 'ProConnect',
  credentials: {
    token: { type: 'text' },
    username: { type: 'text' },
  },
  async authorize(credentials) {
    // Valide le token et récupère les groups via le backend
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/users/me/`,
      { headers: { Authorization: `Token ${credentials.token}` } },
    );
    if (!res.ok) return null;
    const data = await res.json(); // { id, username, groups }
    return {
      id: String(data.id),
      token: credentials.token,
      username: data.username,
      groups: data.groups,
    };
  },
}),
```

Note : le champ `id` est requis par NextAuth dans l'objet `User` retourné par `authorize`. Il provient de l'appel backend `GET /auth/users/me/`.

Les callbacks `jwt` et `session` existants n'ont pas besoin de modification — ils mappent déjà `user.token`, `user.username`, `user.groups` vers la session.

### `LoginForm.tsx` — Bouton ProConnect

Ajout du `ProConnectButton` de DSFR sous le formulaire email/mot de passe. Au clic :

1. Appel `GET ${NEXT_PUBLIC_API_BASE}/auth/pro_connect/authorize/?redirect_uri=${window.location.origin}/auth/proconnect/callback`
2. Récupère `authorization_url` de la réponse JSON
3. `window.location.href = authorization_url` — redirige le navigateur vers Pro Connect

Un nouvel état `proConnectError` gère les erreurs de cet appel (réseau, backend indisponible) et affiche une `Alert` DSFR sur la page login.

Note : le `ProConnectButton` DSFR est utilisé avec la prop `onClick` (pas `url`), ce qui rend un `<button>` et non un `<a>`. La directive CSP `form-action 'self'` du middleware n'est pas impactée car la navigation se fait via `window.location.href`, pas via une soumission de formulaire.

### Préservation de l'URL de redirect

Si l'utilisateur arrive sur `/login?redirect=/mon-compte`, cette URL de destination doit être préservée à travers le flow ProConnect :

1. Le bouton ProConnect encode le `redirect` dans le callback URL : `/auth/proconnect/callback?redirect=%2Fmon-compte`
2. Ce callback URL est passé comme `redirect_uri` au backend `/authorize/`
3. Le backend le préserve dans le state OIDC et le retourne après le callback : `/auth/proconnect/callback?token=...&redirect=%2Fmon-compte`
4. La page callback utilise le param `redirect` (ou `/edition` par défaut) comme destination finale

Note : cela nécessite que le backend préserve les query params additionnels du `redirect_uri` dans son flow. À vérifier lors de l'intégration — sinon, `sessionStorage` peut servir de fallback côté frontend.

### `app/(normalLayout)/auth/proconnect/callback/page.tsx` — Page callback

Page client (`'use client'`) qui utilise `useSearchParams()` de `next/navigation` (comme `LoginForm.tsx`) :

1. Lit les params : `token`, `user_id`, `username`, `error`, `error_description`, `redirect`
2. Si `error` présent — affiche une `Alert` DSFR severity `error` avec le message, et un lien retour vers `/login`
3. Si `token` présent — appelle `signIn('proconnect', { token, username, redirect: false })` dans un `useEffect` protégé par un `useRef` (guard contre le double-mount en React strict mode)
4. Si succès — `router.replace(redirect || '/edition')` (replace, pas push, pour ne pas garder le token dans l'historique)
5. Si échec — affiche une erreur
6. Pendant le traitement — affiche un état de chargement ("Connexion en cours...")

## Gestion d'erreurs

| Scénario                                             | Comportement                                                                      |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| Backend `/authorize/` indisponible ou erreur réseau  | `Alert` error sur la page login ("Impossible de contacter le service ProConnect") |
| Pro Connect redirige avec `?error=...`               | Page callback affiche l'erreur + lien retour vers `/login`                        |
| Token invalide (CredentialsProvider retourne `null`) | Page callback affiche "Échec de l'authentification" + lien retour                 |
| Utilisateur déjà connecté visite le callback         | Redirect vers la destination (`redirect` param ou `/edition`)                     |

## Sécurité

- Le token n'est jamais stocké en localStorage — il transite dans l'URL puis est injecté dans la session NextAuth (JWT httpOnly cookie)
- La page callback nettoie l'URL immédiatement via `router.replace` (le token ne reste pas dans l'historique du navigateur)
- La validation du redirect existante (`isSafeRedirectUrl`) n'est pas impactée
- Le CredentialsProvider `proconnect` valide le token auprès du backend avant de créer la session — un token forgé sera rejeté
- Le `useEffect` de la page callback est protégé par un `useRef` pour éviter un double appel `signIn` en React strict mode

## Déconnexion

Le bouton "Déco" (`LoginBtn.tsx`) n'est pas modifié. Pour tous les utilisateurs (classiques et ProConnect), `signOut()` de NextAuth détruit la session frontend. La session Pro Connect côté Pro Connect n'est pas impactée.
