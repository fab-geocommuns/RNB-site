'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { createRnbApi } from '@/utils/rnbApi';

// Client API authentifié avec le token de la session next-auth.
export function useRnbApi() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  return useMemo(() => createRnbApi({ token }), [token]);
}
