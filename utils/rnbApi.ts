// Client HTTP pour l'API RNB-coeur.
// Centralise : base URL, `?from=site`, sérialisation JSON, token, parsing de la
// réponse et transformation des erreurs en messages lisibles.
// Utilisable côté serveur comme côté client ; côté composant authentifié,
// passer par le hook `useRnbApi()` qui injecte le token de session.

import { UNEXPECTED_ERROR_MESSAGE } from '@/utils/actionResult';

type QueryValue = string | number | boolean | null | undefined;

export type RnbApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  // Sérialisé en JSON, sauf FormData qui part tel quel (multipart).
  body?: unknown;
  query?: Record<string, QueryValue>;
  token?: string | null;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  // Côté serveur : `{ revalidate }` met la réponse en cache Next.js.
  next?: NextFetchRequestConfig;
};

export class RnbApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data: unknown = null,
  ) {
    super(message);
    this.name = 'RnbApiError';
  }
}

export function rnbApiUrl(path: string, query?: Record<string, QueryValue>) {
  const url = new URL(
    `${process.env.NEXT_PUBLIC_API_BASE}/${path.replace(/^\//, '')}`,
  );
  url.searchParams.set('from', 'site');
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// `detail` de DRF, sinon « champ : erreur1, erreur2 » par ligne.
export function humanizeApiError(data: unknown): string {
  if (data && typeof data === 'object') {
    if ('detail' in data && typeof data.detail === 'string') {
      return data.detail;
    }
    const messages = Object.entries(data)
      .map(
        ([field, errors]) =>
          `${field} : ${Array.isArray(errors) ? errors.join(', ') : String(errors)}`,
      )
      .join('\n');
    if (messages) return messages;
  }
  // Réponse vide ou non JSON (page HTML d'un 502…) : rien d'affichable.
  return UNEXPECTED_ERROR_MESSAGE;
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function rnbApiRequest<T = unknown>(
  path: string,
  {
    method = 'GET',
    body,
    query,
    token,
    headers,
    signal,
    cache,
    next,
  }: RnbApiRequestOptions = {},
): Promise<T> {
  const isFormData = body instanceof FormData;
  const finalHeaders = new Headers(headers);
  if (body !== undefined && !isFormData) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (token) {
    finalHeaders.set('Authorization', `Token ${token}`);
  }

  const response = await fetch(rnbApiUrl(path, query), {
    method,
    headers: finalHeaders,
    body:
      body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    signal,
    cache,
    next,
  });

  const data = await parseBody(response);
  if (!response.ok) {
    throw new RnbApiError(response.status, humanizeApiError(data), data);
  }
  // Succès mais corps non JSON (page HTML d'un proxy…) : ce n'est pas la
  // réponse attendue de l'API.
  if (typeof data === 'string') {
    throw new RnbApiError(response.status, UNEXPECTED_ERROR_MESSAGE, data);
  }
  return data as T;
}

type BodylessOptions = Omit<RnbApiRequestOptions, 'method' | 'body'>;

export function createRnbApi(
  defaults: Pick<RnbApiRequestOptions, 'token'> = {},
) {
  const request = <T>(path: string, options: RnbApiRequestOptions) =>
    rnbApiRequest<T>(path, {
      ...options,
      // Un `token: undefined` passé à l'appel ne doit pas effacer celui du client.
      token: options.token ?? defaults.token,
    });

  return {
    get: <T>(path: string, options?: BodylessOptions) =>
      request<T>(path, { ...options, method: 'GET' }),
    post: <T>(path: string, body?: unknown, options?: BodylessOptions) =>
      request<T>(path, { ...options, method: 'POST', body }),
    put: <T>(path: string, body?: unknown, options?: BodylessOptions) =>
      request<T>(path, { ...options, method: 'PUT', body }),
    patch: <T>(path: string, body?: unknown, options?: BodylessOptions) =>
      request<T>(path, { ...options, method: 'PATCH', body }),
    delete: <T>(path: string, options?: BodylessOptions) =>
      request<T>(path, { ...options, method: 'DELETE' }),
  };
}

export type RnbApi = ReturnType<typeof createRnbApi>;

// Appels publics, sans authentification.
export const rnbApi = createRnbApi();
