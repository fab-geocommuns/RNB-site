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
      setError(
        "Une erreur est survenue lors de l'authentification ProConnect. Veuillez réessayer.",
      );
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
        <div>
          <Loader inline />
          &nbsp;
          <b>Connexion via Pro Connect en cours ...</b>
        </div>
      </div>
    </main>
  );
}
