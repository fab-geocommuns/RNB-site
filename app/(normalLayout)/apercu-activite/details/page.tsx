import Alert from '@codegouvfr/react-dsfr/Alert';
import Breadcrumb from '@codegouvfr/react-dsfr/Breadcrumb';

import ContributionDetails from '@/components/home/ContributionDetails';
import {
  loadContributionRankings,
  loadContributionSummaries,
  parsePeriod,
} from '@/utils/contributionSummary';
import pageTitle from '@/utils/pageTitle';

// Details of the « Participer au RNB » section, linked from it. Not indexed,
// like the preview of the section.
export const metadata = pageTitle('Détail de l’activité', {
  robots: { index: false },
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string | string[] }>;
}) {
  const { periode } = await searchParams;
  // the same summaries as the section, all periods, and the full rankings
  // of all periods: one request each, in parallel
  const [summaries, rankings] = await Promise.all([
    loadContributionSummaries(),
    loadContributionRankings(),
  ]);

  return (
    <main className="fr-container fr-mb-8w">
      <Breadcrumb
        currentPageLabel="Détail de l’activité"
        segments={[
          {
            label: 'Aperçu de l’activité',
            linkProps: { href: '/apercu-activite' },
          },
        ]}
      />
      <h1>Détail de l’activité</h1>
      <p>
        Une contribution est une demande d’édition du RNB : une fusion ou une
        scission compte une fois, quel que soit le nombre de bâtiments
        concernés. Les imports de la BD Topo et de la BAN ne sont pas comptés.
      </p>
      {summaries ? (
        <ContributionDetails
          summaries={summaries}
          rankings={rankings}
          initialPeriod={parsePeriod(periode)}
        />
      ) : (
        <Alert
          severity="warning"
          title="Détail indisponible"
          description="L’API n’a pas répondu."
        />
      )}
    </main>
  );
}
