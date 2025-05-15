import Link from 'next/link';
import { fr } from '@codegouvfr/react-dsfr';

function CalloutWithLink({
  description,
  linkLabel,
  onClick,
}: {
  description: string;
  linkLabel: string;
  onClick: () => void;
}) {
  return (
    <div
      className={fr.cx('fr-container', 'fr-p-5v', 'fr-text--sm')}
      style={{ backgroundColor: 'var(--background-alt-yellow-tournesol)' }}
    >
      {description}{' '}
      <Link href="#" onClick={onClick}>
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
