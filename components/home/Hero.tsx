import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import mapImageSource from './map.png';
import mapImageSource2 from './map1.png';
import mapImageSource3 from './map2.png';
import AddressSearchHome from '../address/AddressSearchHome';

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
      <style>
        {`.image-carousel {
        display: flex;
        flex-direction: column;
        justify-content: end;
        position: relative;
        overflow: hidden;
      }
      .image-carousel .image {
        position: absolute;
        top: 0;
  left: 0;  
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
        height: 100%;
        box-shadow: 0px 0px 20px -3px rgba(0,0,0,0.1);
        border-radius: 16px;
      animation: drift 15s infinite, fade 15s infinite;
      }

      .image-carousel-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1;
      }


.image:nth-child(1) { animation-delay: 0s; }
.image:nth-child(2) { animation-delay: 5s; }
.image:nth-child(3) { animation-delay: 10s; }

@keyframes drift {
  0% {
    background-position: center left; /* Start at the left */
  }
  100% {
    background-position: center right; /* Stay at the right */
  }
}

@keyframes fade {
  0%, 100% { opacity: 0; }
  10%, 30% { opacity: 1; }
}
      `}
      </style>
      <div
        className={`image-carousel`}
        style={{ height: '100%', width: '100%' }}
      >
        {images.map((image) => (
          <div
            className={`image`}
            style={{ backgroundImage: `url(${image.src})` }}
            key={image.alt}
          ></div>
        ))}
        <div className={`image-carousel-content ${fr.cx('fr-p-5v')}`}>
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
