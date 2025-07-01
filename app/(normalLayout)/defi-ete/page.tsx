import SummerGame from '@/components/summerGames/homeBlock';

export default function Page() {
  return (
    <div className="fr-container">
      <div className="fr-grid-row">
        <div className="fr-col-12 fr-col-md-12 fr-py-12v">
          <SummerGame
            title="Classement du défi 2025"
            limit={100}
            showRankingLink={false}
          />
        </div>
      </div>
    </div>
  );
}
