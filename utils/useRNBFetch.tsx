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
      const defaultHeaders: Record<string, string> = {};
      defaultHeaders['Content-Type'] = 'application/json';
      if (accessToken) {
        defaultHeaders['Authorization'] = 'Token ' + accessToken;
      }
      if (input instanceof URL || typeof input === 'string') {
        const url = input;
        if (!init) init = {};

        init.headers = {
          ...init.headers,
          ...defaultHeaders,
        };

        const urlWithParam = appendFromSiteParam(url);
        return fetch(urlWithParam, init);
      } else {
        const urlWithParam = appendFromSiteParam(input.url);
        for (const key in defaultHeaders) {
          input.headers.set(key, defaultHeaders[key]);
        }
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
