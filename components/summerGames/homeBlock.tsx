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
  withScoreDetails = false,
  withEndFlag = false,
}: {
  title: React.ReactNode | string;
  limit: number;
  showRankingLink?: boolean;
  withScoreDetails?: boolean;
  withEndFlag?: boolean;
}) {
  const { summerGamesData, loading } = useSummerGamesData(limit);

  return (
    !loading &&
    summerGamesData && (
      <>
        <div className={`section section_big ${styles.seriousShell}`}>
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
              <p>
                L'expérience est terminée depuis le 10 septembre. À cette date,
                le score global est de 131237 points. Les données récoltées vont
                nous permettre de vous proposer les règles de participation au
                RNB à la fin de l'année.
              </p>
              <p className={styles.highlight}>
                La grande qualité de vos contributions nous permet de laisser
                les éditions ouvertes jusqu'à ce que les règles de participation
                soient établies.
              </p>
            </div>

            {withScoreDetails && (
              <div className={styles.scoresDesc}>
                <div className={styles.scoresRow}>
                  <div className={styles.score}>
                    <div className={styles.scoreAction}>
                      Corriger des adresses
                    </div>
                    <div className={styles.scoreReward}>
                      3 <span className={styles.scoreRewardPoint}>points</span>
                    </div>
                  </div>
                  <div className={styles.score}>
                    <div className={styles.scoreAction}>Créer un bâtiment</div>
                    <div className={styles.scoreReward}>
                      2 <span className={styles.scoreRewardPoint}>points</span>
                    </div>
                  </div>

                  <div className={styles.score}>
                    <div className={styles.scoreAction}>
                      Désactiver un bâtiment
                    </div>
                    <div className={styles.scoreReward}>
                      2 <span className={styles.scoreRewardPoint}>points</span>
                    </div>
                  </div>

                  <div className={styles.score}>
                    <div className={styles.scoreAction}>
                      Corriger une géométrie
                    </div>
                    <div className={styles.scoreReward}>
                      1 <span className={styles.scoreRewardPoint}>point</span>
                    </div>
                  </div>
                </div>

                <div className={styles.scoresRow}>
                  <div className={styles.score}>
                    <div className={styles.scoreAction}>
                      Scinder un bâtiment
                    </div>
                    <div className={styles.scoreReward}>
                      1 <span className={styles.scoreRewardPoint}>point</span>
                    </div>
                  </div>

                  <div className={styles.score}>
                    <div className={styles.scoreAction}>
                      Fusionner des bâtiments
                    </div>
                    <div className={styles.scoreReward}>
                      1 <span className={styles.scoreRewardPoint}>point</span>
                    </div>
                  </div>

                  <div className={styles.score}>
                    <div className={styles.scoreAction}>Corriger le statut</div>
                    <div className={styles.scoreReward}>
                      1 <span className={styles.scoreRewardPoint}>point</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.progressShell}>
              <div className={styles.barShell}>
                <div className={styles.legend}>
                  <span className={styles.legend_subtitle}>
                    Objectif collectif
                  </span>
                  <br />
                  {summerGamesData.shared.goal} points
                </div>

                <div className={styles.bar}>
                  <div
                    className={styles.progress}
                    style={{
                      width: `${Math.min(summerGamesData.shared.percent, 100)}%`,
                    }}
                  >
                    <span className={styles.progressTotal}>
                      {summerGamesData.shared.absolute}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.ranks}>
                <div className={styles.ranksTable}>
                  <RankTable
                    title="Classement des départements"
                    ranks={summerGamesData.department}
                  />
                </div>

                <div className={styles.ranksTable}>
                  <RankTable
                    title="Classement des villes"
                    ranks={summerGamesData.city}
                  />
                </div>

                <div className={styles.ranksTable}>
                  <RankTable
                    title="Classement des participants"
                    ranks={summerGamesData.individual}
                  />
                </div>
              </div>
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
                href="/blog/lancez-vous-dans-ledition-collaborative-du-rnb-cet-ete"
                className={`${styles.btn}`}
              >
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  );
}
