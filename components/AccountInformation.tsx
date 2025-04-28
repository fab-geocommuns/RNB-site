'use client';

import { useRNBAuthentication } from '@/utils/use-rnb-authentication';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import useRNBQuery from '@/utils/useRNBQuery';
import { useEffect, useState } from 'react';

type TokensResponse = {
  productionToken: string;
  sandboxToken: string;
};

export default function AccountInformation() {
  const { user } = useRNBAuthentication({ require: true });
  const { isLoading, error, data } = useRNBQuery<TokensResponse>({
    url: () => (user ? '/auth/users/me/tokens' : null),
    method: 'GET',
  });

  if (!user) return <p>Chargement en cours</p>;
  if (isLoading) return <p>Chargement en cours</p>;

  return (
    <div>
      <p>
        Connecté en tant que <pre>{user.username}</pre>
      </p>
      <p>
        <pre>{error ? error.message : JSON.stringify(data, null, 2)}</pre>
      </p>
    </div>
  );
}
