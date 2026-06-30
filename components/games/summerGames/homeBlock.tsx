'use client';

// Styles
import styles from '@/styles/summerGames.module.scss';
import RankTable from './rankTable';
import CheckmarkBackground from './checkmarkBackground';

// Utils
import { useSummerGamesData } from '@/utils/summerGames';
import Link from 'next/link';

export const revalidate = 10;

export default function SummerGame({
  title,
  subtitle = null,
  limit,
  showRankingLink,
  withRankingTable = false,
  withEndFlag = false,
  size = 'small',
}: {
  title: React.ReactNode | string;
  subtitle?: React.ReactNode | string | null;
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
            <CheckmarkBackground />
            <div className={styles.shellContent}>
              <div className={`section__titleblock ${styles.titleblock}`}>
                {subtitle && (
                  <span className={styles.overTitle}>{subtitle}</span>
                )}
                <h2 className="section__title">{title}</h2>

                {withEndFlag && (
                  <div className={styles.endFlagShell}>
                    <span className={styles.endFlag}>Terminée</span>
                  </div>
                )}
              </div>
              <div className={`section__subtitle ${styles.instruction}`}>
                <p className={styles.highlight}>
                  Participez à la validation des bâtiments du RNB. Inspectez les
                  bâtiments de votre parc immobilier, de votre voisinage et des
                  territoires que vous connaissez. Validez les bâtiments
                  corrects et faites monter le score global.
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
                      {summerGamesData.shared.absolute} validations faites par
                      la communauté
                    </p>
                  </div>

                  <div className={styles.bar}>
                    <div
                      className={styles.progress}
                      style={{
                        width: `${Math.min(summerGamesData.shared.percent, 100)}%`,
                      }}
                    >
                      <span className={styles.progressTotal}>
                        {summerGamesData.shared.percent}%
                      </span>
                    </div>
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
        </div>
      </>
    )
  );
}
