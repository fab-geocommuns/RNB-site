'use client';

// Styles
import styles from '@/styles/summerGames.module.scss';
import RankTable from './rankTable';

// Utils
import { useSummerGamesData } from '@/utils/summerGames';

export const revalidate = 10;

export default function SummerGame() {
  const { summerGamesData, loading } = useSummerGamesData();

  return (
    !loading &&
    summerGamesData && (
      <>
        <div className={`section section_big ${styles.seriousShell}`}>
          <div className={styles.shell}>
            <div className={`section__titleblock ${styles.titleShell}`}>
              <h2 className="section__title">Le défi de l&apos;été du RNB</h2>

              <p className={`section__subtitle ${styles.instruction}`}>
                Cet été, le RNB s'ouvre largement à l'édition collaborative.
                Participez à l'enrichissement du Référentiel National des
                Bâtiments et permettez à chacun de profiter de vos
                contributions. Les résultats du défi de l'été aideront à définir
                les futures règles de participation au RNB.
              </p>
            </div>

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
                  <div className={styles.scoreAction}>Corriger une forme</div>
                  <div className={styles.scoreReward}>
                    1 <span className={styles.scoreRewardPoint}>point</span>
                  </div>
                </div>
              </div>

              <div className={styles.scoresRow}>
                <div className={styles.score}>
                  <div className={styles.scoreAction}>Scinder un bâtiment</div>
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
                  <div className={styles.scoreAction}>Modifier le statut</div>
                  <div className={styles.scoreReward}>
                    1 <span className={styles.scoreRewardPoint}>point</span>
                  </div>
                </div>
              </div>
            </div>

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
                    title="Classement des départements *"
                    ranks={summerGamesData.department}
                    limit={5}
                  />
                </div>

                <div className={styles.ranksTable}>
                  <RankTable
                    title="Classement des villes *"
                    ranks={summerGamesData.city}
                    limit={5}
                  />
                </div>

                <div className={styles.ranksTable}>
                  <RankTable
                    title="Classement des participants *"
                    ranks={summerGamesData.individual}
                    limit={5}
                  />
                </div>
              </div>
            </div>

            <div className={styles.buttonsShell}>
              <a
                href="/edition"
                className={`${styles.btn} ${styles.btn_primary}`}
              >
                Participer
              </a>
              <a href="/edition" className={`${styles.btn}`}>
                En savoir plus
              </a>
            </div>
          </div>
        </div>
      </>
    )
  );
}
