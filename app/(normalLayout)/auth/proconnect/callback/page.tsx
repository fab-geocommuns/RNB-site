'use client';

import { useEffect, useRef, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import Link from 'next/link';
import { isSafeRedirectUrl } from '@/utils/isSafeRedirectUrl';
import { Loader } from '@/components/Loader';
import {
  consumeLoginCheck,
  LOGIN_CHECK_PARAM,
} from '@/utils/proConnectLoginCheck';

const GENERIC_ERROR =
  "Une erreur est survenue lors de l'authentification ProConnect. Veuillez réessayer.";
const INVALID_LINK_ERROR =
  'Votre lien de connexion ProConnect est invalide ou a expiré. Veuillez vous reconnecter.';

// Keyed by the `error` query param set by RNB-coeur's CallbackView
const ERROR_MESSAGES = new Map([
  [
    'mfa_required',
    "Votre compte ProConnect doit utiliser une double authentification. Activez-la auprès de votre fournisseur d'identité, puis reconnectez-vous.",
  ],
  [
    'access_denied',
    "ProConnect n'a pas autorisé la connexion de votre compte à ce service.",
  ],
]);

export default function ProConnectCallbackPage() {
  const params = useSearchParams();
  const router = useRouter();
  const { status } = useSession();
  const signInCalled = useRef(false);
  const [error, setError] = useState<string | null>(null);

  const code = params.get('code');
  const errorParam = params.get('error');
  const redirect = params.get('redirect');
  const loginCheck = params.get(LOGIN_CHECK_PARAM);

  const destination =
    redirect && isSafeRedirectUrl(redirect) ? redirect : '/edition';

  useEffect(() => {
    // A code from this tab is always exchanged, whatever `error` or the current
    // session say: an unconsumed code stays valid in the URL and could be
    // replayed. A code from elsewhere is left to expire (60 s).
    if (code) {
      if (signInCalled.current) return;
      signInCalled.current = true;

      // A login started from another browser (or a link sent by someone
      // else) is refused: it would open a session the visitor never asked for.
      if (!consumeLoginCheck(loginCheck)) {
        setError(INVALID_LINK_ERROR);
        return;
      }

      // Explicit callbackUrl: the default (current URL) would echo the code
      // into the next-auth callback-url cookie and response.
      signIn('proconnect', {
        code,
        redirect: false,
        callbackUrl: destination,
      })
        .then((result) => {
          if (result?.error) {
            setError(INVALID_LINK_ERROR);
          } else {
            router.replace(destination);
          }
        })
        // Network failure or non-JSON response (proxy 502): signIn rejects
        .catch(() => {
          setError(GENERIC_ERROR);
        });
      return;
    }

    if (status === 'authenticated') {
      router.replace(destination);
      return;
    }

    if (errorParam) {
      setError(ERROR_MESSAGES.get(errorParam) ?? GENERIC_ERROR);
      return;
    }

    setError('Paramètres de connexion manquants.');
  }, [code, errorParam, loginCheck, status, destination, router]);

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
