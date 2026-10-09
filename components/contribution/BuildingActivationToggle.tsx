import Link from 'next/link';
import { fr } from '@codegouvfr/react-dsfr';
import styles from '@/styles/contribution/building.module.scss';
import FieldHelp from './FieldHelp';
import { HelpTopic } from '@/stores/edition/edition-slice';

function CalloutWithLink({
  description,
  linkLabel,
  onClick,
  helpTopic,
}: {
  description: string;
  linkLabel: string;
  onClick: () => void;
  helpTopic?: HelpTopic;
}) {
  return (
    <div
      className={fr.cx('fr-container', 'fr-p-5v', 'fr-text--sm')}
      style={{ backgroundColor: 'var(--background-alt-yellow-tournesol)' }}
    >
      {helpTopic && (
        <FieldHelp
          title={
            <span className={`fr-text--xs ${styles.sectionTitle}`}>
              Désactiver
            </span>
          }
          topic={helpTopic}
        />
      )}
      {description}{' '}
      <Link href="#" onClick={onClick} data-testid="toggle-activation-button">
        {linkLabel}
      </Link>
    </div>
  );
}

type Props = {
  isActive: boolean;
  onToggle: (isActive: boolean) => void;
};

export default function BuildingActivationToggle({
  isActive,
  onToggle,
}: Props) {
  if (isActive) {
    return (
      <CalloutWithLink
        description="Ceci n'est pas un bâtiment selon la définition du RNB ?"
        linkLabel="Désactiver l'ID-RNB"
        onClick={() => onToggle(false)}
        helpTopic="deactivation"
      />
    );
  }

  return (
    <CalloutWithLink
      description="Cet ID-RNB a été désactivé par erreur ?"
      linkLabel="Réactiver l'ID-RNB"
      onClick={() => onToggle(true)}
    />
  );
}
