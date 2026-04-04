# ProConnect Frontend Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add ProConnect authentication to the RNB frontend alongside the existing email/password flow.

**Architecture:** A second NextAuth CredentialsProvider (`proconnect`) receives the token from a dedicated callback page, validates it against the backend, and creates a standard NextAuth session. The DSFR `ProConnectButton` component triggers the flow from the login page.

**Tech Stack:** Next.js 15 (App Router), NextAuth v4, @codegouvfr/react-dsfr (ProConnectButton), TypeScript

**Spec:** `docs/superpowers/specs/2026-03-20-pro-connect-frontend-design.md`

---

### Task 0: Extract `isSafeRedirectUrl` to a shared utility

**Files:**

- Create: `utils/isSafeRedirectUrl.ts`
- Modify: `components/authentication/LoginForm.tsx`

- [ ] **Step 1: Create the shared utility**

Create `utils/isSafeRedirectUrl.ts`:

```typescript
export function isSafeRedirectUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch {
    return false;
  }
}
```

- [ ] **Step 2: Update LoginForm.tsx to use the shared utility**

In `components/authentication/LoginForm.tsx`:

1. Replace the local `isSafeRedirectUrl` function (lines 11-18) with an import:

```typescript
import { isSafeRedirectUrl } from '@/utils/isSafeRedirectUrl';
```

2. Remove the inline `function isSafeRedirectUrl(...)` definition.

- [ ] **Step 3: Verify the app builds**

Run: `pnpm build`
Expected: Build succeeds without errors.

- [ ] **Step 4: Commit**

```bash
git add utils/isSafeRedirectUrl.ts components/authentication/LoginForm.tsx
git commit -m "refactor: extract isSafeRedirectUrl to shared utility"
```

---

### Task 1: Add the `proconnect` CredentialsProvider to NextAuth

**Files:**

- Modify: `app/api/auth/[...nextauth]/auth.ts`

- [ ] **Step 1: Add the second CredentialsProvider**

In `app/api/auth/[...nextauth]/auth.ts`, add a second `CredentialsProvider` inside the `providers` array, after the existing `credentials` provider:

```typescript
CredentialsProvider({
  id: 'proconnect',
  name: 'ProConnect',
  credentials: {
    token: { type: 'text' },
    username: { type: 'text' },
  },
  async authorize(credentials) {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/users/me/`,
        {
          headers: {
            Authorization: `Token ${credentials?.token}`,
          },
        },
      );

      if (!res.ok) {
        return null;
      }

      const data = await res.json();

      return {
        id: String(data.id),
        token: credentials?.token as string,
        username: data.username,
        groups: data.groups,
      };
    } catch (error) {
      console.error('ProConnect auth error:', error);
      return null;
    }
  },
}),
```

The existing `jwt` and `session` callbacks already map `user.token`, `user.username`, `user.groups` — no changes needed there.

- [ ] **Step 2: Verify the app builds**

Run: `pnpm build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/\[\...nextauth\]/auth.ts
git commit -m "feat: add proconnect CredentialsProvider to NextAuth"
```

---

### Task 2: Create the ProConnect callback page

**Files:**

- Create: `app/(normalLayout)/auth/proconnect/callback/page.tsx`

- [ ] **Step 1: Create the callback page**

Create `app/(normalLayout)/auth/proconnect/callback/page.tsx`:

```tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Link from 'next/link';
import { isSafeRedirectUrl } from '@/utils/isSafeRedirectUrl';

