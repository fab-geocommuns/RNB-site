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

export const getPost = cache(async (slug: string) => {
  const api = getClient();

  return api.posts.read(
    {
      slug: slug,
    },
    {
      include: ['tags'],
    },
  );
});

export const getBreakingNews = cache(async (revalidate?: number) => {
  const api = getClient(revalidate);
  return api.pages.read({ id: '659547553d119000087a7f19' });
});

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
        // Pathname only: the query string holds the Ghost API key
        throw new Error(`Ghost ${response.status} on ${apiUrl.pathname}`);
      }
      return { data: await response.json() };
    },
  });
}
