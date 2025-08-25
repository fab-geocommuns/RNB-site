import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';
import mapImageSource from './map.png';
import AddressSearchHome from '../address/AddressSearchHome';

function Illustration() {
  return (
    <div
      className={fr.cx('fr-p-5v')}
      style={{
        backgroundImage: `url(${mapImageSource.src})`,
        //aspectRatio: "16 / 9",
        height: '100%',
        backgroundPosition: 'center',
        backgroundSize: 'auto',
        borderRadius: '16px',
        boxShadow: '0px 0px 20px -3px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'end',
      }}
    >
      <AddressSearchHome />
    </div>
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
            <h1>Bienvenue au Référentiel National des Bâtiments</h1>
            <p>
              Le Référentiel national des bâtiments (RNB) est un{' '}
              <b>service public numérique</b> qui{' '}
              <b>répertorie l&apos;ensemble des bâtiments du territoire</b> et
              leur associe un <b>identifiant unique</b>.
            </p>
            <p>
              Cet <b>ID-RNB</b> est facilement transmissible par une personne ou
              un logiciel et permet de{' '}
              <b>croiser facilement les jeux de données bâtimentaires</b>, pour
              les administrations publiques, les collectivités et les acteurs
              privés.
            </p>
            <p>
              {' '}
              <Button>Consulter la carte des bâtiments</Button>{' '}
              <Button priority="tertiary no outline">En savoir plus</Button>
            </p>
          </div>
          <div className={fr.cx('fr-col-6', 'fr-p-18v')}>
            <Illustration />
          </div>
        </div>
      </div>
    </div>
  );
}
