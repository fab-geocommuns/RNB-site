'use client';

import { useSearchParams } from 'next/navigation';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';
import Alert from '@codegouvfr/react-dsfr/Alert';

export default function ActivationPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const email = searchParams.get('email');

  useEffect(() => {
    if (status === 'success') {
      const message =
        'Votre email a été validé. Vous pouvez désormais vous connecter';
      redirect(
        `/login?email=${encodeURIComponent(email || '')}&success=${encodeURIComponent(message)}`,
      );
    }
  }, [status, email]);

  if (status === 'success') {
    return null;
  }

  if (status === 'error') {
    return (
      <main className="fr-pt-md-14v" role="main">
        <div className="fr-container fr-container--fluid fr-mb-md-14v">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-12 fr-col-lg-12">
              <Alert
                severity="error"
                title="Erreur de validation de l'email"
                description={
                  <span>
                    La validation de votre email a échoué. Le lien de validation
                    est peut-être expiré ou invalide.
                    <br />
                    <strong>
                      Veuillez réessayer ou contacter le support
                    </strong>{' '}
                    via l'adresse{' '}
                    <a href="mailto:rnb@beta.gouv.fr">rnb@beta.gouv.fr</a> si le
                    problème persiste.
                  </span>
                }
              />
            </div>
          </div>
        </div>
      </main>
    );
  }

  throw new Error('Invalid activation status');
}
