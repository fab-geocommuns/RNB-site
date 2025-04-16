'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Link from 'next/link';

export default function LoginForm() {
  const [credentialsError, setCredentialsError] = useState(false);

  const router = useRouter();

  // Get the redirect query parameter
  const params = useSearchParams();

  let redirectUrl = '/';
  const redirect = params.get('redirect');
  if (redirect) {
    redirectUrl = redirect;
  }

  const successMessage = params.get('success');

  const prefilledEmail = params.get('email') || '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Remove errors
    setCredentialsError(false);

    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement)
      .value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)
      .value;

    const loginResult = await signIn('credentials', {
      username,
      password,
      callbackUrl: redirectUrl,
      redirect: false,
    });

    if (loginResult?.error) {
      setCredentialsError(true);
    } else {
      router.push(redirectUrl);
    }
  };

  return (
    <>
      {credentialsError && (
        <>
          <div className="fr-mb-3w">
            <Alert
              description="Identifiant ou mot de passe incorrect"
              severity="error"
              small
              closable={false}
            />
          </div>
        </>
      )}
      {successMessage && (
        <>
          <div className="fr-mb-3w">
            <Alert
              description={successMessage}
              severity="success"
              small
              closable={false}
            />
          </div>
        </>
      )}
      <form
        onSubmit={(e) => {
          handleSubmit(e);
        }}
        action="api/auth/callback/credentials"
        method="post"
      >
        <div className="fr-input-group">
          <label className="fr-label" htmlFor="username">
            Identifiant
          </label>

          <input
            className="fr-input"
            type="text"
            name="username"
            id="username"
            defaultValue={prefilledEmail}
          />
        </div>

        <div className="fr-input-group">
          <label className="fr-label" htmlFor="password">
            Mot de passe
          </label>
          <input
            className="fr-input"
            type="password"
            name="password"
            id="password"
            autoFocus={prefilledEmail !== ''}
          />
        </div>

        <button className="fr-btn" type="submit">
          Se connecter
        </button>

        <Link href="/reset-password" className="fr-link">
          Mot de passe oublié
        </Link>
      </form>
    </>
  );
}
