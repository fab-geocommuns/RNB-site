
// Lib
import { getPosts } from '@/utils/blog';


// Comps
import Link from 'next/link'
import ArticleCard from '@/components/blog/ArticleCard';

// Style
import styles from '@/styles/blog.module.scss'

// SEO
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: "Actualités du Référentiel National des Bâtiments",
    description: "Suivez la construction et la diffusion du Référentiel National des Bâtiments."
  }

async function getData(page: number) {
    const posts = await getPosts(page);
    return posts;
}

export default async function Page({params, searchParams} : {params: any, searchParams: any}) {

    const page = searchParams?.page || 1
    const posts = await getData(page);

    const nextPageUrl = function() {
        if (posts?.meta.pagination.next) {
            return '/blog?page=' + posts.meta.pagination.next
        }
        return null
    }
    const prevPageUrl = function() {
        if (posts?.meta.pagination.prev) {
            return '/blog?page=' + posts.meta.pagination.prev
        }
        return null
    }
    
    return (
        <>
            <div className={styles.blog}>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2 fr-py-12v">
                        <div className='fr-mb-12v'>
                    <h1 className='fr-mb-2v'>Les actualités du RNB</h1>
                    <p><b>Suivre la construction et la diffusion du Référential National des Bâtiments.</b></p>
                    </div>


                    <div>
                        {posts?.map((post) => (
                            <div key={post.id} className='fr-mb-8v'>
                            <ArticleCard post={post}></ArticleCard>
                            </div>
                            
                            
                        ))}
                    </div>

                    <div className={styles.pagination}>
                    {prevPageUrl() && <Link className='fr-btn fr-btn--secondary' href={prevPageUrl()}>&larr; Page précédente</Link>}
                    {nextPageUrl() && <Link className='fr-btn fr-btn--secondary' href={nextPageUrl()}>Page suivante &rarr;</Link>}    
                    </div>
                    
                    
                    </div>
                </div>
            </div>
            </div>
        </>
    )
}