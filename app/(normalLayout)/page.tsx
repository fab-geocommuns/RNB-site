
// Styles
import styles from '@/styles/home.module.scss'

// Components
import { Card } from "@codegouvfr/react-dsfr/Card"
import { SearchBar} from "@codegouvfr/react-dsfr/SearchBar"
import ImageNext from 'next/image'
import CasListe from '@/components/CasListe'

// Banner
import bannerPic from '@/public/images/homeBanner/bordeaux.jpg'
import bannerPicSm from '@/public/images/homeBanner/bordeaux-sm.jpg'
import arrowPic from '@/public/images/homeBanner/arrow.svg'

// Logos
import logoAdeme from '@/public/images/logos/ademe.svg'
import logoCstb from '@/public/images/logos/cstb.png'
import logoIgn from '@/public/images/logos/ign.png'
import logoDgaln from '@/public/images/logos/dgaln.png'

// Other illustrations
import rapprochementIllu from '@/public/images/rapprochement.png'
import apiIllu from '@/public/images/api.png'
import adsIllu from '@/public/images/ads.png'

export default function Home() {
    
    return (
        <>
            <div className="fr-container fr-py-12v">

            <div className="section">
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 ">
                        <div className={styles.banner}>
                            <div className={styles.banner__content}>
                                <h1 className={styles.banner__title}>Le Référentiel National des Bâtiments</h1>
                                <p className={styles.banner__subtitle}>Référencer l&apos;intégralité des bâtiments du territoire français au sein de données et d&apos;outils libres</p>
                                <a href="/carte" className='fr-btn'>Voir la carte des bâtiments</a>
                            </div> 
                            
                            <ImageNext src={arrowPic} alt="" className={styles.banner__arrow} />
                            <a href="/carte?q=7NF2-9LDK-T3H7" className={styles.banner__rnb_id}>7NF2-9LDK-T3H7</a>

                            <ImageNext className='none md-block'  alt="" src={bannerPic} />
                            <ImageNext className='md-none resp-image' alt="" src={bannerPicSm} />

                            
                        </div>
                    </div>  
                </div>
            </div>

            <div className="section">
                <div className='fr-grid-row fr-grid-row--gutters'>
                <div className="fr-col-12 ">
                        <div className={`${styles.block} ${styles["block--paleBlue"]}`}>
                        <h3 className={styles.block__title}>Carte des bâtiments</h3>
                        <p className={styles.block__subtitle}>Cherchez une adresse ou un identifiant RNB et consultez les 48 millions de bâtiments référencés.</p>
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
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className={`${styles.homeCardsSection} fr-grid-row fr-grid-row--gutters`}>
                    <div className="fr-col-12 ">

                <div className={styles.homeCardsSection__titleblock}>
                <h2 className={styles.homeCardsSection__title}>Outils et services</h2>
                <p className={styles.homeCardsSection__subtitle}>Consulter, intégrer et alimenter le référentiel</p>
                </div>    
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-4 ">
                    <Card
                    imageUrl={rapprochementIllu.src}
                    desc="Obtenez les identifiants RNB d'un bâtiment à partir de son adresse ou de sa localisation."
                    linkProps={{ href: "/doc" }}
                    title="Rapprochement de bases bâtimentaires"
                    />
                    </div>
                    <div className="fr-col-12 fr-col-md-4 ">

                    <Card
                    imageUrl={apiIllu.src}
                    desc="Intégrez les données du RNB à vos applications métier et SIG."
                    linkProps={{ href: "/doc" }}
                    title="API et documentation"
                    />
                    </div>

                    <div className="fr-col-12 fr-col-md-4 ">
                    <Card
                    imageUrl={adsIllu.src}
                    desc="Utilisez vos outils d'instruction d'ADS pour alimenter le RNB. Soyez prévenus lorsque des bâtiments sont achevés sur votre territoire."
                    linkProps={{ href: "/ads" }}
                    title="Autorisations du droit des sols"
                    />

                    </div>
                </div>
                
                    </div>
                </div>
            </div>
            <div className="section">
                <div className={`${styles.homeCardsSection} fr-grid-row fr-grid-row--gutters`}>
                    
                <div className="fr-col-12 ">
                <div className={styles.homeCardsSection__titleblock}>
                    <h2 className={styles.homeCardsSection__title}>Cas d&apos;usage</h2>
                    <p className={styles.homeCardsSection__subtitle}>Exemples d&apos;utilisation du RNB</p>

                </div>

                <CasListe />
                </div>
                </div>

            </div>
            
            
            

            <div className="section">
                <div className={`${styles.homeCardsSection} fr-grid-row fr-grid-row--gutters`}>
                    <div className="fr-col-12 ">
                        <div className={`${styles.block} ${styles["block--paleGreen"]}`}>
                        <h3 className={styles.block__title}>Définition du bâtiment</h3>
                        <p className={styles.bdgDefinition}>
                        Construction souterraine et/ou au-dessus du sol, ayant pour objectif d&apos;être permanente, pour abriter des humains ou des activités humaines. Un bâtiment possède a minima un accès depuis l’extérieur. Dans la mesure du possible, un bâtiment est distinct d’un autre dès lors qu’il est impossible de circuler entre eux.
                        </p>
                        <p className={styles.bdgDefinitionContext}>
                        La construction du RNB est réalisée en collaboration avec les experts de la donnée géomatique du Conseil National de l’Information Géolocalisée (CNIG). La définition du bâtiment ci-dessus est le standard validé par la Commission des Standards du CNIG.
                        </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="section">
                <div className={`${styles.homeCardsSection} fr-grid-row fr-grid-row--gutters`}>
                    <div className="fr-col-12 ">
                        <h6 className='text-center md-text-left'>Les financeurs et soutiens du RNB</h6>
                        <div className={`fr-grid-row fr-grid-row--gutters ${styles.sponsorGrid}`}>
                        
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={styles.sponsorBlock__logo} src={logoIgn} alt="Institut national de l’information géographique et forestière" />
                            </div>
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={styles.sponsorBlock__logo} src={logoCstb} alt="Centre scientifique et technique du bâtiment" />
                            </div>
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={styles.sponsorBlock__logo} src={logoAdeme} alt="Agence de la transition écologique" />
                            </div>
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={`resp-image ${styles.sponsorBlock__logo} ${styles["sponsorBlock__logo--dgaln"]}`} src={logoDgaln} alt="Direction générale de l’aménagement, du logement et de la nature" />
                            </div>
                            
                            
                            
                        </div>
                    </div>
                </div>
            </div>

                
             
            </div>
        </>
    )
}