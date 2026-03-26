'use client';
import { useState } from 'react';
import { ProConnectButton } from '@codegouvfr/react-dsfr/ProConnectButton';
import { Alert } from '@codegouvfr/react-dsfr/Alert';
import { Loader } from '@/components/Loader';

export default function ProFranceConnect() {
  const [proConnectError, setProConnectError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleProConnect = async () => {
    setProConnectError(false);
    setLoading(true);

    const callbackUrl = new URL(
      '/auth/proconnect/callback',
      window.location.origin,
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/auth/pro_connect/authorize/?redirect_uri=${encodeURIComponent(callbackUrl.toString())}`,
      );

      if (!res.ok) {
        setProConnectError(true);
        setLoading(false);
        return;
      }

      const data = await res.json();
      window.location.href = data.authorization_url;
    } catch {
      setProConnectError(true);
      setLoading(false);
    }
  };

  return (
    <>
      {proConnectError && (
        <div className="fr-mt-3w">
          <Alert
            description="Impossible de contacter le service ProConnect. Veuillez réessayer."
            severity="error"
            small
            closable={false}
          />
        </div>
      )}

      <div className="fr-mt-3w">
        <ProConnectButton onClick={handleProConnect} />
      </div>

      {loading && (
        <div
          className="fr-mt-3w"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Loader inline />
          Connexion via ProConnect en cours ...
        </div>
      )}
    </>
  );
}
