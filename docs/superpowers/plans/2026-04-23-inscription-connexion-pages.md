# Inscription / Connexion Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the single `/login` page into `/inscription` (signup) and `/connexion` (login), with `/login` redirecting to `/inscription`.

**Architecture:** Extend `AuthBlock` with a required `mode` prop that fixes which form is shown (no toggle). Each new page is a Next.js server component with the same redirect-URL safety check as the current `/login`. All existing `/login` references across the codebase are updated to point to the correct new route.

**Tech Stack:** Next.js 14 App Router (server components), React, DSFR (`@codegouvfr/react-dsfr`), NextAuth, SCSS modules, Playwright (e2e)

---

## File Map

**Modified:**

- `components/authentication/AuthBlock.tsx` — add `mode: 'login' | 'signup'` prop, remove toggle state/link
- `app/(normalLayout)/login/page.tsx` — replace body with redirect to `/inscription`
- `components/RNBHeader.tsx` — update 3 `/login` href values
- `components/LoginBtn.tsx` — update `/login` href to `/connexion`
- `utils/use-rnb-authentication.tsx` — update `/login?redirect=` to `/connexion?redirect=`
- `app/(normalLayout)/activation/page.tsx` — update `/login?email=…&success=…` to `/connexion?…`
- `app/(normalLayout)/auth/proconnect/callback/page.tsx` — update `/login` link to `/connexion`
- `tests/fixtures/pages/_page.ts` — update `goto('/login')` to `goto('/connexion')` in `login()`

**Created:**

- `app/(normalLayout)/inscription/page.tsx` — two-column page, `AuthBlock mode="signup"` + right text
- `app/(normalLayout)/connexion/page.tsx` — left-column-only page, `AuthBlock mode="login"`

---

### Task 1: Extend AuthBlock with a `mode` prop

**Files:**

- Modify: `components/authentication/AuthBlock.tsx`

- [ ] **Step 1: Replace the component with the mode-driven version**

Replace the entire contents of `components/authentication/AuthBlock.tsx` with:

```tsx
'use client';

import styles from '@/styles/login.module.scss';
import ProFranceConnect from '@/components/authentication/ProFranceConnect';
import ClassicSignInSignUp from '@/components/authentication/ClassicSignInSignUp';

interface AuthBlockProps {
  mode: 'login' | 'signup';
}

export default function AuthBlock({ mode }: AuthBlockProps) {
  return (
    <>
      <h2 className={styles.titleShell}>
        {mode === 'login' ? 'Se connecter' : "S'inscrire"} avec Pro Connect
      </h2>
      <ProFranceConnect />

      <div className={styles.orSeparator}>ou</div>

      <div className={styles.titleShell}>
        <h2>
          {mode === 'login'
            ? 'Se connecter avec mon email'
            : "S'inscrire avec mon email"}
        </h2>
      </div>

      <ClassicSignInSignUp displayedForm={mode} />
    </>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/paul/projects/rnb-site && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: errors only about missing `AuthBlock` usages (the old `/login` page still passes no props). Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add components/authentication/AuthBlock.tsx
git commit -m "refactor: AuthBlock accepts fixed mode prop, removes form toggle"
```

---

### Task 2: Create `/inscription` page

**Files:**

