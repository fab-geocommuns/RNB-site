import * as Sentry from '@sentry/nextjs';

// Components
import { getUseCases } from '@/utils/blog';
import styles from '@/styles/blog.module.scss';
import ArticleCard from '@/components/blog/ArticleCard';

export default async function CasList() {
  // A Ghost failure hides the list instead of breaking the page
  const useCases = await getUseCases().catch((error) => {
    console.error('Error fetching use cases:', error);
    Sentry.captureException(error, { tags: { source: 'use cases' } });
    return null;
  });

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
