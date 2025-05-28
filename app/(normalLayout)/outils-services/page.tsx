// Styles
import styles from '@/styles/tools.module.scss';
import Link from 'next/link';

export default function Outils() {
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-py-12v">
            <h1>Outils & services</h1>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12">
                <div className="block block--blue">
                  <h2 className="blockTitle">Carte des bâtiments</h2>
                  <p className="blockSubtitle">
                    Consultez les 43 millions de bâtiments du RNB. Retrouvez un
                    bâtiment grâce à son identifiant ou son adresse.
                  </p>
                  <form action="/carte" method="get">
                    <div className="fr-search-bar">
                      <input
                        className="fr-input"
                        type="text"
                        name="q"
                        placeholder="un bâtiment : SBW3-HVPC-LHD8 ou une adresse : 42, rue des architectes, Nantes"
                      />
                      <button className="fr-btn" type="submit">
                        Rechercher
                      </button>
                    </div>
                  </form>
                  <div className="blockLinkShell">
                    <Link className="fr-btn fr-btn--secondary" href="/carte">
                      Consulter la carte
                    </Link>
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-6">
                <div className="block block--yellow block--fill">
                  <h2 className="blockTitle">
                    Enrichissez vos bases bâtimentaires
                  </h2>
                  <p className="blockSubtitle">
                    Trouvez les données qui vous intéressent et obtenez les
                    grâces aux identifiants de bâtiments RNB.
                  </p>
                  <div className="blockLinkShell">
                    <a
                      href="/outils-services/rapprochement"
                      className="fr-btn fr-btn--secondary"
                    >
                      Comment faire ?
                    </a>
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-6">
                <div className="block block--green block--fill">
                  <h2 className="blockTitle">API et documentation</h2>
                  <p className="blockSubtitle">
                    Intégrez le RNB à vos systèmes. Obtenez les identifiants RNB
                    de vos bâtiments. Utilisez nos API et tuiles vectorielles en
                    accès libre.
                  </p>
                  <div className="blockLinkShell">
                    <Link href="/doc" className="fr-btn fr-btn--secondary">
                      Consulter la documentation
                    </Link>
                  </div>
                </div>
              </div>
              <div className="fr-col-12">
                <div className="block block--archipel">
                  <h2 className="blockTitle">Autorisation du droit des sols</h2>
                  <p className="blockSubtitle">
                    <b>Réservé aux instructeurs d&apos;ADS</b>
                    <br />
                    Utilisez vos outils d&apos;instruction d&apos;ADS pour
                    alimenter le RNB. Soyez prévenus lorsque des bâtiments sont
                    achevés sur votre territoire.
                  </p>
                  <div className="blockLinkShell">
                    <a
                      className="fr-btn fr-btn--secondary"
                      href="/outils-services/autorisation-droit-sols"
                    >
                      En savoir plus
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
