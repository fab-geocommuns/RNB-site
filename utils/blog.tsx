import { cache } from 'react';

import GhostContentAPI from '@tryghost/content-api';

export const getPosts = cache(async (page = 1) => {
  const api = getClient();

  return api.posts
    .browse({
      filter: 'tag:blog',
      page: page,
      limit: 10,
      include: 'tags,authors',
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
  });
}
