'use client';

import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import Button from '@codegouvfr/react-dsfr/Button';
import Link from 'next/link';
import { useState } from 'react';
import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';
import {
  unsubscribeFromNotifications,
  UnsubscribeResult,
} from './unsubscribeFromNotifications';

// Unsubscribes on click only: mail link scanners load the page without consent.
export default function UnsubscribeForm({ token }: { token: string }) {
  const [result, setResult] = useState<UnsubscribeResult | null>(null);
  const [failed, setFailed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClick = async () => {
    setSubmitting(true);
    setFailed(false);
    try {
      setResult(await unsubscribeFromNotifications(token));
    } catch {
      // Errors thrown by the action are already reported by onRequestError.
      setFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (result?.status === 'success') {
    return (
      <>
        <Alert
          severity="success"
          description={`L'adresse ${result.email} ne recevra plus ces notifications.`}
          closable={false}
          small={true}
        />
        <p className={fr.cx('fr-mt-3w')}>
          Vous pouvez vous réabonner depuis{' '}
          <Link href="/mon-compte/notifications">Mon compte</Link>.
        </p>
      </>
    );
  }

  if (result?.status === 'invalid_token') {
    return (
      <Alert
        severity="error"
        description="Ce lien de désinscription n'est pas valide."
        closable={false}
        small={true}
      />
    );
  }

  return (
    <>
      {failed && (
        <div className={fr.cx('fr-mb-3w')}>
          <Alert
            severity="error"
            description={UNEXPECTED_ERROR_MESSAGE}
            closable={false}
            small={true}
          />
        </div>
      )}
      <Button onClick={handleClick} disabled={submitting}>
        Me désinscrire
      </Button>
    </>
  );
}
