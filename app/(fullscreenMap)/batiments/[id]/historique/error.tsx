'use client';

import { startTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import ErrorPage from '@/components/ErrorPage';

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
    <ErrorPage
      title="Historique indisponible"
      lead="Une erreur est survenue lors du chargement de l'historique de ce bâtiment."
      details="Veuillez réessayer dans quelques instants."
      buttons={[
        { children: 'Réessayer', onClick: retry },
        {
          children: "Page d'accueil",
          priority: 'secondary',
          linkProps: { href: '/' },
        },
      ]}
    />
  );
}
