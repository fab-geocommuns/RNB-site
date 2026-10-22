import Alert from '@codegouvfr/react-dsfr/Alert';
import * as Sentry from '@sentry/nextjs';

import EditionActivity from '@/components/home/EditionActivity';
import { getEditionActivities, getImportCount } from '@/utils/editionActivity';
import pageTitle from '@/utils/pageTitle';

// Preview of the home page activity block, to try it with production data
// before showing it on the home page. Linked from nowhere and not indexed.
export const metadata = pageTitle('Aperçu de l’activité', {
  robots: { index: false },
});

// Same cache as the home page external data
const REVALIDATE = 300;

const logError = (source: string) => (error: unknown) => {
  console.error(`Error fetching ${source}:`, error);
  Sentry.captureException(error, { tags: { source } });
  return null;
};

export default async function Page() {
  const [editionActivities, importCount] = await Promise.all([
    getEditionActivities(REVALIDATE).catch(logError('edition activity')),
    getImportCount(REVALIDATE).catch(logError('import count')),
  ]);

  return (
    <div className="fr-container">
      {!editionActivities && (
        <Alert
          className="fr-mt-6w"
          severity="warning"
          title="Activité indisponible"
          description="L’API n’a pas répondu à temps. Rechargez la page dans quelques instants."
        />
      )}
      <EditionActivity
        activities={editionActivities ?? []}
        importCount={importCount}
      />
    </div>
  );
}
