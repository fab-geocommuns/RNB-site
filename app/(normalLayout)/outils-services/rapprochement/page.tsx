// Styles
import styles from '@/styles/toolDetail.module.scss'

// Comps
import ImageNext from 'next/image'
import CasList from '@/components/CasListe'

// Images
import rapprochementIllu from '@/public/images/rapprochement-service.svg'
import dashboardIllu from '@/public/images/dashboard.svg'
import shareIllu from '@/public/images/share-doc.svg'
import teamIllu from '@/public/images/teamwork.svg'

export default function Page() {
    return (
        <>
        
        <div className="fr-container">
                <div className="fr-grid-row ">


                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pt-12v">
                        <h1>Service de rapprochements</h1>
                            
                                <div className="block block--yellow">
                                    <h2 className="blockTitle">Nous croisons vos bases de données de bâtiments</h2>
                                    <p>Vous avez des bases de données de bâtiments que vous aimeriez croiser pour produire de nouvelles analyses, avoir une connaissance plus fine de votre parc ? Obtenez rapidement des correspondances de qualité entre différentes bases de données bâtimentaires, grâce au Référentiel National des Bâtiments.</p>

                                    <p><b><span className='stab stab--yellowStrong'>Nous vous proposons ce service gratuit et sur-mesure.</span></b></p>

                                    <p><b>Vous souhaitez profiter de ce service ?</b></p>
                                    <div className="blockLinkShell blockLinkShell--noGrow">
                                            <a className="fr-btn" href="/contact">Contactez nous</a>
                                    </div>
                                </div>
                    </div>
                    <div className="fr-col-12">
                            

                            
                                
                                    
                                    
                                    <div className={styles.benefShell}>
                                        <div className={styles.benef}>
                                            <div>
                                                <ImageNext className={styles.benef__illu} src={dashboardIllu} alt="Croisez des bases isolées pour produire de nouvelles analyses" />
                                            </div>
                                            <h3 className={styles.benef__title}>Améliorez vos analyses</h3>
                                            <div className={styles.benef__desc}>
                                            Créez de nouvelles analyses en croisant vos bases bâtimentaires jusqu&apos;à présent isolées.
                                            </div>
                                            
                                        </div>


                                        <div className={styles.benef}>
                                            <div>
                                                <ImageNext className={styles.benef__illu} src={shareIllu} alt="Faites circuler l'information bâtimentaire" />
                                            </div>
                                            <h3 className={styles.benef__title}>Faites circuler l&apos;information</h3>
                                            <div className={styles.benef__desc}>
                                            Partager des informations bâtimentaires qualitatives entre différentes organisations et services.
                                            </div>
                                            
                                        </div>

                                        <div className={styles.benef}>
                                            <div>
                                                <ImageNext className={styles.benef__illu} src={teamIllu} alt="Evitez le travail en double" />
                                            </div>
                                            <h3 className={styles.benef__title}>Travaillez en équipe</h3>
                                            <div className={styles.benef__desc}>
                                            Réduisez le temps passé à la collecte manuelle, l&apos;actualisation et au croisement de données.
                                            </div>
                                            
                                        </div>

                                        
                                        
                                    </div>


                                
                    </div>
                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pb-12v"> 
                    <div className="section">
                    <div className="fr-grid-row fr-grid-row--gutters">
                            <div className="fr-col-12">
                                <div className="block block--blue">
                                    <h2 className="blockTitle">Comment ça marche ?</h2>

                                    <div className="fr-grid-row fr-grid-row--gutters">
                                        <div className={`fr-col-12 fr-col-md-7 ${styles.howTo__descCol}`}>

                                        <ol className="blockList">
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

                                        <div className="blockLinkShell blockLinkShell--noGrow">
                                            <a className="fr-btn" href="/contact">Contactez nous</a>
                                        </div>

                                        </div>
                                        <div className={`fr-col-12 fr-col-md-5 ${styles.howTo__illuCol}`}>
                                            <ImageNext className={styles.serviceIllu} src={rapprochementIllu} alt="Attacher l'identifiant RNB à vos données bâtimentaires" />
                                        </div>
                                    </div>
                                </div>

                                  

                                </div>

                                <div className='fr-col-12 fr-col-md-5'>
                                <div className="block block--green block--fill">
                                <h2 className="blockTitle">Pourquoi gratuit ?</h2>
                                <p className="blockSubtitle">
                                    Nous avons créé des outils de rapprochement de base et souhaitons maintenant les confronter à une variété cas pour renforcer leur efficacité.
                                </p>
                                <p>
                                    Appliquer ces outils à vos cas d&apos;usage est le meilleur moyen de les faire évoluer.
                                </p>
                                </div>
                            </div>
                            <div className='fr-col-12 fr-col-md-7'>

                                <div className="block block--pink block--fill">
                                <h2 className="blockTitle">Self-service</h2>
                                <p className="blockSubtitle">
                                    Vous préférez croiser vos bases en utilisant directement nos outils ?
                                </p>
                                <p>Nos APIs vous permettent d&apos;obtenir l&apos;identifiant RNB de vos bâtiments à partir d&apos;une adresse, d&apos;un point ou d&apos;un polygone.</p>
                                <div className="blockLinkShell blockLinkShell--noGrow">
                                            <a className="fr-btn fr-btn--secondary" href="/doc">Consulter la documentation</a>
                                    </div>
                                </div>

                            </div>
                          
                            </div>    

                            </div>
                            <div className="section">
                            <div className={styles.homeCardsSection__titleblock}>
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
        
        </>
    )
}