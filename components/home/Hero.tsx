import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import mapImageSource from './map.png';
import mapImageSource2 from './map1.png';
import mapImageSource3 from './map2.png';
import AddressSearchHome from '../address/AddressSearchHome';
import styles from '../../styles/home/hero.module.scss';

function Illustration({ children }: { children: React.ReactNode }) {
  const images = [
    {
      src: mapImageSource.src,
      alt: 'Image 1',
    },
    {
      src: mapImageSource2.src,
      alt: 'Image 2',
    },

    {
      src: mapImageSource3.src,
      alt: 'Image 3',
    },
  ];
  return (
    <>
      <div
        className={styles.imageCarousel}
        style={{ height: '100%', width: '100%' }}
      >
        {images.map((image) => (
          <div
            className={styles.imageCarouselImage}
            style={{ backgroundImage: `url(${image.src})` }}
            key={image.alt}
          ></div>
        ))}
        <div className={styles.imageCarouselContent + ' ' + fr.cx('fr-p-5v')}>
          {children}
        </div>
      </div>
    </>
  );
}

export default function Hero() {
  return (
    <div
      className={fr.cx('fr-mb-6v')}
      style={{ backgroundColor: 'var( --background-alt-blue-france)' }}
    >
      <div className={fr.cx('fr-container')}>
        <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={fr.cx('fr-col-6', 'fr-pt-18v', 'fr-pb-18v')}>
            <h1>Bienvenue sur le Référentiel National des Bâtiments</h1>
            <p>
              Le Référentiel National des Bâtiments (RNB) est un{' '}
              <b>service public numérique</b> qui{' '}
              <b>répertorie l&apos;ensemble des bâtiments du territoire</b> et
              leur associe un <b>identifiant unique et pérenne</b>.
            </p>
            <p>
              Une fois attribué au bâtiment, cet identifiant pivot, appelé{' '}
              <b>ID-RNB</b>, permet de{' '}
              <b>
                simplifier le croisement et les échanges de données
                bâtimentaires
              </b>{' '}
              entre les administrations publiques, les collectivités et les
              acteurs privés.
            </p>
            <p>
              {' '}
              <Button linkProps={{ href: '/carte' }}>
                Voir la carte des bâtiments
              </Button>{' '}
              <Button
                priority="tertiary no outline"
                linkProps={{ href: '/a-propos' }}
              >
                En savoir plus
              </Button>
            </p>
          </div>
          <div className={fr.cx('fr-col-6', 'fr-p-18v')}>
            <Illustration>
              <AddressSearchHome />
            </Illustration>
          </div>
        </div>
      </div>
    </div>
  );
}
