'use client';

import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import * as Sentry from '@sentry/nextjs';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';
import { useRNBFetch } from '@/utils/useRNBFetch';

export default function NotificationPreferences({
  initialSubscribed,
}: {
  initialSubscribed: boolean;
}) {
  const { fetch } = useRNBFetch();
  const { status: sessionStatus } = useSession();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleChange = async (checked: boolean) => {
    const previous = subscribed;
    setSubscribed(checked);
    setSaving(true);
    setFailed(false);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/notifications/preferences/`,
        { method: 'PUT', body: JSON.stringify({ subscribed: checked }) },
      );
      if (!response.ok) {
        throw new Error(
          `PUT notifications/preferences failed: ${response.status}`,
        );
      }
    } catch (error) {
      Sentry.captureException(error);
      setSubscribed(previous);
      setFailed(true);
    } finally {
      setSaving(false);
    }
  };

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
      <ToggleSwitch
        label="Recevoir un email quand un de mes signalements est traité, refusé ou commenté"
        checked={subscribed}
        onChange={handleChange}
        disabled={saving || sessionStatus === 'loading'}
        showCheckedHint={false}
      />
    </>
  );
}
