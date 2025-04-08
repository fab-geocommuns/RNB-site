import { cache } from 'react';

// @ts-ignore
import GhostContentAPI from '@tryghost/content-api';

export const getPosts = cache(async (page = 1) => {
  const api = getClient();

  return (
    api.posts
      .browse({
        filter: 'tag:blog',
        page: page,
        limit: 10,
        include: 'tags,authors',
      })
      // @ts-ignore
      .then((posts) => {
        return posts;
      })
      // @ts-ignore
      .catch((err) => {
        console.error(err);
      })
  );
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

  return api.posts.read({ slug: slug, include: 'tags' });
});

export const getBreakingNews = cache(async () => {
  const api = getClient();
  return api.pages.read({ id: '659547553d119000087a7f19' });
});

function getClient() {
  return new GhostContentAPI({
    url: process.env.NEXT_GHOST_API_URL,
    key: process.env.NEXT_GHOST_API_KEY,
    version: process.env.NEXT_GHOST_API_VERSION,
    makeRequest: async ({ url, method, params, headers }: any) => {
      // The Ghost client tries to use Axios to fetch pages, which throws an error in a Next.js 14 app
      // See: https://forum.ghost.org/t/tryghost-content-api-is-not-working-on-next-v14/47470
      const apiUrl = new URL(url);

      Object.keys(params).map((key) =>
        apiUrl.searchParams.set(key, params[key]),
      );

      try {
        const response = await fetch(apiUrl.toString(), { method, headers });
        const data = await response.json();
        return { data };
      } catch (error) {
        console.error(error);
        return { data: {} };
      }
    },
  });
}
