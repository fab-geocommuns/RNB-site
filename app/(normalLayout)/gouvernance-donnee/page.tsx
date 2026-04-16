import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Règles de gouvernance de la donnée RNB');

export default function RulesPage() {
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row fr-grid-row--gutters fr-pt-12v">
          <div className="fr-col-12">
            <h1 className="text-blue">Gouvernance de la donnée RNB</h1>
          </div>
        </div>
        <div className="fr-grid-row fr-grid-row--gutters fr-pb-12v">
          <div className="fr-col-12 fr-col-md-7">
            <h2>Les rôles</h2>

            <p>
              <b>Editeur :</b> toute personne ou organisation qui{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#editeur-ice">
                édite le RNB
              </a>
              , c’est-à-dire qui crée, modifie ou met à jour un bâtiment.
            </p>
            <p>
              <b>Contributeur :</b> toute personne ou organisation qui participe
              à améliorer la qualité de la donnée RNB, soit en effectuant des{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#signalement-signaler">
                signalements
              </a>{' '}
              sur le RNB, c’est-à-dire des suggestions d’édition, soit en étant
              éditeur.
            </p>
            <p>
              <b>Administrateur :</b> l’entité RNB assure la disponibilité des
              services, le respect d’application des règles de gouvernance et
              l’alimentation du RNB avec des données socles.{' '}
            </p>
            <p>
              <b>Diffuseur :</b> data.gouv.fr et l’entité RNB mettent à
              disposition la donnée.
            </p>
            <p>
              <b>Réutilisateur :</b> toute personne ou organisation qui consulte
              ou exploite la donnée RNB.
            </p>
            <p>
              <b>Garant de la conformité :</b> l’entité RNB veille au respect
              des obligations réglementaires, notamment en matière de protection
              des données personnelles (RGPD) et de sécurité.{' '}
            </p>

            <p>
              <b>Référents métier :</b>
            </p>

            <p>
              Le{' '}
              <a
                target="_blank"
                href="https://cnig.gouv.fr/gt-bati-a25939.html"
              >
                GT Bâti
              </a>{' '}
              (groupe de travail “Bâtiment”) du CNIG assure la concertation avec
              les acteurs de la géo-donnée et du bâtiment et la coordination
              pour produire le standard du bâtiment en France.
            </p>
            <p>
              La communauté du RNB (éditeurs, contributeurs et réutilisateurs)
              participe aux diverses concertations pour assurer l’utilisabilité
              et l’utilité des règles.
            </p>
            <hr className="fr-my-4v" />
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
                </a>{' '}
                accessible sur le site du RNB, pour visualiser ou rechercher des
                bâtiment,
              </li>
              <li>
                les{' '}
                <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/liste-des-api-et-outils-du-rnb">
                  API du RNB
                </a>{' '}
                pour consulter, lister, identifier des bâtiments
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
              contributeur apporte directement une modification au contenu du
              RNB en appliquant systématiquement la{' '}
              <a href="https://rnb.beta.gouv.fr/definition">
                définition du bâtiment
              </a>{' '}
              (la documentation RNB précise la liste des{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#modification-du-contenu-du-rnb">
                modifications possibles
              </a>
              ).
            </p>
            <p>
              L’édition est ouverte sur tout le territoire, via différents
              outils :
            </p>
            <ul>
              <li>
                <a href="https://rnb.beta.gouv.fr/edition">
                  la carte d’édition
                </a>{' '}
                accessible sur le site RNB,
              </li>
              <li>
                <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/editer-le-rnb">
                  l&apos;API d&apos;édition
                </a>
              </li>
              <li>
                un import de données effectué par l’administrateur (
                <a href="https://rnb-fr.gitbook.io/documentation/cycle-de-vie-de-la-donnee">
                  import de données nationales socles
                </a>{' '}
                comme la BDTOPO et la BAN).
              </li>
            </ul>

            <p>
              <b>Droits d&apos;édition</b>
            </p>
            <p>
              Toute édition doit faire l&apos;objet d&apos;une authentification
              préalable de l&apos;éditeur.
            </p>
            <p>
              Toute personne ou organisation peut devenir éditeur en créant son
              compte sur le site RNB.
            </p>

            <p>
              <b>Seuil d&apos;édition</b>
            </p>
            <p>
              Chaque éditeur a un seuil d&apos;édition, qui correspond à son
              nombre maximum d&apos;éditions autorisées. Par défaut, ce seuil
              est de 500 éditions.
            </p>
            <p>
              Pour augmenter ce seuil, une vérification manuelle de la qualité
              des éditions est déclenchée par l&apos;administrateur. Suite à
              cette vérification, le seuil est augmenté au cas par cas selon le
              résultat et les motivations de l&apos;éditeur.
            </p>

            <h3>Signaler</h3>
            <p>
              L’action de signaler est une forme de{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#contribution-au-rnb-contribuer-au-rnb">
                contribution
              </a>{' '}
              dans laquelle la ou le{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#contributeur-ice">
                contributeur
              </a>{' '}
              propose une modification du contenu du RNB sans la réaliser
              lui-même ou elle-même, en appliquant systématiquement la{' '}
              <a href="https://rnb.beta.gouv.fr/definition">
                définition du bâtiment
              </a>
              . Le signalement peut ensuite être{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/lexique-du-rnb#traiter-un-signalement">
                traité
              </a>{' '}
              par une éditeur ou par l’administrateur.
            </p>
            <p>
              La création de signalement est ouverte à tous les réutilisateurs,
              sans limite de volume, sur tout le territoire via{' '}
              <a href="https://rnb.beta.gouv.fr/carte">
                la carte des bâtiments
              </a>{' '}
              accessible sur le site du RNB.
            </p>
            <p>
              Un signalement ne nécessite pas d’authentification. Un email peut
              être renseigné dans le signalement de manière optionnelle.
            </p>
            <p>
              Des signalements peuvent être soumis en masse par
              l’administrateur.
            </p>
            <hr className="fr-my-4v" />
            <h2>Règles de mise à jour</h2>

            <p>
              La conception du RNB est pensée pour garantir 3 caractéristiques
              clefs : l’unicité, la pérennité et la traçabilité des ID-RNB.
            </p>

            <p>
              Les flux de données ainsi que leurs règles d’intégration sont
              décrits dans le{' '}
              <a href="https://rnb-fr.gitbook.io/documentation/cycle-de-vie-de-la-donnee">
                cycle de vie de la donnée du RNB
              </a>
              .
            </p>

            <p>
              Une seule règle de gestion de la concurrence entre éditions est
              actuellement définie : un import de données, par exemple de la
              BAN, de la BDTOPO ou de la BAL, (réalisable uniquement par
              l’administrateur) ne peut pas défaire une édition. Par exemple,
              dans le cas où un éditeur aurait supprimé un lien adresse -
              bâtiment, l&apos;import de la BAN ne pourra pas recréer ce lien.
            </p>

            <p>
              Toutes les modifications apportées aux bâtiments du RNB sont
              historisées. Chaque ID-RNB dispose d&apos;un historique retraçant
              les modifications apportées, la date de ces modifications,
              l&apos;éditeur qui a effectué l&apos;édition.
            </p>
            <p>
              Cette historisation garantit la traçabilité des ID-RNB et favorise
              la transparence du réfénretiel. Elle est accessible à toutes et
              tous, dans la page &quot;Historique de l&apos;identifiant&quot;.
            </p>

            <hr className="fr-my-4v" />
            <h2>Détection d&apos;anomalie</h2>
            <p>
              Des contrôles en amont d&apos;actions d&apos;édition préviennent
              l&apos;intégration d&apos;erreurs. Certaines opérations non
              autorisées sont bloquées avant d&apos;être effectuées :
            </p>
            <ul>
              <li>superposition de bâtiment</li>
              <li>déplacement de bâtiment sur de grandes distances</li>
              <li>création de bâtiments trop grands ou trop petits</li>
            </ul>
            <p>
              Les processus suivants de monitoring sont en place pour détecter
              d&apos;éventuelles anomalies :
            </p>
            <ul>
              <li>
                un tableau de bord de suivi de l&apos;activité sur le RNB
                (éditions, signalements, création de compte) est alimenté en
                temps réel et accessible à l&apos;administrateur. Chaque matin,
                l&apos;administrateur contrôle le tableau de bord de suivi. Si
                une activité anormale est constatée, celle-ci est immédiatement
                analysée
              </li>
              <li>
                un outil de suivi des éditions effectuées est alimenté en temps
                réel et accessible à l&apos;administrateur. Cet outil est
                utilisé lors de la vérification quotidienne en cas de doute de
                qualité des éditions.
              </li>
              <li>
                pour augmenter le seuil d&apos;édition d&apos;un éditeur,
                l&apos;administrateur contrôle un échantillon des éditions
                effectuées par ce compte grâce à l&apos;outil de suivi des
                éditions et l&apos;historisation par bâtiment, se renseigne sur
                les compétences bâti du compte éditeur, et en valide la qualité
              </li>
              <li>
                un contrôle de qualité sur un échantillon de 500 éditions est
                effectué tous les 6 mois
              </li>
            </ul>
            <hr className="fr-my-4v" />
            <h2>Procédure de récupération</h2>
            <p>
              Une sauvegarde du RNB est faite toutes les semaines, la nuit du
              vendredi à samedi, et conservée 30 jours sur deux sites chez deux
              hébergeurs.
            </p>
            <p>
              Un &quot;snapshot&quot; quotidien de la base est également réalisé
              et conservé 20 jours sur un site chez un hébergeur.
            </p>
            <p>Si une erreur est détectée : </p>
            <ul>
              <li>
                si elle concerne un nombre d&apos;éditeur restreint,
                l&apos;administrateur effectue un rollback des éditions faites
                par ces éditeurs. Il est possible de faire un rollback par
                éditeur et sur une fenêtre de temps donnée depuis les outils
                d&apos;administration du RNB.
              </li>
              <li>
                si la base est compromise plus largement, l&apos;administrateur
                restaure une sauvegarde de la base, avec un risque de perte
                d&apos;information qui ont été intégrées dans le RNB entre la
                date du lancement de la procédure et la date de la sauvegarde.
              </li>
            </ul>
          </div>
          <div className="fr-col-12 fr-col-md-4 fr-col-offset-md-1">
            <div className="block block--paleGreen fr-mb-8v">
              <p>
                <b>Pourquoi des règles de gouvernance ?</b>
              </p>
              <p>
                L&apos;objectif de ces règles est de fédérer des parties
                prenantes aux profils variés autour de règles communes et
                d&apos;un standard CNIG. Elle doivent garantir que le RNB reste
                un géocommun : c&apos;est-à-dire une base ouverte, partagée et
                co-construite.{' '}
              </p>
              <p className="fr-mb-0">
                Pour ce faire, les règles de gouvernance de la donnée du RNB
                assurent que le RNB est utilisable et utilisé, la pérennité dans
                le temps du RNB, la qualité de la donnée RNB.
              </p>
            </div>
            <div className="block block--yellow">
              <p>
                <b>
                  Donnez votre avis pour faire évoluer les règles de gouvernance
                  de la donnée !
                </b>
              </p>

              <p>
                <b>Où ?</b>
                <br />
                Sur la discussion dédiée du forum Géocommuns
              </p>
              <p>
                <b>Quand ?</b>
                <br />
                Du 31 mars au 22 avril 2026
              </p>
              <p>
                <b>Qui ?</b> <br />
                Toutes vos réflexions sont les bienvenues, que vous soyez
                spécialiste de la geodata, partie prenante de l’ecosystème bâti
                (gestionnaires de parc bâtimentaire, collectivités
                territoriales, administrations publiques, bailleurs sociaux,
                entreprises, opérateurs) ou de l’open data et des communs.
              </p>

              <p>
                Vos contributions seront présentées et alimenteront la réflexion
                sur la gouvernance de la donnée lors du GT Bâti qui aura lieu la
                semaine du 27 avril 2026{' '}
              </p>
              <div>
                <a
                  href="https://forum.geocommuns.fr/t/appel-a-commentaire-jusquau-22-avril-regles-de-gouvernance-de-la-donnee-rnb/3123"
                  className="fr-btn fr-btn--primary"
                >
                  Participer à la discussion
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
