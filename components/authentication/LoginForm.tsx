'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Input from '@codegouvfr/react-dsfr/Input';

function isSafeRedirectUrl(url: string): boolean {
  try {
    const urlObj = new URL(url, window.location.origin);
    return urlObj.origin === window.location.origin;
  } catch (error) {
    return false;
  }
}

export default function LoginForm() {
  const [credentialsError, setCredentialsError] = useState(false);

  const router = useRouter();

  // Get the redirect query parameter
  const params = useSearchParams();

  let redirectUrl = '/edition';
  const redirect = params.get('redirect');
  if (redirect && isSafeRedirectUrl(redirect)) {
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
      // FIXME: Investigate further why router.push does not preserve duplicate query parameters?
      // Is it a known behavior or a bug on our end?
      window.location.href = redirectUrl;
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
        data-testid="login-form"
      >
        <Input
          label="Email"
          id="email"
          nativeInputProps={{
            name: 'email',
            type: 'email',
            required: true,
            value: email,
            onChange: (e) => {
              setEmail(e.target.value);
            },
          }}
        />

        <Input
          label="Mot de passe"
          id="password"
          nativeInputProps={{
            name: 'password',
            type: 'password',
            required: true,
            value: password,
            onChange: (e) => {
              setPassword(e.target.value);
            },
            autoFocus: prefilledEmail !== '',
          }}
        />

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
