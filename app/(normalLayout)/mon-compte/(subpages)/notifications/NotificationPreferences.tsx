'use client';

import { fr } from '@codegouvfr/react-dsfr';
import Alert from '@codegouvfr/react-dsfr/Alert';
import { ToggleSwitch } from '@codegouvfr/react-dsfr/ToggleSwitch';
import * as Sentry from '@sentry/nextjs';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';
import { useRnbApi } from '@/utils/useRnbApi';

export default function NotificationPreferences({
  initialSubscribed,
}: {
  initialSubscribed: boolean;
}) {
  const rnbApi = useRnbApi();
  const { status: sessionStatus } = useSession();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleChange = async (checked: boolean) => {
    const previous = subscribed;
    setSubscribed(checked);
    setSaving(true);
    setFailed(false);
    try {
      await rnbApi.put('/notifications/preferences/', { subscribed: checked });
      // Back/forward navigation would otherwise restore the stale initial value.
      router.refresh();
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
