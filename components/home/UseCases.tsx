import { PostsOrPages } from '@tryghost/content-api';
import Tile from '@codegouvfr/react-dsfr/Tile';
import nantes from './logos/nantes.png';
import echirolles from './logos/echirolles.png';
import smh from './logos/smh.jpg';
import auditDpe from './logos/audit-dpe.jpeg';

// Styles
import styles from '@/styles/home.module.scss';

type Props = {
  useCases: PostsOrPages;
};

export default function UseCases({ useCases }: Props) {
  const featuredUseCase = useCases.slice(0, 3);
  const logos = [
    {
      src: nantes.src,
    },
    {
      src: echirolles.src,
    },
    {
      src: smh.src,
    },
    {
      src: auditDpe.src,
    },
  ];
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
                <Tile
                  className={styles['card-use-case']}
                  imageUrl={useCase.feature_image || ''}
                  imageAlt={useCase.feature_image_alt || ''}
                  linkProps={{ href: '/cas/' + useCase.slug }}
                  title={useCase.title}
                  desc={useCase.excerpt}
                />
              </div>
            ))}
          </div>

          {/* Logo Carousel */}
          <div className={styles['logo-carousel']} style={{ maxWidth: 800 }}>
            <div className={styles['logo-carousel__track']}>
              {[...logos, ...logos, ...logos].map((logo, index) => (
                <div key={index} className={styles['logo-carousel__item']}>
                  <img
                    src={logo.src}
                    alt={'logo'}
                    className={styles['logo-carousel__logo']}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
