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
  const redirect = params.get('redirect');
  if (redirect) {
    redirectUrl = redirect;
  }

  const [successMessage, setSuccessMessage] = useState<string | null>(
    params.get('success'),
  );

  const prefilledEmail = params.get('email') || '';

  const [email, setEmail] = useState(prefilledEmail);
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage(null);
    setCredentialsError(false);

    const form = e.currentTarget;

    const loginResult = await signIn('credentials', {
      username: email,
      password: password,
      callbackUrl: redirectUrl,
      redirect: false,
    });

    if (loginResult?.error) {
      setCredentialsError(true);
    } else {
      setSuccessMessage('Connexion réussie');
      router.push(redirectUrl);
    }
  };

  return (
    <>
      {credentialsError && (
        <>
          <div className="fr-mb-3w">
            <Alert
              description="Email ou mot de passe incorrect"
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
          <label className="fr-label" htmlFor="email">
            Email
          </label>

          <input
            className="fr-input"
            type="text"
            name="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
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
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            autoFocus={prefilledEmail !== ''}
          />
        </div>

        <div className="fr-mb-3w">
          <a
            className="fr-link fr-link--bold"
            href={`/auth/mdp-oublie?email=${encodeURIComponent(email)}`}
            title="Mot de passe oublié ?"
          >
            Mot de passe oublié ?
          </a>
        </div>

        <button className="fr-btn" type="submit">
          Se connecter
        </button>
      </form>
    </>
  );
}
