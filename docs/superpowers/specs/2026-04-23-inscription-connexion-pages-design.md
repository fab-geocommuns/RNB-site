# Design: Split /login into /inscription and /connexion

## Overview

Replace the single `/login` page (which toggles between login and signup forms) with two dedicated pages: `/connexion` (login only) and `/inscription` (signup only). The old `/login` route redirects to `/inscription`.

## Routes

### `/inscription`

- Two-column layout (identical structure to current `/login`)
- Left column: grey block (`AuthBlock mode="signup"`)
  - ProConnect button at top
  - "ou" separator
  - `CreateAccountForm`
- Right column: existing "Le RNB est participatif" text (unchanged from current `/login`)
- Includes redirect URL safety check (same logic as current `/login`)
- Page title: "S'inscrire"

### `/connexion`

- Left column only — no right text column
- Left column: grey block (`AuthBlock mode="login"`)
  - ProConnect button at top
  - "ou" separator
  - `LoginForm`
- Preserves all `LoginForm` URL params: `?redirect=`, `?success=`, `?email=`
- Includes redirect URL safety check (same logic as current `/login`)
- Page title: "Se connecter"

### `/login`

- Simple `redirect('/inscription')` — no content rendered

## Component: AuthBlock

Modify `AuthBlock` to accept a required `mode: 'login' | 'signup'` prop.

- Remove `useState` toggle — mode is fixed by prop
- Remove the switcher link ("Afficher le formulaire d'inscription / de connexion")
- Title and `ClassicSignInSignUp` driven directly by `mode`
- `displayParam` / `initialForm` logic removed

## Navigation updates

All existing `/login` references updated:

| File                                                   | Old                               | New                            |
| ------------------------------------------------------ | --------------------------------- | ------------------------------ |
| `components/RNBHeader.tsx`                             | `/login?display=login&redirect=…` | `/connexion?redirect=…`        |
| `components/RNBHeader.tsx`                             | `/login?display=signup`           | `/inscription`                 |
| `components/RNBHeader.tsx`                             | `/login` (login button)           | `/connexion`                   |
| `components/LoginBtn.tsx`                              | `/login`                          | `/connexion`                   |
| `utils/use-rnb-authentication.tsx`                     | `/login?redirect=…`               | `/connexion?redirect=…`        |
| `app/(normalLayout)/activation/page.tsx`               | `/login?email=…&success=…`        | `/connexion?email=…&success=…` |
| `app/(normalLayout)/auth/proconnect/callback/page.tsx` | `/login`                          | `/connexion`                   |

## Redirect URL safety

Both new pages include the same origin-check logic currently in `/login/page.tsx`: parse the `?redirect=` param, verify it shares the same origin as the request host, and redirect to the page root if validation fails.
