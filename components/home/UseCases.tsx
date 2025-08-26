import { PostsOrPages } from '@tryghost/content-api';
import Card from '@codegouvfr/react-dsfr/Card';
import Tile from '@codegouvfr/react-dsfr/Tile';

// Styles
import styles from '@/styles/home.module.scss';

type Props = {
  useCases: PostsOrPages;
};

export default function UseCases({ useCases }: Props) {
  const featuredUseCase = useCases.slice(0, 3);
  return (
    <div className="section">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 ">
          <div className="section__titleblock">
            <h2 className="section__title">Cas d&apos;usage</h2>
            <p className="section__subtitle">
              Exemples d&apos;utilisation du RNB
            </p>
          </div>

          <div className="fr-grid-row fr-grid-row--gutters">
            {featuredUseCase.map((useCase) => (
              <div className="fr-col-12 fr-col-md-4 " key={useCase.id}>
                <Card
                  background
                  border
                  enlargeLink
                  className={styles['card-use-case']}
                  imageUrl={useCase.feature_image || ''}
                  imageAlt={useCase.feature_image_alt || ''}
                  linkProps={{ href: '/cas/' + useCase.slug }}
                  title={useCase.title}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
