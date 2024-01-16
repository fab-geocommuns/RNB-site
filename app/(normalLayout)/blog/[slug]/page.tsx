// Lib
import { getPosts } from '@/utils/blog';

async function getData() {
    return await getPosts()
}

export default async function Page() {


    const posts = await getData();
    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-py-12v">
                    <h1>SLUG</h1>
                    <ul>
                        {posts?.map((post) => (
                            <li key={post.id}>{post.title}</li>
                        ))}
                    </ul>
                    </div>
                </div>
            </div>
        </>
    )
}