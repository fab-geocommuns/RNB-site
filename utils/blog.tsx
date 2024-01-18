import GhostContentAPI from '@tryghost/content-api'

export function getPosts(page = 1) {
    
    const api = getClient()
    
    return api.posts
        .browse({
            filter: 'tag:blog',
            page: page,
            limit: 10, 
            include: 'tags,authors'
        })
        .then((posts) => {
            return posts;
        })
        .catch((err) => {
            console.error(err);
        });

} 

export function formattedDate(isoDateStr: string) {
    return new Date(isoDateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })

}

export function getPost(slug: string) {
    const api = getClient()

    return api.posts.read({slug: slug, include: 'tags'})
}
function getClient() {
    return new GhostContentAPI({
        url: process.env.NEXT_GHOST_API_URL,
        key: process.env.NEXT_GHOST_API_KEY,
        version: process.env.NEXT_GHOST_API_VERSION
    })
}