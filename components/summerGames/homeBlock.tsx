

// Styles
import styles from '@/styles/summerGames.module.scss'
import RankTable from './rankTable'





export default function SummerGame() {
    return (
        <>
        <div className={`section section_big ${styles.seriousShell}`}>

            <div className={styles.shell}>
            

            
                <div className={`section__titleblock ${styles.titleShell}`}>
                    <h2 className="section__title">Les jeux d'été du RNB</h2>
                    
                    <p className={`section__subtitle ${styles.instruction}`}>
                        Cet été, <a href="/carte">contribuez au RNB</a> et mettez votre département en haut du podium
                    </p>



                </div>

                <div className={styles.progressShell}>


                <div className={styles.barShell}>
                        
                            <div className={styles.legend}>Objectif partagé : 1000 signalements</div>

                            <div className={styles.bar}>
                                <div className={styles.progress} style={{width: '25%'}}><span className={styles.progressTotal}>257</span></div>
                            </div>
                        
                </div>

                <div className={styles.ranks}>

                    <div className={styles.ranksTable}>


                        <RankTable title="Classement des départements" ranks={[
                            {name: "Dordogne", count: 23},
                            {name: "Eure-et-Loir", count: 8},
                            {name: "Bouches-du-Rhône", count: 7},
                            {name: "Rhône", count: 6},
                            {name: "Gironde", count: 2}
                        ]} />

                    </div>


                    <div className={styles.ranksTable}>

                    <RankTable title="Classement des villes" ranks={[
                            {name: "Dreux", count: 23},
                            {name: "Cénac", count: 8},
                            {name: "Lyon", count: 7},
                            {name: "Paris", count: 6},
                            {name: "La Londes les Maures", count: 2}
                        ]} />
    


</div>

                    <div className={styles.ranksTable}>

                    <RankTable title="Classement des contributeurs" ranks={[
                            {name: "#1", count: 23},
                            {name: "#2", count: 8},
                            {name: "#3", count: 7},
                            {name: "#4", count: 6},
                            {name: "#5", count: 2}
                        ]} />
                        


                    </div>


                </div>

                <div className={styles.ranksExplain}>Le classement se fait par nombre de signalements d'erreurs récoltés.</div>

                <div className={styles.buttonsShell}>
                    <a href="/carte" className={styles.btn + ' ' + styles.btn_primary}>Participer aux jeux</a>
                    
                </div>

                </div>
                </div>

        </div>
        </>
    )
}