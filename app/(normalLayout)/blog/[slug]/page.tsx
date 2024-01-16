

// Lib
import { getPost } from '@/utils/blog';

async function getData(slug: string) {
    return await getPost(slug);
    
}

export default async function Page({
    params
}: {
    params: {slug: string}
}) {


    const post = await getData(params.slug);
    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-py-12v">
                    <h1>{post.title}</h1>
                    <div dangerouslySetInnerHTML={{__html: post.html}}></div>
                    </div>
                </div>
            </div>
        </>
    )
}