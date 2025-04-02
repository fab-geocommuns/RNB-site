'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { Alert } from '@codegouvfr/react-dsfr/Alert';

export default function LoginForm() {
  const [credentialsError, setCredentialsError] = useState(false);

  const router = useRouter();

  // Get the redirect query parameter
  const params = useSearchParams();
  let redirectUrl = '/';
  if (params.has('redirect')) {
    // @ts-ignore
    redirectUrl = params.get('redirect');
  }

  // @ts-ignore
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Remove errors
    setCredentialsError(false);

    const username = e.target.username.value;
    const password = e.target.password.value;

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
              closable={false}
              small
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
          />
        </div>

        <button className="fr-btn" type="submit">
          Se connecter
        </button>
      </form>
    </>
  );
}
