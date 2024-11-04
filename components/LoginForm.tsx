'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';

import { Alert } from '@codegouvfr/react-dsfr/Alert';

export default function LoginForm({ redirectUrl = '' }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Credentials errors
  let startWithError = false;
  const params = useSearchParams();
  if (params.has('error') && params.get('error') == 'CredentialsSignin') {
    startWithError = true;
  }
  const [loginError, setLoginError] = useState(startWithError);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setLoginError(false);

    signIn('credentials', {
      username,
      password,
    })
      .then(() => (window.location.href = redirectUrl || '/'))
      .catch(console.error);
  };

  return (
    <>
      {loginError && (
        <>
          <div className="fr-mb-8v">
            <Alert title="Vos identifiant sont incorrects" severity="error" />
          </div>
        </>
      )}

      <form
        action="api/auth/callback/credentials"
        method="post"
        onSubmit={handleSubmit}
      >
        <div className="fr-input-group">
          <label className="fr-label" htmlFor="username">
            Identifiant
          </label>
          <input
            onChange={(e) => setUsername(e.target.value)}
            value={username}
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
            onChange={(e) => setPassword(e.target.value)}
            value={password}
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