export default function ProConnectCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const signInCalled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const token = params.get('token');
  const username = params.get('username');
  const errorParam = params.get('error');
  const errorDescription = params.get('error_description');
  const redirect = params.get('redirect');

  const destination =
    redirect && isSafeRedirectUrl(redirect) ? redirect : '/edition';

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(destination);
      return;
    }

    if (errorParam) {
      setError(errorDescription || errorParam);
      return;
    }

    if (!token || !username) {
      setError('Paramètres de connexion manquants.');
      return;
    }

    if (signInCalled.current) return;
    signInCalled.current = true;

    signIn('proconnect', {
      token,
      username,
      redirect: false,
    }).then((result) => {
      if (result?.error) {
        setError("Échec de l'authentification ProConnect.");
      } else {
        router.replace(destination);
      }
    });
  }, [
    token,
    username,
    errorParam,
    errorDescription,
    status,
    destination,
    router,
  ]);

  if (error) {
    return (
      <main className="fr-pt-md-14v" role="main">
        <div className="fr-container fr-container--fluid fr-mb-md-14v">
          <div className="fr-col-12 fr-col-md-6 fr-col-lg-6">
            <Alert
              description={error}
              severity="error"
              small
              closable={false}
            />
            <div className="fr-mt-3w">
              <Link href="/login" className="fr-link">
                Retour à la page de connexion
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="fr-pt-md-14v" role="main">
      <div className="fr-container fr-container--fluid fr-mb-md-14v">
        <p>Connexion en cours...</p>
      </div>
    </main>
  );
}
```

Key points:

- `useRef(signInCalled)` prevents double `signIn` in React strict mode
- `router.replace` (not `push`) so the token URL doesn't stay in browser history
- Handles 3 states: error from backend, loading, and success redirect
- If already authenticated, redirects immediately
- `redirect` param is validated via `isSafeRedirectUrl` to prevent open redirects
- `user_id` is present in the backend callback URL but intentionally unused — the CredentialsProvider fetches user data (including `id`) from `GET /auth/users/me/`

- [ ] **Step 2: Verify the app builds**

Run: `pnpm build`
Expected: Build succeeds. The new page is listed in the build output.

- [ ] **Step 3: Commit**

```bash
git add "app/(normalLayout)/auth/proconnect/callback/page.tsx"
git commit -m "feat: add ProConnect callback page"
```

---

### Task 3: Add the ProConnect button to the login form

**Files:**

- Modify: `components/authentication/LoginForm.tsx`

- [ ] **Step 1: Add the ProConnectButton and handler**

In `components/authentication/LoginForm.tsx`:

1. Add imports at the top:

```typescript
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';
```

2. Add a new state for ProConnect errors, next to the existing `credentialsError` state:

```typescript
const [proConnectError, setProConnectError] = useState(false);
```

3. Add the click handler function inside the component, after `handleSubmit`:

```typescript
const handleProConnect = async () => {
  setProConnectError(false);

  const callbackUrl = new URL(
    '/auth/proconnect/callback',
    window.location.origin,
  );
  if (redirectUrl !== '/edition') {
    callbackUrl.searchParams.set('redirect', redirectUrl);
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE}/auth/pro_connect/authorize/?redirect_uri=${encodeURIComponent(callbackUrl.toString())}`,
    );

    if (!res.ok) {
      setProConnectError(true);
      return;
    }

    const data = await res.json();
    window.location.href = data.authorization_url;
  } catch {
    setProConnectError(true);
  }
};
```

Note: `redirectUrl` is the variable already defined in the component (line 28 of the current file) — it is the validated redirect URL (passed through `isSafeRedirectUrl`), defaulting to `'/edition'`. We only pass it to the callback URL if it differs from the default.

4. Add the error alert and button in the JSX, after the closing `</form>` tag and before the final `</>`:

```tsx
{
  proConnectError && (
    <div className="fr-mt-3w">
      <Alert
        description="Impossible de contacter le service ProConnect. Veuillez réessayer."
        severity="error"
        small
        closable={false}
      />
    </div>
  );
}
<div className="fr-mt-3w">
  <ProConnectButton onClick={handleProConnect} />
</div>;
```

- [ ] **Step 2: Verify the app builds**

Run: `pnpm build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Manual smoke test**

Run: `pnpm dev`

1. Visit `http://localhost:3000/login`
2. Verify the ProConnect button is visible below the login form
3. Verify the "Qu'est-ce que ProConnect ?" link is present under the button
4. Click the button — it should show the error alert (backend not running / not configured), confirming the handler works

- [ ] **Step 4: Commit**

```bash
git add components/authentication/LoginForm.tsx
git commit -m "feat: add ProConnect button to login page"
```

---

### Task 4: Verify the full integration

This task is a manual verification checklist. It requires the backend (rnb-coeur) to be running with the ProConnect endpoints and the new `GET /auth/users/me/` endpoint.

- [ ] **Step 1: Configure the backend**

Ensure rnb-coeur is running with:

- `PRO_CONNECT_ALLOWED_REDIRECT_URIS` includes `http://localhost:3000/auth/proconnect/callback`
- The `GET /auth/users/me/` endpoint is implemented and returns `{id, username, groups}`

- [ ] **Step 2: Test the happy path**

1. Visit `http://localhost:3000/login`
2. Click the ProConnect button
3. Should redirect to Pro Connect login (or test environment)
4. After authenticating, should return to `http://localhost:3000/auth/proconnect/callback?token=...&user_id=...&username=...`
5. Should briefly show "Connexion en cours..." then redirect to `/edition`
6. The header should show the "Déco" button (user is logged in)

- [ ] **Step 3: Test error handling**

1. Visit `http://localhost:3000/auth/proconnect/callback?error=authentication_failed&error_description=Something+went+wrong`
2. Should display the error message with a link back to `/login`

- [ ] **Step 4: Test redirect preservation**

1. Visit `http://localhost:3000/login?redirect=/mon-compte/cles-api`
2. Click ProConnect button
3. After authentication, should redirect to `/mon-compte/cles-api` (not `/edition`)

- [ ] **Step 5: Test logout**

1. While logged in via ProConnect, click "Déco"
2. Should be logged out of RNB (session destroyed)
3. Should be able to log in again (via either method)
