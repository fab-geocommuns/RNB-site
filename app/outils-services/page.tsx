
// Styles
import styles from '@/styles/tools.module.scss'
import { fr } from "@codegouvfr/react-dsfr";

export default function Outils() {

    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-py-12v">


                    <h1>Outils & services</h1>

                    <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12">
                            <div className={`${styles.tool} ${styles["tool--blue"]}`}>
                                <h2 className={styles.toolTitle}>Carte des bâtiments</h2>
                                <p className={styles.toolSubtitle}>Consultez les 48 millions de bâtiments du référentiel. Retrouvez un bâtiment grâce à son identifiant ou son adresse.</p>
                                <form action="/carte" method="get">

                                    <div className="fr-search-bar">
                                        <input 
                                        className='fr-input' 
                                        type="text" 
                                        name="q"
                                        placeholder="un bâtiment : SBW3-HVPC-LHD8 ou une adresse : 42, rue des architectes, Nantes"
                                        />
                                        <button className="fr-btn" type="submit">Rechercher</button>
                                        
                                    </div>

                                </form>
                                <div className={styles.toolLinkShell}>
                                    <a className="fr-btn fr-btn--secondary" href="/carte">Consulter la carte 
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-md-6">
                            <div className={`${styles.tool} ${styles["tool--yellow"]}`}>
                                <h2 className={styles.toolTitle}>Croisement de bases bâtimentaires</h2>
                                <p className={styles.toolSubtitle}>Vous souhaitez croiser deux bases de données bâtimentaires mais n'avez pas les ressources pour le faire ?<br />
                                <b>Nous offrons ce service jusqu'en décembre 2023.</b></p>
                                <div className={styles.toolLinkShell}><a href="#" className='fr-btn fr-btn--secondary'>En savoir plus</a></div>
                            </div>
                        </div>
                        <div className="fr-col-12 fr-col-md-6">
                            <div className={`${styles.tool} ${styles["tool--green"]}`}>
                                <h2 className={styles.toolTitle}>API et documentation</h2>
                                <p className={styles.toolSubtitle}>Intégrez le référentiel à vos systèmes. Obtenez les identifiants RNB de vos bâtiments. Utilisez nos API et tuiles vectorielles en accès libre.</p>
                                <div className={styles.toolLinkShell}><a href="/doc" className='fr-btn fr-btn--secondary'>Consulter la documentation</a></div>
                            </div>
                        </div>
                        <div className="fr-col-12">
                            <div className={`${styles.tool} ${styles["tool--archipel"]}`}>
                                <h2 className={styles.toolTitle}>Autorisation du droit des sols</h2>
                                <p className={styles.toolSubtitle}>
                                    <b>Résérvé aux instructeurs d&apos;ADS</b><br />
                                    Utilisez vos outils d&apos;instruction d'ADS pour alimenter le RNB. Soyez prévenus lorsque des bâtiments sont achevés sur votre territoire.</p>
                                    <div className={styles.toolLinkShell}>
                                    <a className="fr-btn fr-btn--secondary" href="/carte">En savoir plus
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>




                
                    </div>
                </div>
            </div>
        </>
    )
}