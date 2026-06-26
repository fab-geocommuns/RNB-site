'use client';

// Styles
import styles from '@/styles/summerGames.module.scss';
import RankTable from './rankTable';

// Utils
import { useSummerGamesData } from '@/utils/summerGames';
import Link from 'next/link';

export const revalidate = 10;

export default function SummerGame({
  title,
  limit,
  showRankingLink,
  withRankingTable = false,
  withEndFlag = false,
  size = 'small',
}: {
  title: React.ReactNode | string;
  limit: number;
  showRankingLink?: boolean;
  withRankingTable?: boolean;
  withEndFlag?: boolean;
  size?: 'small' | 'large';
}) {
  const { summerGamesData, loading } = useSummerGamesData(limit);

  return (
    !loading &&
    summerGamesData && (
      <>
        <div
          className={`section ${size === 'small' && styles.small} ${styles.seriousShell}`}
        >
          <div className={styles.shell}>
            <div className={`section__titleblock ${styles.titleblock}`}>
              <h2 className="section__title">{title}</h2>
              {withEndFlag && (
                <div className={styles.endFlagShell}>
                  <span className={styles.endFlag}>Terminée</span>
                </div>
              )}
            </div>
            <div className={`section__subtitle ${styles.instruction}`}>
              <p className={styles.highlight}>
                Introduction description du jeu
              </p>
            </div>

            <div className={styles.progressShell}>
              <div className={styles.barShell}>
                <div className={styles.legend}>
                  <span className={styles.legend_subtitle}>
                    Validations faites
                  </span>
                  <br />
                  <p>
                    {summerGamesData.shared.absolute} validations faites par la
                    communauté
                  </p>
                </div>
              </div>

              {withRankingTable && (
                <div className={styles.ranks}>
                  <div className={styles.ranksTable}>
                    <RankTable
                      title="Classement des départements"
                      ranks={summerGamesData.department}
                    />
                  </div>

                  <div className={styles.ranksTable}>
                    <RankTable
                      title="Classement des organisations"
                      ranks={summerGamesData.organization}
                    />
                  </div>

                  <div className={styles.ranksTable}>
                    <RankTable
                      title="Classement des participants"
                      ranks={summerGamesData.individual}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className={styles.buttonsShell}>
              {showRankingLink && (
                <Link
                  href="/classement"
                  className={`${styles.btn} ${styles.btnRank}`}
                >
                  Voir le classement
                </Link>
              )}
              <Link
                href="/edition"
                className={`${styles.btn} ${styles.btn_primary}`}
              >
                Participer
              </Link>
              <Link
                href="/blog/le-rnb-souvre-a-ledition-collaborative"
                className={`${styles.btn}`}
              >
                En savoir plus TODO
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  );
}
