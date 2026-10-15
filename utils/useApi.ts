'use client';

import { useSession } from 'next-auth/react';
import { useMemo } from 'react';
import { createApi } from '@/utils/api';

// Client API authentifié avec le token de la session next-auth.
export function useApi() {
  const { data: session } = useSession();
  const token = (session as any)?.accessToken as string | undefined;
  return useMemo(() => createApi({ token }), [token]);
}
