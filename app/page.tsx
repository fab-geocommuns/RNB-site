
// Styles
import styles from './blocks.module.css'

// Components
import { Card } from "@codegouvfr/react-dsfr/Card"
import { Button } from "@codegouvfr/react-dsfr/Button"
import Image from 'next/image'

// Assets
import bannerPic from '@/public/images/homeBanner/bordeaux.jpg'
import rapprochementIllu from '@/public/images/rapprochement.png'
import apiIllu from '@/public/images/api.png'
import adsIllu from '@/public/images/ads.png'

export default function Home() {

    console.log('home illu')

    console.log(rapprochementIllu.src)
    
    return (
        <>
            <div className="fr-container fr-py-12v">

                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 ">
                        <div className={styles.banner}>
                            <div className={styles.banner__content}>
                                <h1 className={styles.banner__title}>Le Référentiel National des Bâtiments</h1>
                                <p className={styles.banner__subtitle}>Référencer l'intégralité des bâtiments du territoire français au sein de données et d'outils libres</p>
                                <a href="/carte" className='fr-btn'>Voir la carte des bâtiments</a>
                            </div> 
                        
                        <Image alt="" src={bannerPic} />
                        </div>
                    </div>
                    
                    <div className="fr-col-12 ">
                        <div className={`${styles.block} ${styles["block--yellow"]}`}>
                        <h3 className={styles.block__title}>48 millions de bâtiments localisés</h3>
                        <p className={styles.block__subtitle}>Cherchez une adresse ou un identifiant RNB</p>
                        <form action="/carte" method="get">
                            <div className="fr-input-group">
                                <input 
                                className='fr-input' 
                                type="text" 
                                name="q"
                                placeholder="un bâtiment : SBW3-HVPC-LHD8 ou une adresse : 42, rue des architectes, Nantes"
                                 />
                                </div>
                        </form>
                        </div>
                    </div>

                    

                </div>

                <div className={`${styles.homeTools} fr-grid-row fr-grid-row--gutters`}>
                    <div className="fr-col-12 ">
                    
                <h2 className={styles.homeTools__title}>Nos outils et services</h2>
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
                    desc="Utilisez vos outils d'instruction d'ADS pour alimenter le RNB. Soyez prévenus lorsque des bâtiments sont achevés sur votre territoire"
                    linkProps={{ href: "/ads" }}
                    title="Autorisations du droit des sols"
                    />

                    </div>
                </div>
                
                    </div>
                </div>
                
             


                


            </div>
        </>
    )
}