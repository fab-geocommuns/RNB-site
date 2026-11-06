'use client';

import { startTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import ErrorPage from '@/components/ErrorPage';

export default function NormalLayoutError({
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

  // reset() alone re-renders the client tree: refresh() is needed to rerun server components
  const retry = () =>
    startTransition(() => {
      router.refresh();
      reset();
    });

  return (
    <ErrorPage
      title="Erreur inattendue"
      lead="Désolé, le service rencontre un problème. Nous travaillons à le résoudre le plus rapidement possible."
      details="Essayez de rafraîchir la page ou réessayez dans quelques instants."
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
