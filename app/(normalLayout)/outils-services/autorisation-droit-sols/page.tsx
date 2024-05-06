// Styles
import styles from '@/styles/toolDetail.module.scss'

// Comps
import ImageNext from 'next/image'
import CasList from '@/components/CasListe'

// Images
import adsSchemeIllu from '@/public/images/ads-scheme.svg'
import updateIllu from '@/public/images/update.svg'
import cityIllu from '@/public/images/city.svg'
import sameSoftIllu from '@/public/images/same-software.svg'

// Settings
import settings from '@/logic/settings'


export default function Page() {

    const formUrl = settings.adsFormUrl;
    const contactEmail = settings.contactEmail;

    return (
        <>
        
        <div className="fr-container">
                <div className="fr-grid-row ">


                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pt-12v">
                        <h1>Autorisation du droit des sols</h1>
                            
                                <div className="block block--yellow">
                                    <h2 className="blockTitle">Soyez informés des fins de travaux sur votre territoire</h2>
                                    <p>Intégrez vos ADS au sein du RNB et recevez en retour les dates de fin de travaux issues des données de la DGFiP. Vous n&apos;avez pas reçu l&apos;ensemble des Déclarations attestant l&apos;achèvement et la conformité des travaux (DAACT) ? Ce service est fait pour vous.</p>
                                    <p><b><span className='stab stab--yellowStrong'>Ce service est gratuit et réservé aux collectivités.</span></b></p>
                                    
                                    <div className="blockLinkShell blockLinkShell--noGrow">
                                            <a className="fr-btn" target='_blank' href={`mailto:${contactEmail}`}>Demander un accès</a>
                                    </div>
                                </div>
                    </div>
                    <div className="fr-col-12">
                            

                            
                                
                                    
                                    
                                    <div className={styles.benefShell}>
                                        <div className={styles.benef}>
                                            <div>
                                                <ImageNext className={styles.benef__illu} src={updateIllu} alt="Soyez prévenu des fins de travaux sur votre territoire" />
                                            </div>
                                            <h3 className={styles.benef__title}>Soyez tous à jour</h3>
                                            <div className={styles.benef__desc}>
                                            Vous et les autres services intéressés êtes tenus au courant des fins de travaux sur votre territoire, grâce aux données établies par la DGFIP.
                                            </div>
                                            
                                        </div>


                                        <div className={styles.benef}>
                                            <div>
                                                <ImageNext className={styles.benef__illu} src={cityIllu} alt="Des visites de terrain plus efficace." />
                                            </div>
                                            <h3 className={styles.benef__title}>Affinez votre connaissance du terrain</h3>
                                            <div className={styles.benef__desc}>
                                            Obtenez une vision précise et à jour du parc bâtimentaire. Élaborez des politiques d&apos;aménagement du territoire plus ciblées.
                                            </div>
                                            
                                        </div>

                                        <div className={styles.benef}>
                                            <div>
                                                <ImageNext className={styles.benef__illu} src={sameSoftIllu} alt="Evitez le travail en double" />
                                            </div>
                                            <h3 className={styles.benef__title}>Gardez vos outils d&apos;instruction</h3>
                                            <div className={styles.benef__desc}>
                                            Les outils ADS du RNB sont compatibles avec les principaux logiciels du marché. Vous disposez également de <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-ads">l&apos;API RNB dédiée aux autorisations du droit des sols</a>.
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
                                                <b>Demandez des identifiants</b><br />
                                                Obtenez rapidement des identifiants en remplissant le <a href={formUrl}>formulaire dédié</a>.
                                            </li>
                                            <li>
                                                <b>Ajoutez vos ADS sur le Référentiel National du Bâtiment</b><br />
                                                Envoyez vos ADS au RNB via notre pont Cart@DS, notre API ou notre interface web. Ces ADS ne sont accessibles qu&apos;à vous et aux autres services de votre collectivité.
                                            </li>
                                            <li>
                                                <b>Mettez vos ADS à disposition de tous les services de votre commune</b><br />
                                                Une fois vos ADS ajoutées sur le RNB, l’ensemble de vos nouvelles informations bâtimentaires pourront ainsi être accessibles par tous les services de votre collectivité.
                                            </li>
                                            <li>
                                                <b>Recevez les données de la DGFiP sur les fins de travaux</b><br />
                                                Grâce à l&apos;ajout de vos ADS dans le référentiel, vous recevrez les dates de fin de travaux issues des données de la DGFiP.
                                            </li>
                                          
                                        </ol>

                                        <div className="blockLinkShell blockLinkShell--noGrow">
                                            <a className="fr-btn" href={formUrl}>Demander un accès</a>
                                        </div>

                                        </div>
                                        <div className={`fr-col-12 fr-col-md-5 ${styles.howTo__illuCol}`}>
                                            <ImageNext className={styles.serviceIllu} src={adsSchemeIllu} alt="Attacher l'identifiant RNB à vos données bâtimentaires" />
                                        </div>
                                    </div>
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