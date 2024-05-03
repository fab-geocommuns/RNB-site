

// Libs
import { getPost, formattedDate } from '@/utils/blog';

// Code highlighting
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);

// Components
import TagsList from '@/components/blog/TagsList';
import BackToTop from '@/components/BackToTop';
import NewsletterForm from '@/components/NewsletterForm'

// Style
import styles from '@/styles/blogArticle.module.scss'

// Import highlight.js styles and theme
import 'highlight.js/styles/atom-one-dark.css';

//import 'highlight.js/styles/github.css';


// SEO
import { Metadata, ResolvingMetadata } from 'next'

// Force cached parts (ghost content) to be refreshed every 10 seconds
export const revalidate = 10



async function getData(slug: string) {
    return await getPost(slug);
}

export async function generateMetadata(
    { params }: { params: { slug: string } },
    parent: ResolvingMetadata
  ): Promise<Metadata> {
    // The same request is made twice, but it's cached by Next.js and the React cache function
    const post = await getData(params.slug);
    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            siteName: 'Référentiel National des Bâtiments',
            images: [
                {
                    url: post.feature_image
                }
            ]
        }
    }

}

export default async function Page({
    params
}: {
    params: {slug: string}
}) {


    const post = await getData(params.slug);
    const dateStr = formattedDate(post.published_at)

    // find all code pre blocks in the html and replace them with highlighted code
    const postBody = post.html.replace(/<pre><code class="language-(.*?)">([\s\S]*?)<\/code><\/pre>/g, (match, lang, code) => {
        const highlightedCode = hljs.highlight(lang, code).value;
        return `<pre><code class="hljs language-${lang}">${highlightedCode}</code></pre>`;
    });

    
    
    return (
        <>
            <BackToTop></BackToTop>

        
            

            <div className="fr-container">

                <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">


                    <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">

                    
                    <div className='fr-mb-8v'>
                        <div><TagsList tags={post.tags}></TagsList></div>
                        <h2 className='fr-my-2v'>{post.title}</h2>
                        <div>Publié le {dateStr}</div>
                    </div>    

                    <p className='fr-text--lead'>{post.excerpt}</p>

                    <div className='fr-mb-16v'>
                    <img className={styles.featureImg} src={post.feature_image} />
                    </div>
                    

                    <div className={styles.articleBody} dangerouslySetInnerHTML={{__html: postBody}}></div>



                    <div className="block block--paleBlue block--smallNewsletterShell fr-mt-24v">
                
                        <p><b>Infolettre et réseaux</b><br/>Restez informé des <a href="/blog">actualités</a> du RNB en vous inscrivant à l'infolettre ou en nous suivant sur <a href="https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/">LinkedIn</a>.</p>
                        <NewsletterForm />
                    </div>  

                    </div>
                    
                </div>
            </div>
        </>
    )
}