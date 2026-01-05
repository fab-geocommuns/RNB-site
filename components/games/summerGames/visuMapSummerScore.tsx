import styles from '@/styles/summerGames.module.scss';
import ProgressBar from './ProgressBar';

// Utils
import { useSummerGamesData } from '@/utils/summerGames';

export default function VisuMapSummerScore() {
  const { summerGamesData, loading } = useSummerGamesData(1);

  return (
    <>
      <div className={styles.mapSummerScore}>
        <a href="/edition" className={styles.mapSummerScoreInside}>
          <div className={styles.mapSummerScoreTitle}>
            L&apos;expérience <br />
            collaborative
          </div>

          {!loading && summerGamesData && (
            <div className={styles.mapSummerScoreSubpart}>
              <div className={styles.mapSummerScoreSubpartTitle}>
                Score global
              </div>
              <ProgressBar
                score={summerGamesData.shared.absolute}
                goal={summerGamesData.shared.goal}
              />
              <div className={styles.mapSummerScoreSubpartValue}>
                {summerGamesData.shared.absolute}/{summerGamesData.shared.goal}
              </div>
            </div>
          )}
        </a>
      </div>
    </>
  );
}
