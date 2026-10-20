'use client';

import { startTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import Button from '@codegouvfr/react-dsfr/Button';

export default function HistoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  // reset() alone re-renders the client tree: refresh() is needed to refetch the history
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--center fr-py-12v">
        <div className="fr-col-12 fr-col-md-8 fr-col-lg-6">
          <h1>Historique indisponible</h1>
          <p className="fr-text--lead">
            Une erreur est survenue lors du chargement de l&apos;historique de
            ce bâtiment. Veuillez réessayer dans quelques instants.
          </p>
          <Button onClick={retry}>Réessayer</Button>
        </div>
      </div>
    </div>
  );
}
