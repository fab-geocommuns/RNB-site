'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import Link from 'next/link';

// Replaces the root layout: the DSFR is not loaded here, hence the bare markup
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body>
        <h1>Erreur inattendue</h1>
        <p>
          Désolé, le service rencontre un problème. Nous travaillons à le
          résoudre le plus rapidement possible.
        </p>
        <p>
          <Link href="/">Retour à l&apos;accueil</Link>
        </p>
      </body>
    </html>
  );
}
