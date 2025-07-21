import { useSession } from 'next-auth/react';
import { useCallback } from 'react';

export function useRNBFetch() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken;

  const appendFromSiteParam = (url: string | URL): string => {
    const urlObj = url instanceof URL ? url : new URL(url);
    urlObj.searchParams.set('from', 'site');
    return urlObj.toString();
  };

  const customFetch = useCallback(
    (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      if (input instanceof URL || typeof input === 'string') {
        const url = input;
        if (!init) init = {};

        init.headers = {
          ...init.headers,
          Authorization: 'Token ' + accessToken,
          'Content-Type': 'application/json',
        };

        const urlWithParam = appendFromSiteParam(url);
        return fetch(urlWithParam, init);
      } else {
        const urlWithParam = appendFromSiteParam(input.url);
        input.headers.set('Authorization', 'Token ' + accessToken);
        input.headers.set('Content-Type', 'application/json');
        return fetch(
          {
            ...input,
            url: urlWithParam,
          },
          init,
        );
      }
    },
    [accessToken],
  );

  return {
    fetch: customFetch,
  };
}
