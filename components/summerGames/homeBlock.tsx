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
              <h2 className="section__title">
                Résultats du jeu concours de l’été 🏆
              </h2>

              <p className={`section__subtitle ${styles.instruction}`}>
                Le jeu de l'été du RNB est désormais terminé. <br />
                Félicitations aux lauréates et lauréats classés en haut du
                podium des "Grands Contributeurs du RNB" et un grand merci à
                vous tous pour votre large participation&nbsp;! <br />
                Vos signalements permettent au RNB de s'améliorer et profitent à
                tous les utilisateurs de ce géocommun&nbsp;:
              </p>

              <p className={`section__subtitle ${styles.instruction}`}>
                Nombre total de signalements reçus:{' '}
                <strong className={styles.titleResult}>
                  {summerGamesData.shared.absolute}
                </strong>
              </p>
            </div>

            <div className={styles.progressShell}>
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

              <div className={styles.ranksExplain}>
                * Classement par nombre de signalements effectués dans un
                département donné, une ville donnée ou par participant
              </div>
            </div>
          </div>
        </div>
      </>
    )
  );
}
