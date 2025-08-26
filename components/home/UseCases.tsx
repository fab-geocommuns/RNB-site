import { PostsOrPages } from '@tryghost/content-api';
import Card from '@codegouvfr/react-dsfr/Card';

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
                  imageUrl={useCase.feature_image || ''}
                  imageAlt={useCase.feature_image_alt || ''}
                  desc={useCase.excerpt}
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
