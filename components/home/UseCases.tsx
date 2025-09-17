import { PostsOrPages } from '@tryghost/content-api';
import Card from '@codegouvfr/react-dsfr/Card';
import nantes from './logos/nantes.png';
import echirolles from './logos/echirolles.png';
import smh from './logos/smh.jpg';
import auditDpe from './logos/audit-dpe.jpeg';

// Styles
import styles from '@/styles/home.module.scss';

type Props = {
  useCases: PostsOrPages;
};

function LogoCarousel() {
  const logos = [
    {
      src: nantes.src,
      scale: 0.9,
    },
    {
      src: echirolles.src,
      scale: 1.1,
    },
    {
      src: smh.src,
      scale: 1.2,
    },
    {
      src: auditDpe.src,
      scale: 0.8,
    },
  ];
  return (
    <div className={styles['logo-carousel']} style={{ maxWidth: 800 }}>
      <div className={styles['logo-carousel__track']}>
        {[...logos, ...logos, ...logos].map((logo, index) => (
          <div key={index} className={styles['logo-carousel__item']}>
            <img
              src={logo.src}
              alt={'logo'}
              className={styles['logo-carousel__logo']}
              style={{ transform: `scale(${logo.scale})` }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function UseCases({ useCases }: Props) {
  const featuredUseCase = useCases.slice(0, 3);
  return (
    <div className="section">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 ">
          <div className="section__titleblock">
            <h2 className="section__title">Cas d&apos;usage</h2>
            <p className="section__subtitle">
              Ils utilisent le RNB pour conduire leurs politiques publiques et
              territoriales
            </p>
          </div>

          <div className="fr-pb-6w">
            <LogoCarousel />
          </div>

          <div className="fr-grid-row fr-grid-row--gutters">
            {featuredUseCase.map((useCase) => (
              <div className="fr-col-12 fr-col-md-4 " key={useCase.id}>
                <Card
                  linkProps={{ href: '/cas/' + useCase.slug }}
                  title={useCase.title}
                  desc={useCase.excerpt}
                  enlargeLink
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
