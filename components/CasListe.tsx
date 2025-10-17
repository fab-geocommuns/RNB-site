// Components
import { getUseCases } from '@/utils/blog';
import styles from '@/styles/blog.module.scss';
import ArticleCard from '@/components/blog/ArticleCard';
import NewsletterForm from '@/components/NewsletterForm';

export default async function CasList() {
  const useCases = await getUseCases();

  if (!useCases) {
    return null;
  }

  return (
    <>
      {useCases?.map((post: any) => (
        <div key={post.id} className="fr-mb-8v">
          <ArticleCard
            showTags={false}
            showDate={false}
            post={post}
          ></ArticleCard>
        </div>
      ))}
    </>
  );
}
