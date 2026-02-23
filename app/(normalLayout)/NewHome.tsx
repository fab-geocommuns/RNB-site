import Hero from '@/components/home/Hero';
import UseCases from '@/components/home/UseCases';
import Databases from '@/components/home/Databases';
import ToolsAndServices from '@/components/home/ToolsAndServices';
import Governance from '@/components/home/Governance';

import { getBreakingNews, getUseCases } from '@/utils/blog';

import { getDatabases } from '@/utils/databases';

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
        {!!useCases && <UseCases useCases={useCases} />}
        {availableDatabases && <Databases databases={availableDatabases} />}
        <ToolsAndServices />
        <Governance />
      </div>
    </>
  );
}
