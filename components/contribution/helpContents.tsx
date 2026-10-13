// Textes d'aide du formulaire d'édition, tirés du guide d'édition :
// https://rnb-fr.gitbook.io/documentation/guides/editer-le-rnb-dans-les-regles-de-lart

import type { HelpTopic } from '@/stores/edition/edition-slice';

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

export const HELP_TOPICS: Record<
  HelpTopic,
  { title: string; Content: () => React.JSX.Element }
> = {
  validation: { title: 'Validation', Content: ValidationHelp },
  status: { title: 'Statut physique', Content: StatusHelp },
  addresses: { title: 'Adresses', Content: AddressesHelp },
  shape: { title: 'Géométrie', Content: ShapeHelp },
  deactivation: { title: 'Désactiver', Content: DeactivationHelp },
};
