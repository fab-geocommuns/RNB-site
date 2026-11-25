import pageTitle from '@/utils/pageTitle';
import VerificationWorkspace from '@/components/verification/VerificationWorkspace';

// Outil interne : vérifier à l'œil une liste de bâtiments importée depuis un
// CSV (colonne rnb_id). Rien n'est écrit côté API, les verdicts restent dans
// le navigateur jusqu'à l'export.
export const metadata = pageTitle('Vérification de bâtiments', {
  robots: { index: false, follow: false },
});

export default function VerificationPage() {
  return <VerificationWorkspace />;
}
