export default function RulesPage() {
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-12 fr-col-md-8">
            <h1 className="text-blue">Gouvernance de la donnée RNB</h1>

            <div>TODO : intro sur les règles</div>

            <h2>Les rôles</h2>
            <ul>
              <li>
                Editeur : toute personne ou organisation qui{' '}
                <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#editeur-ice">
                  édite le RNB
                </a>
                , c’est-à-dire qui crée, modifie ou met à jour une donnée.
              </li>
              <li>
                Contributeur : toute personne ou organisation qui participe à
                améliorer la qualité de la donnée RNB, soit en effectuant des{' '}
                <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#signalement-signaler">
                  signalements
                </a>{' '}
                sur le RNB, c’est-à-dire des suggestions d’édition, soit en
                étant édit.rice.eur.
              </li>
              <li>
                Administrateur : l’entité RNB assure la disponibilité des
                services, le respect d’application des règles de gouvernance et
                l’alimentation du RNB avec des données socles.{' '}
              </li>
              <li>
                Diffuseur : data.gouv.fr et l’entité RNB mettent à disposition
                la donnée.
              </li>
              <li>
                Réutilisateur : toute personne ou organisation qui consulte ou
                exploite la donnée RNB.
              </li>
              <li>
                Garant de la conformité : l’entité RNB veille au respect des
                obligations réglementaires, notamment en matière de protection
                des données personnelles (RGPD) et de sécurité.{' '}
              </li>
              <li>
                Référent métier :
                <ul>
                  <li>
                    le{' '}
                    <a href="https://cnig.gouv.fr/gt-bati-a25939.html">
                      GT Bâti
                    </a>{' '}
                    (groupe de travail “Bâtiment”) du CNIG assure la
                    concertation avec les acteurs de la géo-donnée et du
                    bâtiment et la coordination pour produire le standard du
                    bâtiment en France.
                  </li>
                  <li>
                    la communauté du RNB (éditeur, contributeur et
                    réutilisateur) participe aux diverses concertations pour
                    assurer l’utilisabilité et l’utilité des règles.
                  </li>
                </ul>
              </li>
            </ul>
            <h2>Les actions</h2>
            <h3>Consulter et réutiliser</h3>
            <p>
              La donnée du RNB est{' '}
              <a
                target="_blank"
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              >
                sous licence ouverte 2.0/open licence 2.0
              </a>
              .
            </p>
            <p>
              La donnée RNB est accessible aux réutilisateurs, gratuitement,
              sans identification nécessaire, via différents outils :
            </p>
            <ul>
              <li>
                <a href="https://rnb.beta.gouv.fr/carte">
                  la carte des bâtiments
                </a>
                accessible sur le site du RNB, pour visualiser ou rechercher des
                bâtiment,
              </li>
              <li>
                les{' '}
                <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/liste-des-api-et-outils-du-rnb">
                  API du RNB
                </a>{' '}
                pour consulter, lister, identifier ou exporter des données
              </li>
              <li>
                la plateforme{' '}
                <a href="https://www.data.gouv.fr/datasets/referentiel-national-des-batiments">
                  data.gouv.fr
                </a>
              </li>
            </ul>
            <h3>Éditer</h3>
            <p>
              L’action “éditer” est une forme de contribution dans laquelle le
              ou la [contributeur·ice]() apporte directement une modification au
              contenu du RNB (la documentation RNB précise la liste des{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#modification-du-contenu-du-rnb">
                modifications possibles
              </a>
              ).
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
