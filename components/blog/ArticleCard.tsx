// Comps
import TagsList from '@/components/blog/TagsList';

// Lib
import { formattedDate } from '@/utils/blog';

export default function ArticleCard({ post }) {
  const dateStr = formattedDate(post.published_at);

  return (
    <>
      <div className="fr-card fr-enlarge-link fr-card--horizontal fr-card--sm">
        <div className="fr-card__body">
          <div className="fr-card__content">
            <h3 className="fr-card__title">
              <a href={'/blog/' + post.slug} className="">
                {post.title}
              </a>
            </h3>

            <div className="fr-card__desc">
              <div className="fr-mb-2v">{dateStr}</div>
              <div>{post.excerpt}</div>
            </div>

            <div className="fr-card__start fr-mb-2v">
              <TagsList tags={post.tags}></TagsList>
            </div>
            <div className="fr-card__end"></div>
          </div>
        </div>
        <div className="fr-card__header">
          <div className="fr-card__img">
            <img
              className="fr-responsive-img"
              src={post.feature_image}
              data-fr-js-ratio="true"
            />
          </div>
        </div>
      </div>
    </>
  );
}
