// Textes d'aide du formulaire d'édition, tirés du guide d'édition :
// https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart

import type { HelpTopic } from '@/stores/edition/edition-slice';

// Analytics
import va from '@vercel/analytics';

export const GUIDE_URL =
  'https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart';

function HelpLinks({
  guideAnchor,
  withDefinition = true,
}: {
  guideAnchor: string;
  withDefinition?: boolean;
}) {
  return (
    <p>
      <a
        href={`${GUIDE_URL}#${guideAnchor}`}
        target="_blank"
        rel="noopener"
        title="En savoir plus - nouvelle fenêtre"
        onClick={() =>
          va.track('edition-help-guide-click', { anchor: guideAnchor })
        }
      >
        En savoir plus
      </a>
      {withDefinition && (
        <>
          <br />
          <a
            href="/definition"
            target="_blank"
            title="Consulter la définition d'un bâtiment - nouvelle fenêtre"
          >
            Consulter la définition d&apos;un bâtiment
          </a>
        </>
      )}
    </p>
  );
}

function StatusHelp() {
  return (
    <>
      <ul>
        <li>
          <strong>Construit</strong> : un bâtiment construit, comme la plupart
          de ceux que nous voyons autour de nous. C&apos;est le statut le plus
          répandu dans le RNB.
        </li>
        <li>
          <strong>En ruine</strong> : un bâtiment existant dont l&apos;état de
          dégradation ne permet plus son utilisation (bâtiment abandonné, toit
          effondré, ruine).
        </li>
        <li>
          <strong>Démoli</strong> : le bâtiment a été démoli. Son ID-RNB reste
          actif pour continuer à échanger de l&apos;information à son propos.
        </li>
      </ul>
      <p>
        Ne pas confondre avec la désactivation : un objet qui n&apos;est pas un
        bâtiment (un arbre, rien du tout…) ne passe pas en « Démoli », son
        ID-RNB doit être désactivé.
      </p>
      <HelpLinks guideAnchor="quel-statut-donner-a-un-batiment" />
    </>
  );
}

function AddressesHelp() {
  return (
    <>
      <p>
        Associez au bâtiment son ou ses adresses. Les adresses proposées
        proviennent de la Base Adresse Nationale (BAN) : le bâtiment y est relié
        par la clé d&apos;interopérabilité de chaque adresse.
      </p>
      <HelpLinks
        guideAnchor="pourquoi-et-comment-lui-attribuer-une-des-adresse-s"
        withDefinition={false}
      />
    </>
  );
}

function ShapeHelp() {
  return (
    <>
      <p>
        La géométrie sert à identifier le bâtiment sur le terrain : ce
        n&apos;est pas un relevé officiel.
      </p>
      <ul>
        <li>Préférez un polygone à un simple point.</li>
        <li>
          En cas de doute, tracez l&apos;emprise au sol du bâtiment, sinon
          l&apos;emprise de son toit. Une approximation vaut mieux que
          l&apos;absence d&apos;information.
        </li>
        <li>
          Des bâtiments superposés ne peuvent pas encore être représentés
          séparément : tracez un seul bâtiment qui couvre l&apos;ensemble de
          leurs emprises.
        </li>
      </ul>
      <HelpLinks
        guideAnchor="quelle-geometrie-donner-a-un-batiment"
        withDefinition={false}
      />
    </>
  );
}

function ValidationHelp() {
  return (
    <>
      <p>
        Valider un bâtiment ne modifie pas ses données : cela indique qu&apos;un
        contributeur a vérifié que son statut, ses adresses et sa géométrie sont
        corrects et complets. Les autres contributeurs peuvent ainsi concentrer
        leurs efforts ailleurs.
      </p>
      <p>
        Un bâtiment validé reste modifiable, mais toute modification supprime
        ses validations.
      </p>
      <HelpLinks guideAnchor="valider-un-batiment" withDefinition={false} />
    </>
  );
}

function DeactivationHelp() {
  return (
    <>
      <p>
        Il arrive qu&apos;un ID-RNB soit attribué à tort à autre chose
        qu&apos;un bâtiment (un arbre, par exemple) ou à rien du tout. Il faut
        alors désactiver cet ID-RNB.
      </p>
      <p>
        Ne pas confondre avec un bâtiment démoli : un bâtiment démoli a existé,
        il garde son ID-RNB et passe au statut « Démoli ».
      </p>
      <p>
        Une désactivation faite par erreur peut être annulée en réactivant
        l&apos;ID-RNB.
      </p>
      <HelpLinks guideAnchor="desactiver-un-id-rnb" />
    </>
  );
}

function CreateHelp() {
  return (
    <>
      <p>
        Créez un bâtiment lorsqu&apos;il est absent du RNB, par exemple un
        bâtiment visible sur la vue satellite mais qui n&apos;a pas
        d&apos;ID-RNB. La création lui attribue immédiatement un ID-RNB.
      </p>
      <ul>
        <li>
          Tracez sa géométrie : de préférence son emprise au sol, sinon celle de
          son toit, ou à défaut une approximation.
        </li>
        <li>
          Associez-lui son adresse, voire ses adresses s&apos;il en a plusieurs.
        </li>
      </ul>
      <p>
        Avant de créer, vérifiez que le bâtiment n&apos;existe pas déjà :
        s&apos;il est mal représenté, mieux vaut le mettre à jour.
      </p>
      <HelpLinks guideAnchor="quand-creer-un-batiment" />
    </>
  );
}

function MergeHelp() {
  return (
    <>
      <p>
        Fusionnez des bâtiments lorsque plusieurs ID-RNB désignent en réalité un
        seul et même bâtiment, au sens de la définition du RNB.
      </p>
      <p>
        Lors d&apos;une fusion, les ID-RNB des bâtiments fusionnés sont
        désactivés et un nouveau bâtiment est créé avec un nouvel ID-RNB. Le
        lien de parenté entre les anciens bâtiments et le nouveau est conservé
        dans l&apos;historique.
      </p>
      <HelpLinks guideAnchor="quand-fusionner-des-batiments" />
    </>
  );
}

function SplitHelp() {
  return (
    <>
      <p>
        C&apos;est le cas inverse de la fusion : scindez un bâtiment lorsque le
        RNB n&apos;en contient qu&apos;un seul alors qu&apos;il s&apos;agit en
        réalité de plusieurs bâtiments, au sens de la définition du RNB.
      </p>
      <p>
        Par exemple, une barre d&apos;immeuble avec trois entrées indépendantes
        et trois cages d&apos;escalier qui ne communiquent pas entre elles est à
        scinder en trois.
      </p>
      <p>
        Lors d&apos;une scission, l&apos;ID-RNB du bâtiment scindé est désactivé
        et chaque bâtiment issu de la découpe reçoit un nouvel ID-RNB. Le lien
        de parenté est conservé dans l&apos;historique.
      </p>
      <HelpLinks guideAnchor="quand-scinder-un-batiment" />
    </>
  );
}

export const HELP_TOPICS: Record<
  HelpTopic,
  { title: string; Content: () => React.JSX.Element }
> = {
  validation: { title: 'Validation', Content: ValidationHelp },
  status: { title: 'Statut physique', Content: StatusHelp },
  addresses: { title: 'Adresses', Content: AddressesHelp },
  shape: { title: 'Géométrie', Content: ShapeHelp },
  deactivation: { title: 'Désactiver', Content: DeactivationHelp },
  create: { title: 'Créer un bâtiment', Content: CreateHelp },
  merge: { title: 'Fusionner des bâtiments', Content: MergeHelp },
  split: { title: 'Scinder un bâtiment', Content: SplitHelp },
};
