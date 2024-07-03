import { Highlight } from '@codegouvfr/react-dsfr/Highlight';

export default function Page() {
  return (
    <>
      <h1 className="text-blue">
        Fiabiliser les Diagnostics de Performance Énergétique (DPE)
      </h1>

      <h2>Le problème</h2>
      <p>Plus de 2.7 millions de DPE ont été réalisés en France en 2022.</p>
      <p>
        Chaque DPE contient des informations de performance énergétique sur le
        local (par exemple un appartement) dont il fait l’objet. Hors, le local
        dont le DPE fait l’objet est uniquement relié à une adresse et non à un
        bâtiment géolocalisé. Ainsi,{' '}
        <span className="stab stab--green">
          la désignation par une adresse ne permet pas de distinguer dans quel
          bâtiment le DPE a été réalisé
        </span>
        , même si par exemple une copropriété contient plusieurs bâtiments avec
        des caractéristiques énergétiques très disparates (bâtiment A, B, C).
        L’absence du maillon bâtiment limite donc fortement les actions de
        rénovation du parc dans son ensemble.
      </p>

      <h2>L&apos;intérêt du RNB</h2>

      <Highlight>
        “Il est évident qu’une intégration de l’ID bâtiment aux DPE nous
        permettrait de consolider la base de l’Observatoire et d’apporter un
        réel plus aux réutilisateurs de la donnée dans leur travail de
        modélisation” <br />
        <b>
          Sylvain Bessonneau - Responsable de l’Observatoire des DPE à l’ADEME
        </b>
      </Highlight>

      <p>
        Les DPE constituent une source d’information cruciale pour les
        politiques de rénovation énergétique du parc bâtimentaire. La
        possibilité d’indiquer dans chaque DPE l’identifiant unique du bâtiment
        dans lequel le local se situe permettra ainsi d’améliorer la fiabilité
        des bases de données de l’observatoire des DPE, largement réutilisées
        par des acteurs public et privés.
      </p>
      <p>
        C’est pourquoi{' '}
        <span className="stab stab--blue">
          nous travaillons actuellement à introduire un champs dédié au n°
          d’identifiant unique du bâtiment dans les DPE
        </span>{' '}
        et à terme de le rendre obligatoire.
      </p>

      <h2>L&apos;impact</h2>

      <ul>
        <li>
          Pour L’ADEME, en charge de l’observatoire des DPE, l’ID unique ajouté
          aux DPE doit permettre de mieux connaitre la performance de chaque
          bâtiment dans le temps et mieux suivre l’évolution de la rénovation du
          parc dans son ensemble.
        </li>
        <li>
          Pour les réutilisateurs de la base DPE, l’ID unique doit permettre de
          faciliter le croisement de ces données avec d’autres bases qui
          contiendront aussi l’ID unique du bâtiment. Il sera notamment possible
          de faciliter le croisement d’informations issues de plusieurs DPE
          ayant été réalisées dans un même bâtiment et d’agréger les
          informations communes à l’enveloppe du bâti (ex. année de
          construction, typologie des murs extérieurs, connaissance des systèmes
          centralisés d’eau et de chauffage…).
        </li>
        <li>
          Pour les diagnostiqueurs, l’ID unique leur permet d’être plus précis :
          lors de la réalisation du DPE sur place, ils pourront vérifier des
          hypothèses liées aux informations métiers issues des DPE précédemment
          réalisés dans un même immeuble et éviter d’avoir recours à des valeurs
          par défaut en l’absence d’information fiable. Si l’ID unique est
          intégré au Registre National des Copropriétés (RNC), cela leur
          permettra également d’obtenir à l’avance les documents pertinents en
          amont de la réalisation d’un DPE.
        </li>
      </ul>
    </>
  );
}
