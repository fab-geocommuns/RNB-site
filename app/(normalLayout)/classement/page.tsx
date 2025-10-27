import pageTitle from '@/utils/pageTitle';
import SummerGame from '@/components/summerGames/homeBlock';

export const metadata = pageTitle('Classement');

export default function Page() {
  return (
    <div className="fr-container">
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-col-md-12 fr-py-12v">
          <SummerGame
            title="Le classement des éditions"
            limit={100}
            showRankingLink={false}
            withRankingTable={true}
            size="large"
          />
        </div>
      </div>
    </div>
  );
}
