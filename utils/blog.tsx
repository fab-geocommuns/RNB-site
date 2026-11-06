import { cache } from 'react';

import GhostContentAPI from '@tryghost/content-api';

// `revalidate` (seconds) caches the Ghost responses in the Next.js data cache.
// Without it, Ghost is called on every request.
export const getUseCases = cache(async (page = 1, revalidate?: number) => {
  const api = getClient(revalidate);

  return api.posts.browse({
    filter: 'tag:casusage',
    page: page,
    limit: 10,
    include: ['tags', 'authors'],
  });
});

export const getPosts = cache(async (page = 1) => {
  const api = getClient();

  return api.posts
    .browse({
      filter: 'tag:blog',
      page: page,
      limit: 10,
      include: ['tags', 'authors'],
    })
    .then((posts) => {
      return posts;
    })
    .catch((err) => {
      console.error(err);
    });
});

export function formattedDate(isoDateStr: string) {
  return new Date(isoDateStr).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Returns null for an unknown slug, so that the page can render a 404
export const getPost = cache(async (slug: string) => {
  const api = getClient();

  try {
    const post = await api.posts.read(
      {
        slug: slug,
      },
      {
        include: ['tags'],
      },
    );
    return post ?? null;
  } catch (err) {
    // Ghost answers a missing post with a NotFoundError body. A bare 404
    // (wrong URL or path) is a misconfiguration and must not become a 404 page.
    if (
      err instanceof GhostError &&
      err.status === 404 &&
      err.type === 'NotFoundError'
    )
      return null;
    throw err;
  }
});

export const getBreakingNews = cache(async (revalidate?: number) => {
  const api = getClient(revalidate);
  return api.pages.read({ id: '659547553d119000087a7f19' });
});

class GhostError extends Error {
  constructor(
    readonly status: number,
    pathname: string,
    // Ghost error type from the response body, e.g. NotFoundError
    readonly type?: string,
  ) {
    // Pathname only: the query string holds the Ghost API key
    super(`Ghost ${status} on ${pathname}`);
  }
}

function getClient(revalidate?: number) {
  return new GhostContentAPI({
    url: process.env.NEXT_GHOST_API_URL!,
    key: process.env.NEXT_GHOST_API_KEY!,
    version: process.env.NEXT_GHOST_API_VERSION!,
    makeRequest: async ({ url, method, params, headers }: any) => {
      // The Ghost client tries to use Axios to fetch pages, which throws an error in a Next.js 14 app
      // See: https://forum.ghost.org/t/tryghost-content-api-is-not-working-on-next-v14/47470
      const apiUrl = new URL(url);

      Object.keys(params).map((key) =>
        apiUrl.searchParams.set(key, params[key]),
      );

      const response = await fetch(apiUrl.toString(), {
        method,
        headers,
        ...(revalidate !== undefined && { next: { revalidate } }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new GhostError(
          response.status,
          apiUrl.pathname,
          body?.errors?.[0]?.type,
        );
      }
      return { data: await response.json() };
    },
  });
}
