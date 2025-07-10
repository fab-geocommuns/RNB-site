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
}: {
  title: React.ReactNode | string;
  limit: number;
  showRankingLink?: boolean;
  withScoreDetails?: boolean;
}) {
  const { summerGamesData, loading } = useSummerGamesData(limit);

  return (
    !loading &&
    summerGamesData && (
      <>
        <div className={`section section_big ${styles.seriousShell}`}>
          <div className={styles.shell}>
            <div className={`section__titleblock ${styles.titleShell}`}>
              <h2 className="section__title">{title}</h2>

              <div className={`section__subtitle ${styles.instruction}`}>
                <p>
                  Comment faire vivre un référentiel collaboratif ? <br />
                  Comment améliorer le lien bâtiment adresse ?<br />
                  Quels acteurs souhaitent alimenter le RNB ?
                </p>
                <p>
                  Du 10 juillet au 10 septembre, le RNB organise une expérience
                  et s&apos;ouvre largement à l&apos;édition collaborative.
                  Faites monter le score de qualité du RNB, de votre ville et de
                  votre département.
                </p>
              </div>
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
                    style={{ width: summerGamesData.shared.percent + '%' }}
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
                <Link href="/classement" className={`${styles.btn}`}>
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
