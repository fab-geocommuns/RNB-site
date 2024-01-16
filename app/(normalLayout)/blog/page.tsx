

// Lib
import { getPosts } from '@/utils/blog';

// Comps
import Link from 'next/link'

async function getData(page: number) {
    
    const posts = await getPosts(page);
    
    return posts;
}

export default async function Page({params, searchParams} : {params: any, searchParams: any}) {

    const page = searchParams?.page || 1
    const posts = await getData(page);

    const nextPageUrl = function() {
        if (posts.meta.pagination.next) {
            return '/blog?page=' + posts.meta.pagination.next
        }
        return null
    }
    const prevPageUrl = function() {
        if (posts.meta.pagination.prev) {
            return '/blog?page=' + posts.meta.pagination.prev
        }
        return null
    }
    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-py-12v">
                    <h1>Blog</h1>
                    <ul>
                        {posts?.map((post) => (
                            <li key={post.id}><Link href={"/blog/" + post.slug}>{post.title}</Link></li>
                        ))}
                    </ul>

                    <div>
                        
                    </div>
                    {prevPageUrl() && <Link href={prevPageUrl()}>Page précédente</Link>}
                    {nextPageUrl() && <Link href={nextPageUrl()}>Page suivante</Link>}
                    
                    </div>
                </div>
            </div>
        </>
    )
}