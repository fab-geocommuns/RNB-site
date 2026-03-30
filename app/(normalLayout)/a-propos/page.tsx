// Comps
import AboutCol from '@/components/AboutCol';

// Logos
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('À propos');

export default function Page() {
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-12 fr-col-md-8">
            <h1 className="text-blue">
              À propos du Référentiel National des Bâtiments
            </h1>

            <h2 className="fr-h4 fr-pt-10v">
              Problème : le cloisonnement de l&apos;information bâtimentaire
            </h2>
            <blockquote>
              <p>
                <em>
                  &quot;Du fait d&apos;un écosystème atomisé, la production de
                  l&apos;information géolocalisée dans la sphère publique se
                  traduit par un usage sous-optimal des deniers publics.&quot;
                </em>{' '}
                - Rapport d&apos;Information, Sénat, Commission des Finances
                pour l&apos;IGN, 5 Octobre 2022
              </p>
            </blockquote>
            <p>
              Parmi ces données géolocalisées, l&apos;information relative au
              bâtiment se démarque par l&apos;absence de référentiel. Le concept
              de bâtiment ne faisant pas consensus,{' '}
              <strong>
                les acteurs publics et privés travaillent jusqu&apos;à présent
                en silos
              </strong>{' '}
              répondant chacun à leur propre vision du bâtiment.
            </p>
            <p>
              Cette absence de base de données nationale et de référence sur le
              bâtiment engendre :
            </p>
            <ul>
              <li>
                <strong>
                  des difficultés de croisement et une qualité variable
                </strong>{' '}
                entre les jeux de données et outils rattachés à l&apos;adresse,
                au logement ou parfois à la parcelle cadastrale ;
              </li>
              <li>
                <strong>
                  une difficulté à suivre et piloter leurs actions sur leurs
                  parcs bâtimentaires
                </strong>{' '}
                (ex : BDD coûteuses à maintenir et/ou informations partagées
                tardivement)
              </li>
            </ul>
            <p>
              L&apos;objet bâtiment apparaît alors comme le maillon manquant au
              socle de données géolocalisées pour relier les concepts
              d&apos;adresses - bâtiments - locaux et parcelles et permettre un
              pilotage satisfaisant des politiques publiques.
            </p>

            <h2 className="fr-h4 fr-pt-10v">
              Solution : rendre efficace et commune l&apos;identification des
              bâtiments et l&apos;échange d&apos;informations les concernant
            </h2>
            <p>
              Aujourd&apos;hui, le Référentiel National des Bâtiments (RNB) est
              un service public numérique, qui{' '}
              <strong>
                répertorie l&apos;ensemble des bâtiments du territoire
              </strong>{' '}
              et{' '}
              <strong>
                leur associe un identifiant unique et pérenne, appelé ID-RNB.
              </strong>
            </p>
            <p>
              Une fois attribué au bâtiment, cet identifiant pivot (ID-RNB),
              permet de{' '}
              <strong>simplifier le croisement et les échanges</strong> de
              données bâtimentaires entre{' '}
              <strong>
                les administrations publiques, les collectivités et les acteurs
                privés.
              </strong>
            </p>
            <p>Le RNB a pour objectifs principaux de :</p>
            <p>
              <ul>
                <li>
                  <strong>Standardiser</strong> l&apos;identification des
                  bâtiments dans les systèmes d&apos;information ;
                </li>
                <li>
                  <strong>Favoriser l&apos;interopérabilité</strong> entre les
                  bases de données de l&apos;État, des collectivités et des
                  acteurs privés ;
                </li>
                <li>
                  <strong>Soutenir le pilotage des politiques publiques</strong>
                  , notamment en matière de{' '}
                  <strong>
                    rénovation énergétique, de logement et d&apos;aménagement du
                    territoire.
                  </strong>
                </li>
              </ul>
            </p>

            <h2 className="fr-h4 fr-pt-10v">
              Méthode : co-construire un géocommun et une future donnée de
              référence
            </h2>
            <p>
              La stratégie du RNB repose sur trois approches complémentaires :
            </p>
            <ul>
              <li>
                <strong>
                  Diffuser les ID-RNB dans les jeux de données et outils
                  nationaux et territoriaux
                </strong>
                , en accompagnant les administrations, les collectivités et
                éditeurs de logiciel volontaires.
              </li>
              <li>
                Disposer d&apos;une donnée bâtimentaire la plus proche du
                terrain, par l&apos;
                <strong>approche géocommun,</strong> en favorisant l&apos;
                <a
                  href="https://rnb.beta.gouv.fr/blog/le-rnb-souvre-a-ledition-collaborative"
                  target="_blank"
                >
                  édition collaborative
                </a>{' '}
                dans le RNB
              </li>
              <li>
                Renforcer l&apos;impact systémique du RNB, en lui conférant une
                base juridique, en tant que{' '}
                <strong>future donnée de référence</strong>
              </li>
            </ul>
            <p>
              Ces ambitions se traduisent par un portage et un financement
              collectifs, réunissant plusieurs administrations et opérateurs
              publics :
            </p>
            <p>
              Le financement du RNB est assuré conjointement par l&apos;Agence
              de la Transition Écologique (
              <a href="https://www.ademe.fr/" target="_blank">
                ADEME
              </a>
              ), le Centre Scientifique et Technique du Bâtiment (
              <a href="https://www.cstb.fr/fr/" target="_blank">
                CSTB
              </a>
              ), la Direction générale de l&apos;Aménagement, du Logement et de
              la Nature (
              <a
                href="https://www.ecologie.gouv.fr/direction-generale-lamenagement-du-logement-et-nature-dgaln-0"
                target="_blank"
              >
                DGALN
              </a>
              ), l&apos;Institut national de l&apos;information géographique et
              forestière (
              <a href="https://www.ign.fr/" target="_blank">
                IGN
              </a>
              ) et le Fonds d&apos;investissement « Numérique et Données » pour
              la planification écologique (
              <a
                href="https://incubateur.anct.gouv.fr/offre/guichet-cohesion-territoires-FINDPE"
                target="_blank"
              >
                FINDPE
              </a>
              ).
            </p>
            <p>
              Le service est réalisé à la fabrique de la donnée territoriale,
              l&apos;incubateur de l&apos;IGN, appliquant la méthode du
              programme{' '}
              <a href="https://beta.gouv.fr/" target="_blank">
                beta.gouv
              </a>{' '}
              de la Direction Interministérielle du Numérique (
              <a href="https://www.numerique.gouv.fr/dinum/" target="_blank">
                DINUM
              </a>
              ).
            </p>
            <p>
              Les standards du RNB sont également réalisés en collaboration avec
              les experts de la donnée géomatique du Conseil National de
              l&apos;Information Géolocalisée (
              <a
                href="https://cnig.gouv.fr/gt-bati-a25939.html"
                target="_blank"
              >
                CNIG
              </a>
              ).
            </p>

            <div className="block block--yellow fr-mt-12v">
              <div className="fr-grid-row fr-grid-row--gutters ">
                <div className="fr-col-12">
                  <p className="block__title">
                    <strong>
                      D'où proviennent les données du RNB ? Comment le RNB est
                      mis à jour ?
                    </strong>
                  </p>
                  <p>
                    Les bâtiments présentés dans le RNB sont essentiellement
                    issus d'une fusion de la
                    <a href="https://geoservices.ign.fr/bdtopo" target="_blank">
                      BDTOPO
                    </a>
                    , éditée par l'IGN et de la
                    <a href="https://bdnb.io/" target="_blank">
                      BDNB
                    </a>
                    , éditée par le CSTB. La mise à jour du RNB est aujourd'hui
                    réalisée par :
                  </p>
                  <ul>
                    <li>
                      les importations, lors de parution de nouveaux millésimes
                      de la BDTOPO
                    </li>

                    <li>les imports des Bases Adresses Locales (BAL)</li>
                    <li>
                      les
                      <a
                        href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#communaute-et-contributions"
                        target="_blank"
                      >
                        contributions
                      </a>
                      de la communauté, à savoir les éditions directes dans le
                      RNB ; ainsi que par les signalements reçus par une
                      personne suggérant une modification du contenu du RNB,
                      sans la réaliser par elle-même.
                    </li>
                  </ul>
                  <p>
                    En savoir plus sur{' '}
                    <a
                      href="https://rnb-fr.gitbook.io/documentation/cycle-de-vie-de-la-donnee"
                      target="_blank"
                    >
                      le cycle de vie de la donnée du RNB
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
            <div>
              <AboutCol />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