- Create: `app/(normalLayout)/inscription/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import pageTitle from '@/utils/pageTitle';
import styles from '@/styles/login.module.scss';
import AuthBlock from '@/components/authentication/AuthBlock';

export const metadata = pageTitle("S'inscrire");

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();
  if (session) {
    redirect('/edition');
  }

  const redirectUrl = (await searchParams).redirect as string | undefined;
  const headersList = await headers();

  if (redirectUrl) {
    const requestHost = headersList.get('host');
    const requestProtocol = headersList.get('x-forwarded-proto');
    const requestUrlRoot = requestProtocol
      ? `${requestProtocol}://${requestHost}`
      : `https://${requestHost}`;

    try {
      const redirectUrlObj = new URL(redirectUrl, requestUrlRoot);
      const requestUrlObj = new URL(requestUrlRoot);

      if (redirectUrlObj.origin !== requestUrlObj.origin) {
        throw new Error('Mauvaise origine');
      }
    } catch {
      redirect('/inscription');
    }
  }

  return (
    <main className="fr-pt-md-14v" role="main">
      <div className="fr-container fr-container--fluid fr-mb-md-14v">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <div
              className={`fr-container ${styles.shell} fr-px-md-12v fr-py-10v fr-py-md-14v`}
            >
              <AuthBlock mode="signup" />
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-6">
            <div className="fr-container fr-px-md-12v fr-py-10v fr-py-md-14v">
              <h3>Le RNB est participatif</h3>
              <p>
                <span className="stab stab--yellow">
                  <b>
                    Créer un compte vous permet de participer à l'amélioration
                    du RNB.
                  </b>
                </span>
              </p>
              <p>
                Vous pourrez directement éditer le référentiel, ajouter un
                bâtiment, corriger une adresse, désactiver les erreurs, ...
              </p>
              <p>
                Services de l'État, collectivités, citoyens, entreprises ou
                associations sont invités à apporter leur pierre au RNB.
              </p>
              <p>
                Le RNB est entièrement transparent. Chaque contribution est
                historisée, tracée et mise à disposition de tous.
              </p>
              <h6 className="fr-mt-12v">Consulter les données sans compte</h6>
              <p>
                Accéder aux données du RNB est gratuit et ne nécessite pas de
                compte.
              </p>
              <ul>
                <li>
                  <a href="/carte">Parcourir la carte des bâtiments</a>
                </li>
                <li>
                  <a
                    target="_blank"
                    href="https://www.data.gouv.fr/datasets/referentiel-national-des-batiments"
                  >
                    Télécharger le RNB
                  </a>
                </li>
                <li>
                  <a href="/doc">Accéder à la documentation technique</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/paul/projects/rnb-site && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add app/\(normalLayout\)/inscription/page.tsx
git commit -m "feat: add /inscription page with signup form and participative RNB text"
```

---

### Task 3: Create `/connexion` page

**Files:**

- Create: `app/(normalLayout)/connexion/page.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import pageTitle from '@/utils/pageTitle';
import styles from '@/styles/login.module.scss';
import AuthBlock from '@/components/authentication/AuthBlock';

export const metadata = pageTitle('Se connecter');

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();
  if (session) {
    redirect('/edition');
  }

  const redirectUrl = (await searchParams).redirect as string | undefined;
  const headersList = await headers();

  if (redirectUrl) {
    const requestHost = headersList.get('host');
    const requestProtocol = headersList.get('x-forwarded-proto');
    const requestUrlRoot = requestProtocol
      ? `${requestProtocol}://${requestHost}`
      : `https://${requestHost}`;

    try {
      const redirectUrlObj = new URL(redirectUrl, requestUrlRoot);
      const requestUrlObj = new URL(requestUrlRoot);

      if (redirectUrlObj.origin !== requestUrlObj.origin) {
        throw new Error('Mauvaise origine');
      }
    } catch {
      redirect('/connexion');
    }
  }

  return (
    <main className="fr-pt-md-14v" role="main">
      <div className="fr-container fr-container--fluid fr-mb-md-14v">
        <div className="fr-grid-row fr-grid-row--gutters">
          <div className="fr-col-12 fr-col-md-6">
            <div
              className={`fr-container ${styles.shell} fr-px-md-12v fr-py-10v fr-py-md-14v`}
            >
              <AuthBlock mode="login" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/paul/projects/rnb-site && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no new errors from this file.

- [ ] **Step 3: Commit**

```bash
git add app/\(normalLayout\)/connexion/page.tsx
git commit -m "feat: add /connexion page with login form only"
```

---

### Task 4: Replace `/login` with a redirect to `/inscription`

**Files:**

- Modify: `app/(normalLayout)/login/page.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `app/(normalLayout)/login/page.tsx` with:

```tsx
import { redirect } from 'next/navigation';

export default function LoginPage() {
  redirect('/inscription');
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/paul/projects/rnb-site && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/\(normalLayout\)/login/page.tsx
git commit -m "feat: redirect /login to /inscription"
```

---

### Task 5: Update all `/login` references to new routes

**Files:**

- Modify: `components/RNBHeader.tsx`
- Modify: `components/LoginBtn.tsx`
- Modify: `utils/use-rnb-authentication.tsx`
- Modify: `app/(normalLayout)/activation/page.tsx`
- Modify: `app/(normalLayout)/auth/proconnect/callback/page.tsx`
- Modify: `tests/fixtures/pages/_page.ts`

- [ ] **Step 1: Update `RNBHeader.tsx` — three occurrences**

In `components/RNBHeader.tsx`, make these three changes:

Change 1 — "Se connecter" quick action (around line 119):

```tsx
// Before
href: '/login?display=login&redirect=' + redirectUrl,
// After
href: '/connexion?redirect=' + redirectUrl,
```

Change 2 — "S'inscrire" quick action (around line 128):

```tsx
// Before
href: '/login?display=signup',
// After
href: '/inscription',
```

Change 3 — "S'inscrire" button inside the explainModal (around line 161):

```tsx
// Before
<Link href="/login" className="fr-btn fr-btn--primary">
// After
<Link href="/inscription" className="fr-btn fr-btn--primary">
```

- [ ] **Step 2: Update `LoginBtn.tsx`**

In `components/LoginBtn.tsx`, line 47:

```tsx
// Before
<Link href="/login" className="fr-btn fr-btn--secondary">
// After
<Link href="/connexion" className="fr-btn fr-btn--secondary">
```

- [ ] **Step 3: Update `use-rnb-authentication.tsx`**

In `utils/use-rnb-authentication.tsx`, line 43:

```tsx
// Before
window.location.href = `/login?redirect=${encodeURIComponent(currentLocation)}`;
// After
window.location.href = `/connexion?redirect=${encodeURIComponent(currentLocation)}`;
```

- [ ] **Step 4: Update `activation/page.tsx`**

In `app/(normalLayout)/activation/page.tsx`, line 18:

```tsx
// Before
redirect(
  `/login?email=${encodeURIComponent(email || '')}&success=${encodeURIComponent(message)}`,
);
// After
redirect(
  `/connexion?email=${encodeURIComponent(email || '')}&success=${encodeURIComponent(message)}`,
);
```

- [ ] **Step 5: Update `proconnect/callback/page.tsx`**

In `app/(normalLayout)/auth/proconnect/callback/page.tsx`, line 81:

```tsx
// Before
<Link href="/login" className="fr-link">
  Retour à la page de connexion
</Link>
// After
<Link href="/connexion" className="fr-link">
  Retour à la page de connexion
</Link>
```

- [ ] **Step 6: Update the Playwright test helper**

In `tests/fixtures/pages/_page.ts`, line 36:

```ts
// Before
await this.page.goto('/login');
// After
await this.page.goto('/connexion');
```

- [ ] **Step 7: Verify no remaining stray `/login` route references**

```bash
grep -rn "href.*['\"/]login['\"/]" /Users/paul/projects/rnb-site --include="*.tsx" --include="*.ts" | grep -v node_modules | grep -v ".next" | grep -v "login/page.tsx"
```

Expected: no output (or only the redirect file itself, which is fine).

- [ ] **Step 8: Verify TypeScript compiles**

```bash
cd /Users/paul/projects/rnb-site && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/RNBHeader.tsx components/LoginBtn.tsx utils/use-rnb-authentication.tsx app/\(normalLayout\)/activation/page.tsx app/\(normalLayout\)/auth/proconnect/callback/page.tsx tests/fixtures/pages/_page.ts
git commit -m "feat: update all /login references to /connexion or /inscription"
```

---

### Task 6: Manual smoke test

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/paul/projects/rnb-site && pnpm dev
```

- [ ] **Step 2: Verify `/inscription`**

Open `http://localhost:3000/inscription`.

Expected:

- Two-column layout: grey block on the left, "Le RNB est participatif" text on the right
- Grey block shows ProConnect button, "ou" separator, then the signup form (email, nom d'utilisateur, nom, prénom, mot de passe, confirmation)
- No form-switcher link at the bottom of the grey block
- Title in grey block reads "S'inscrire avec Pro Connect" and "S'inscrire avec mon email"

- [ ] **Step 3: Verify `/connexion`**

Open `http://localhost:3000/connexion`.

Expected:

- Left column only: grey block with ProConnect button, "ou" separator, then login form (email, mot de passe, "Mot de passe oublié ?", "Se connecter" button)
- No right column text
- Title reads "Se connecter avec Pro Connect" and "Se connecter avec mon email"

- [ ] **Step 4: Verify `/login` redirects**

Open `http://localhost:3000/login`.

Expected: browser redirects immediately to `/inscription`.

- [ ] **Step 5: Verify redirect param is preserved**

Open `http://localhost:3000/connexion?redirect=%2Fedition`.

Expected: page loads normally. After logging in, user is redirected to `/edition`.

- [ ] **Step 6: Verify header links**

Click "Se connecter" in the header → goes to `/connexion`.
Click "S'inscrire" in the header → goes to `/inscription`.
