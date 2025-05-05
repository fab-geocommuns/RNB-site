import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useRNBFetch() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const customFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (input instanceof URL || typeof input === 'string') {
        if (!init) init = {};

        init.headers = {
          ...init.headers,
          Authorization: 'Token ' + accessToken,
          'Content-Type': 'application/json',
        };

        return fetch(input, init);
      } else {
        input.headers.set('Authorization', 'Token ' + accessToken);
        input.headers.set('Content-Type', 'application/json');
        return fetch(input, init);
      }
    },
    [accessToken],
  );

  return {
    fetch: customFetch,
  };
}
