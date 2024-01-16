import GhostContentAPI from '@tryghost/content-api'

export function getPosts(page = 1) {
    
    const api = getClient()
    
    return api.posts
        .browse({limit: 5, include: 'tags,authors'})
        .then((posts) => {
            return posts;
        })
        .catch((err) => {
            console.error(err);
        });

}

function getClient() {
    return new GhostContentAPI({
        url: process.env.NEXT_GHOST_API_URL,
        key: process.env.NEXT_GHOST_API_KEY,
        version: process.env.NEXT_GHOST_API_VERSION
    })
}