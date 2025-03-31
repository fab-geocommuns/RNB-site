'use client';

import { useRNBAuthentication } from '@/utils/use-rnb-authentication';

export default function AccountInformation() {
  const { user } = useRNBAuthentication({ require: true });

  if (!user) return <p>Chargement en cours</p>;

  return (
    <div>
      <p>
        Connecté en tant que <pre>{user.username}</pre>
      </p>
    </div>
  );
}
