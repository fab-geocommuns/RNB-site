// Styles
import styles from '@/styles/about.module.scss';

// Comps
import AboutCol from '@/components/AboutCol';
import ImageNext from 'next/image';

// Settings
import settings from '@/logic/settings';

// Logos
import logoFnv from '@/public/images/logos/france-nation-verte.jpg';

export default function Page() {
  const contactEmail = settings.contactEmail;

  return (
    <div className="fr-container">
      <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
        <div className="fr-col-12 fr-col-md-8">
          <h1 className="text-blue">
            À propos du Référentiel National des Bâtiments
          </h1>

          <h2 className="fr-h4">
            Problématique : le cloisonnement de l&apos;information bâtimentaire
          </h2>
          <p>
            Jusqu&apos;à présent, les données liées aux bâtiments sont détenues
            par une multitude d&apos;acteurs, travaillant en silos. Les
            administrations, les collectivités et de nombreux acteurs privés (ex
            : fournisseurs d&apos;énergie), œuvrent individuellement pour
            produire et obtenir l&apos;information sans que celle-ci soit mise
            en commun.
          </p>
          <p>
            Cette absence de base de données nationale de référence sur le
            bâtiment engendre des ralentissements et des coûts importants dans
            la conduite d&apos;actions publiques et territoriales.
          </p>

          <h2 className="fr-h4">
            Solution : rendre efficace et commune l&apos;identification des
            bâtiments et l&apos;échange d&apos;informations les concernant
          </h2>
          <p>
            Le Référentiel National des Bâtiments (RNB) est un service public
            numérique, qui répertorie l&apos;ensemble des bâtiments du
            territoire et leur associe un identifiant unique et pérenne
          </p>
          <p>
            Une fois attribué au bâtiment, cet identifiant pivot, appelé ID-RNB,
            permet de simplifier le croisement et les échanges de données
            bâtimentaires entre les administrations publiques, les collectivités
            et les acteurs privés.
          </p>
          <p>
            Le RNB unifie ainsi la connaissance portant sur chaque bâtiment,
            tout en améliorant la qualité des données du bâtiment dont disposent
            les différents acteurs, pour opérer le suivi et la gestion de leur
            parc immobilier.
          </p>

          <h2 className="fr-h4">
            Méthode : Co-construire ensemble ce nouveau géocommun
          </h2>
          <p>
            Le financement du RNB est assuré conjointement par l&apos;Agence de
            la Transition Écologique (
            <a href="https://www.ademe.fr/" target="_blank">
              ADEME
            </a>
            ), le Centre Scientifique et Technique du Bâtiment (
            <a href="https://www.cstb.fr/fr/" target="_blank">
              CSTB
            </a>
            ), la Direction générale de l&apos;Aménagement, du Logement et de la
            Nature (
            <a
              href="https://www.ecologie.gouv.fr/direction-generale-lamenagement-du-logement-et-nature-dgaln-0"
              target="_blank"
            >
              DGALN
            </a>
            ) et l&apos;Institut national de l&apos;information géographique et
            forestière (
            <a href="https://www.ign.fr/" target="_blank">
              IGN
            </a>
            ) et le Fonds d&apos;investissement « Numérique et Données » pour la
            planification écologique (
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
            l&apos;incubateur de l&apos;IGN, appliquant la méthode du programme{' '}
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
            <a href="https://cnig.gouv.fr/gt-bati-a25939.html" target="_blank">
              CNIG
            </a>
            ).
          </p>
          <p>
            Vous souhaitez contribuer ? Toutes les contributions sont les
            bienvenues pour construire ce géocommun, faciliter et réduire les
            coûts de maintenance et optimiser la qualité des données. Contactez
            l&apos;équipe du RNB sur{' '}
            <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
          </p>

          <div className="block block--yellow fr-mt-24v">
            <div className="fr-grid-row fr-grid-row--gutters ">
              <div className="fr-col-12">
                <p className="block__title">
                  <strong>
                    D’où proviennent les données du RNB ? Comment le RNB est mis
                    à jour ?
                  </strong>
                </p>
                <p>
                  Les bâtiments présentés dans le RNB sont essentiellement issus
                  d’une fusion de la 
                  <a href="https://geoservices.ign.fr/bdtopo" target="_blank">
                    BDTOPO
                  </a>
                  , éditée par l’IGN et de la 
                  <a href="https://bdnb.io/" target="_blank">
                    BDNB
                  </a>
                  , éditée par le CSTB. La mise à jour du RNB est aujourd’hui
                  réalisée par :
                </p>
                <ul>
                  <li>
                    les importations, lors de parution de nouveaux millésimes de
                    la BDTOPO
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
                     de la communauté, à savoir les éditions directes dans le
                    RNB ; ainsi que par les signalements reçus par une personne
                    suggérant une modification du contenu du RNB, sans la
                    réaliser par elle-même.
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
  );
}
