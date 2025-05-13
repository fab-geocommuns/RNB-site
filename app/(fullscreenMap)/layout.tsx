import RNBHeader from '@/components/RNBHeader';
import { Notice } from '@codegouvfr/react-dsfr/Notice';

export default function FullscreenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RNBHeader withNavigation={false} />
      <Notice
        title="Le mode édition est en phase de test."
        description="Envoyez-nous vos commentaires sur son utilisation à rnb@beta.gouv.fr"
        severity="info"
      />
      {children}
    </>
  );
}
