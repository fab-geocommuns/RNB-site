import { fr } from '@codegouvfr/react-dsfr';
import ButtonsGroup, {
  ButtonsGroupProps,
} from '@codegouvfr/react-dsfr/ButtonsGroup';
import TechnicalError from '@codegouvfr/react-dsfr/picto/TechnicalError';

type Props = {
  title: string;
  // e.g. "Erreur 404", omitted when there is no meaningful status
  code?: string;
  lead: string;
  details?: string;
  buttons: ButtonsGroupProps['buttons'];
};

// DSFR "page d'erreur" template, without header and footer
// https://www.systeme-de-design.gouv.fr/version-courante/fr/modeles/page-d-erreurs
export default function ErrorPage({
  title,
  code,
  lead,
  details,
  buttons,
}: Props) {
  return (
    <div className="fr-container">
      <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
        <div className="fr-py-0 fr-col-12 fr-col-md-6">
          <h1>{title}</h1>
          {code && <p className="fr-text--sm fr-mb-3w">{code}</p>}
          <p className="fr-text--lead fr-mb-3w">{lead}</p>
          {details && <p className="fr-text--sm fr-mb-5w">{details}</p>}
          <ButtonsGroup inlineLayoutWhen="md and up" buttons={buttons} />
        </div>
        <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
          <TechnicalError fontSize={fr.spacing('16w')} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
