import Tile from '@codegouvfr/react-dsfr/Tile';

export default function UseCases() {
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
            <div className="fr-col-12 fr-col-md-4 ">
              <Tile
                desc="La possibilité d’indiquer dans chaque DPE l’identifiant unique du bâtiment dans lequel le local se situe permettra ainsi d’améliorer la fiabilité des bases de données de l’observatoire des DPE ..."
                linkProps={{ href: '/cas/dpe' }}
                title="Fiabiliser les Diagnostics de Performance Énergétique (DPE)"
              />
            </div>
            <div className="fr-col-12 fr-col-md-4 ">
              <Tile
                desc="L’existence du RNB doit permettre à toutes les communes d’assurer la cohérence du système d’information et la transversalité des données de la collectivité entre les différents services ..."
                linkProps={{ href: '/cas/communes' }}
                title="Faciliter les échanges d’informations bâtimentaires au sein des communes"
              />
            </div>

            <div className="fr-col-12 fr-col-md-4 ">
              <Tile
                desc="La saisie d’un ID bâtiment lors du processus de référencement des ERP doit permettre de préciser leur géolocalisation, de faciliter et fiabiliser le processus de recensement et, d’aider le suivi des ERP."
                linkProps={{ href: '/cas/erp' }}
                title="Améliorer l’identification des Etablissements Recevant du Public (ERP)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
