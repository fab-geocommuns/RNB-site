import { useSession } from 'next-auth/react';

export function useRNBFetch() {
  const { data: session } = useSession();

  const customFetch = (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    if (input instanceof URL || typeof input === 'string') {
      if (!init) init = {};

      init.headers = {
        ...init.headers,
        Authorization: 'Token ' + (session as any)?.accessToken,
        'Content-Type': 'application/json',
      };

      return fetch(input, init);
    } else {
      input.headers.set(
        'Authorization',
        'Token ' + (session as any)?.accessToken,
      );
      input.headers.set('Content-Type', 'application/json');
      return fetch(input, init);
    }
  };

  return {
    fetch: customFetch,
  };
}
