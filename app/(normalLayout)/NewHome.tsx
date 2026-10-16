import Hero from '@/components/home/Hero';
import UseCases from '@/components/home/UseCases';
import Databases from '@/components/home/Databases';
import ToolsAndServices from '@/components/home/ToolsAndServices';
import Governance from '@/components/home/Governance';
import ResultsConfettiBlock from '@/components/games/summerGames/resultsConfettiBlock';
import EditionActivity from '@/components/home/EditionActivity';

import { getBreakingNews, getUseCases } from '@/utils/blog';

import { getDatabases } from '@/utils/databases';
import { getEditionActivities, getImportStats } from '@/utils/editionActivity';

export const revalidate = 10;

export default async function Home() {
  const breakingNews = await getBreakingNews();
  const useCases = await getUseCases();

  let availableDatabases = null;
  try {
    availableDatabases = await getDatabases();
  } catch (error) {
    console.error('Error fetching databases:', error);
  }

  const [activitiesResult, importsResult] = await Promise.allSettled([
    getEditionActivities(),
    getImportStats(),
  ]);
  if (activitiesResult.status === 'rejected') {
    console.error('Error fetching edition activity:', activitiesResult.reason);
  }
  if (importsResult.status === 'rejected') {
    console.error('Error fetching import stats:', importsResult.reason);
  }
  const editionActivities =
    activitiesResult.status === 'fulfilled' ? activitiesResult.value : [];
  const importStats =
    importsResult.status === 'fulfilled' ? importsResult.value : null;

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
        {(editionActivities.length > 0 || importStats) && (
          <EditionActivity
            activities={editionActivities}
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
