import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import mapImageSource from './map.png';

export default function Hero() {
  console.log(mapImageSource);
  return (
    <div
      className={fr.cx('fr-mb-6v')}
      style={{ backgroundColor: 'var( --background-alt-blue-france)' }}
    >
      <div className={fr.cx('fr-container')}>
        <div className={fr.cx('fr-grid-row', 'fr-grid-row--gutters')}>
          <div className={fr.cx('fr-col-6', 'fr-pt-18v', 'fr-pb-18v')}>
            <h1>Bienvenue au Référentiel National des Bâtiments</h1>
            <p>
              Le Référentiel national des bâtiments (RNB) est un service public
              numérique qui répertorie l'ensemble des bâtiments du territoire et
              leur associe un identifiant unique.
            </p>
            <p>
              Cet ID-RNB est facilement transmissible par une personne ou un
              logiciel et permet de croiser facilement les jeux de données
              bâtimentaires, pour les administrations publiques, les
              collectivités et les acteurs privés.
              <br /> <u>En savoir plus</u>
            </p>
            <p>
              <Button iconId="fr-icon-road-map-line">Consulter la carte</Button>{' '}
              <Button priority="secondary" iconId="fr-icon-search-line">
                Rechercher un bâtiment
              </Button>
            </p>
          </div>
          <div className={fr.cx('fr-col-6', 'fr-p-18v')}>
            <div
              style={{
                backgroundImage: `url(${mapImageSource.src})`,
                //aspectRatio: "16 / 9",
                height: '100%',
                backgroundPosition: 'center',
                backgroundSize: 'auto',
                borderRadius: '16px',
                boxShadow: '0px 0px 20px -3px rgba(0,0,0,0.1)',
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}
