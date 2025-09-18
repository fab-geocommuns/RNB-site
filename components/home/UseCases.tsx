import { PostsOrPages } from '@tryghost/content-api';
import Card from '@codegouvfr/react-dsfr/Card';

// amp.jpg
// audit-dpe.jpeg
// data_es.png
// datatourisme.jpg
// smh.jpg
// zlv.jpg
import amp from './logos/amp.jpg';
import auditDpe from './logos/audit-dpe.jpeg';
import dataEs from './logos/data_es.png';
import datatourisme from './logos/datatourisme.jpg';
import smh from './logos/smh.jpg';
import zlv from './logos/zlv.jpg';

// Styles
import styles from '@/styles/home.module.scss';

type Props = {
  useCases: PostsOrPages;
};

function LogoGrid() {
  const logos = [
    {
      src: amp.src,
      scale: 1,
    },
    {
      src: smh.src,
      scale: 0.6,
    },
    {
      src: dataEs.src,
      scale: 0.8,
    },
    {
      src: auditDpe.src,
      scale: 1,
    },
    {
      src: datatourisme.src,
      scale: 1,
    },
    {
      src: zlv.src,
      scale: 0.8,
    },
  ];
  return (
    <div className="fr-grid-row fr-grid-row--gutters">
      {logos.map((logo, index) => (
        <div
          className="fr-col-12 fr-col-md-2"
          key={index}
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            className={styles.sponsorBlock__logo}
            src={logo.src}
            alt={'logo'}
            style={{ transform: `scale(${logo.scale})` }}
          />
        </div>
      ))}
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
            <LogoGrid />
          </div>

          <div className="fr-grid-row fr-grid-row--gutters">
            {featuredUseCase.map((useCase) => (
              <div className="fr-col-12 fr-col-md-4 " key={useCase.id}>
                <Card
                  linkProps={{ href: '/blog/' + useCase.slug }}
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
