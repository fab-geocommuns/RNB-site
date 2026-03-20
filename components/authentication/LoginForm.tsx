'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

import { useSearchParams, useRouter } from 'next/navigation';

import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Input from '@codegouvfr/react-dsfr/Input';

import { isSafeRedirectUrl } from '@/utils/isSafeRedirectUrl';
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';

export default function LoginForm() {
  const [credentialsError, setCredentialsError] = useState(false);
  const [proConnectError, setProConnectError] = useState(false);

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
      router.push(redirectUrl);
    }
  };

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
      {proConnectError && (
        <div className="fr-mt-3w">
          <Alert
            description="Impossible de contacter le service ProConnect. Veuillez réessayer."
            severity="error"
            small
            closable={false}
          />
        </div>
      )}
      <div className="fr-mt-3w">
        <ProConnectButton onClick={handleProConnect} />
      </div>
    </>
  );
}
