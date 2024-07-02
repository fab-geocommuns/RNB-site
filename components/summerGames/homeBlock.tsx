'use client'

// Styles
import styles from '@/styles/summerGames.module.scss'
import RankTable from './rankTable'

// Utils
import {useSummerGamesData} from '@/utils/summerGames';

export const revalidate = 10

export default function SummerGame() {

    const {summerGamesData, loading} = useSummerGamesData();

    return !loading && summerGamesData && (
        <>
            <div className={`section section_big ${styles.seriousShell}`}>

                <div className={styles.shell}>


                    <div className={`section__titleblock ${styles.titleShell}`}>
                        <h2 className="section__title">Le jeu d&apos;été du RNB</h2>

                        <p className={`section__subtitle ${styles.instruction}`}>
                            Cet été, participez à une expérience collaborative sur le géocommun RNB ! <br/>
                            Améliorez la qualité de la donnée en atteignant l’objectif collectif de signalements. <br/>
                            Et faites gagner votre département, votre ville, ou montez sur le podium à la rentrée !
                        </p>


                    </div>

                    <div className={styles.progressShell}>


                        <div className={styles.barShell}>

                            <div className={styles.legend}>
                                <span className={styles.legend_subtitle}>Objectif collectif</span><br/>
                                {summerGamesData.shared.goal} signalements
                            </div>

                            <div className={styles.bar}>
                                <div className={styles.progress} style={{width: summerGamesData.shared.percent + '%'}}>
                                    <span className={styles.progressTotal}>{summerGamesData.shared.absolute}</span>
                                </div>
                            </div>

                        </div>

                        <div className={styles.ranks}>

                            <div className={styles.ranksTable}>


                                <RankTable title="Classement des départements *" ranks={summerGamesData.department}
                                           limit={5}/>

                            </div>


                            <div className={styles.ranksTable}>

                                <RankTable title="Classement des villes *" ranks={summerGamesData.city} limit={5}/>


                            </div>

                            <div className={styles.ranksTable}>

                                <RankTable title="Classement des participants *" ranks={summerGamesData.individual}
                                           limit={5}/>


                            </div>


                        </div>

                        <div className={styles.ranksExplain}>
                            * Classement par nombre de signalements effectués dans un département donné, une ville donnée ou par participant
                        </div>

                        <div className={styles.buttonsShell}>
                            <a href="/carte" className={styles.btn + ' ' + styles.btn_primary}>Participer au jeu</a>

                        </div>

                    </div>
                </div>

            </div>
        </>
    )
}