'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Link from 'next/link';
import { isSafeRedirectUrl } from '@/utils/isSafeRedirectUrl';
import { Loader } from '@/components/Loader';

export default function ProConnectCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const signInCalled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const code = params.get('code');
  const errorParam = params.get('error');
  const redirect = params.get('redirect');

  const destination =
    redirect && isSafeRedirectUrl(redirect) ? redirect : '/edition';

  useEffect(() => {
    // A code is always exchanged, whatever `error` or the current session say:
    // an unconsumed code stays valid in the URL and could be replayed.
    if (code) {
      if (signInCalled.current) return;
      signInCalled.current = true;

      // Explicit callbackUrl: the default (current URL) would echo the code
      // into the next-auth callback-url cookie and response.
      signIn('proconnect', {
        code,
        redirect: false,
        callbackUrl: destination,
      })
        .then((result) => {
          if (result?.error) {
            setError(
              'Votre lien de connexion ProConnect est invalide ou a expiré. Veuillez vous reconnecter.',
            );
          } else {
            router.replace(destination);
          }
        })
        // Network failure or non-JSON response (proxy 502): signIn rejects
        .catch(() => {
          setError(
            "Une erreur est survenue lors de l'authentification ProConnect. Veuillez réessayer.",
          );
        });
      return;
    }

    if (status === 'authenticated') {
      router.replace(destination);
      return;
    }

    if (errorParam) {
      setError(
        "Une erreur est survenue lors de l'authentification ProConnect. Veuillez réessayer.",
      );
      return;
    }

    setError('Paramètres de connexion manquants.');
  }, [code, errorParam, status, destination, router]);

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
              <Link href="/connexion" className="fr-link">
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
        <div>
          <Loader inline />
          &nbsp;
          <b>Connexion via ProConnect en cours…</b>
        </div>
      </div>
    </main>
  );
}
