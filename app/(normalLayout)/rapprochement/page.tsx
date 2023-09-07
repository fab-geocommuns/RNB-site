// Styles
import styles from '@/styles/tools.module.scss'
import stylesHome from '@/styles/home.module.scss'

// Comps
import ImageNext from 'next/image'
import CasList from '@/components/CasListe'

// Logos
import rapprochementIllu from '@/public/images/rapprochement-service.svg'

export default function Page() {
    return (
        <>
        
        <div className="fr-container">
                <div className="fr-grid-row ">
                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-py-12v">
                        <h1>Service de rapprochements</h1>


                        <div className={`fr-grid-row fr-grid-row--gutters section`}>
                            <div className="fr-col-12">
                                <div className={`${styles.tool} ${styles["tool--yellow"]}`}>
                                    <h2 className={styles.toolTitle}>Nous croisons vos bases de données de bâtiments</h2>
                                    <p>Vous avez des bases de données de bâtiments que vous aimeriez croiser produire de nouvelles analyses, avoir une connaissance plus fine de votre parc ? Obtenez rapidement des correspondances de qualité entre différentes bases de données bâtimentaires, grâce au Référentiel National des Bâtiments.</p>
                                    <p><b>Nous proposons ce service gratuit et sur-mesure jusqu&apos;en décembre 2023, sous réserve de créneaux disponbles.<br />
                                    Vous souhaitez profiter de ce service ?</b></p>
                                    <div className={` ${styles.toolLinkShell} ${styles["toolLinkShell--noGrow"]} `}>
                                            <a className="fr-btn" href="/contact">Contactez nous</a>
                                    </div>
                                </div>
                            </div>
                            <div className='fr-col-12 fr-col-md-5'>
                                <div className={`${styles.tool} ${styles["tool--green"]} ${styles["tool--fill"]}`}>
                                <h2 className={styles.toolTitle}>Pourquoi gratuit ?</h2>
                                <p className={styles.toolSubtitle}>
                                    Nous avons créé des outils de rapprochement de base et souhaitons maintenant les confronter à une variété cas pour renforcer leur efficacité.
                                </p>
                                <p>
                                    Appliquer ces outils à vos cas d&apos;usage est le meilleur moyen de les faire évoluer.
                                </p>
                                </div>
                            </div>
                            <div className='fr-col-12 fr-col-md-7'>

                                <div className={`${styles.tool} ${styles["tool--pink"]} ${styles["tool--fill"]}`}>
                                <h2 className={styles.toolTitle}>Self-service</h2>
                                <p className={styles.toolSubtitle}>
                                    Vous préférez croiser vos bases en utilisant directement nos outils ?
                                </p>
                                <p>Nos APIs vous permettent d'obtenir l&apos;identifiant RNB de vos bâtiments à partir d&apos;une adresse, d&apos;un point ou d&apos;un polygone.</p>
                                <div className={` ${styles.toolLinkShell} ${styles["toolLinkShell--noGrow"]} `}>
                                            <a className="fr-btn fr-btn--secondary" href="/doc">Consulter la documentation</a>
                                    </div>
                                </div>

                            </div>
                            <div className="fr-col-12">
                                <div className={`${styles.tool} ${styles["tool--blue"]}`}>
                                    <h2 className={`{styles.toolTitle}`}>Comment ça marche ?</h2>

                                    <div className="fr-grid-row fr-grid-row--gutters">
                                        <div className="fr-col-12 fr-col-md-7">

                                        <ol className={styles.toolList}>
                                            <li>
                                                <b>Décrivez-nous votre besoin</b><br />
                                                <a href="/contact">Envoyez-nous votre demande</a> et précisez votre situation et vos attentes.
                                            </li>
                                            <li>
                                                <b>Echangez par visioconférence avec notre équipe</b><br />
                                                Après réception de votre demande, nous vous proposerons un rendez-vous pour faire le point sur votre situation et répondre à vos questions.
                                            </li>
                                            <li>
                                                <b>Envoyez-nous vos données bâtimentaires</b><br />
                                                Nous pouvons traiter tous types de format (Excel, Shapefile, GeoJSON, etc.). Chacun de vos bâtiments doit contenir une adresse et/ou un point géolocalisé et/ou un polygone géolocalisé.
                                            </li>
                                            <li>
                                                <b>Nous réalisons le croisement de vos données</b><br />
                                                Vos données seront croisées par notre équipe en interne, grâce à l’ID Bâtiment, l’identifiant pivot pour agréger l’ensemble des informations entre elles à la maille du bâtiment
                                            </li>
                                            <li>
                                                <b>Recevez les résultats de correspondances entre vos jeux de données</b><br />
                                                Après analyse, l’équipe RNB vous adressera les correspondances bâtimentaires de l’ensemble de vos jeux de données.
                                            </li>
                                        </ol>

                                        <div className={` ${styles.toolLinkShell} ${styles["toolLinkShell--noGrow"]} `}>
                                            <a className="fr-btn" href="/contact">Contactez nous</a>
                                        </div>

                                        </div>
                                        <div className="fr-col-12 fr-col-md-5">
                                            <ImageNext className={styles.serviceIllu} src={rapprochementIllu} alt="Attacher l'identifiant RNB à vos données bâtimentaires" />
                                        </div>
                                    </div>
                                </div>

                                  

                                </div>
                            </div>

                            

                            <div className="section">
                <div className={`${stylesHome.homeCardsSection} fr-grid-row fr-grid-row--gutters`}>
                    
                <div className="fr-col-12 ">
                <div className={stylesHome.homeCardsSection__titleblock}>
                    <h2 >Cas d&apos;usage</h2>
                    <p>
                        Vous êtes une commune, une métropole, un Service départemental d’incendie et de secours (SDIS), un fournisseur de gaz ou d’électricité ou une administration publique, ce service est fait pour vous.<br />
                        Retrouvez les exemples d’utilisation du RNB par d’autres acteurs ci-dessous.
                    </p>

                </div>

                <CasList />
                </div>
                </div>

            </div>

                        </div>

                        

                    </div>
                </div>
        
        </>
    )
}