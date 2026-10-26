import Alert from '@codegouvfr/react-dsfr/Alert';

import ContributionSummary from '@/components/home/ContributionSummary';
import { loadContributionSummaries } from '@/utils/contributionSummary';
import pageTitle from '@/utils/pageTitle';

// Preview of the « Participer au RNB » section of the home page, to try it with
// production data before showing it on the home page. Linked from nowhere and
// not indexed.
export const metadata = pageTitle('Aperçu de l’activité', {
  robots: { index: false },
});

export default async function Page() {
  const summaries = await loadContributionSummaries();

  return (
    <div className="fr-container">
      {/* the home page hides the section silently; the preview says why */}
      {!summaries && (
        <Alert
          className="fr-mt-6w"
          severity="warning"
          title="Synthèse indisponible"
          description="L’API n’a pas répondu. La section serait masquée sur la page d’accueil."
        />
      )}
      <ContributionSummary summaries={summaries} />
    </div>
  );
}
