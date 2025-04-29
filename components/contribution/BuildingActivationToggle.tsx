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
      style={{ backgroundColor: 'var(--background-alt-brown-caramel)' }}
    >
      {description}
      <br />
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
        description="Ce bâtiment ne devrait pas faire partie du RNB ?"
        linkLabel="Désactiver le bâtiment"
        onClick={() => onToggle(false)}
      />
    );
  }

  return (
    <CalloutWithLink
      description="Ce bâtiment fait partie du RNB et a été désactivé par erreur ?"
      linkLabel="Réactiver le bâtiment"
      onClick={() => onToggle(true)}
    />
  );
}
