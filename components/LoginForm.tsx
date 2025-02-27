'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { Alert } from '@codegouvfr/react-dsfr/Alert';

export default function LoginForm() {
  const [credentialsError, setCredentialsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    const result = await signIn('credentials', {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setCredentialsError(true);
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
