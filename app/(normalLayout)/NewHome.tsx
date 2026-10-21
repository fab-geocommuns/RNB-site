import Hero from '@/components/home/Hero';
import UseCases from '@/components/home/UseCases';
import Databases from '@/components/home/Databases';
import ToolsAndServices from '@/components/home/ToolsAndServices';
import Governance from '@/components/home/Governance';
import ResultsConfettiBlock from '@/components/games/summerGames/resultsConfettiBlock';
import EditionActivity from '@/components/home/EditionActivity';
import * as Sentry from '@sentry/nextjs';

import { getBreakingNews, getUseCases } from '@/utils/blog';

import { getDatabases } from '@/utils/databases';
import { getEditionActivities, getImportStats } from '@/utils/editionActivity';

// External data is cached for 5 minutes. A failing call only hides its block.
const HOME_DATA_REVALIDATE = 300;

const logError = (source: string) => (error: unknown) => {
  console.error(`Error fetching ${source}:`, error);
  Sentry.captureException(error, { tags: { source } });
  return null;
};

export default async function Home() {
  const [
    breakingNews,
    useCases,
    availableDatabases,
    editionActivities,
    importStats,
  ] = await Promise.all([
    getBreakingNews(HOME_DATA_REVALIDATE).catch(logError('breaking news')),
    getUseCases(1, HOME_DATA_REVALIDATE).catch(logError('use cases')),
    getDatabases(HOME_DATA_REVALIDATE).catch(logError('databases')),
    getEditionActivities(HOME_DATA_REVALIDATE).catch(
      logError('edition activity'),
    ),
    getImportStats(HOME_DATA_REVALIDATE).catch(logError('import stats')),
  ]);

  return (
    <>
      <Hero />
      <div className="fr-container">
        {breakingNews?.featured && (
          <>
            <div className="fr-grid-row">
              <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">
                <div
                  dangerouslySetInnerHTML={{ __html: breakingNews.html || '' }}
                ></div>
              </div>
            </div>
          </>
        )}
        <div className="fr-grid-row fr-mt-6w">
          <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">
            <ResultsConfettiBlock />
          </div>
        </div>
        {(editionActivities || importStats) && (
          <EditionActivity
            activities={editionActivities ?? []}
            imports={importStats}
          />
        )}
        {!!useCases && <UseCases useCases={useCases} />}
        {availableDatabases && <Databases databases={availableDatabases} />}
        <ToolsAndServices />
        <Governance />
      </div>
    </>
  );
}
