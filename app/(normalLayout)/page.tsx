// Styles
import styles from '@/styles/home.module.scss'

// Components
import { Card } from "@codegouvfr/react-dsfr/Card"
import ImageNext from 'next/image'
import CasListe from '@/components/CasListe'
import NewsletterForm from '@/components/NewsletterForm'
import AddressSearchHome from '@/components/AddressSearchHome'


// Banner
import bannerPic from '@/public/images/homeBanner/bordeaux.jpg'
import bannerPicMid from '@/public/images/homeBanner/bordeaux-mid.jpg'
import bannerPicSm from '@/public/images/homeBanner/bordeaux-sm.jpg'
import arrowPic from '@/public/images/homeBanner/arrow.svg'

// Logos
import logoAdeme from '@/public/images/logos/ademe.svg'
import logoCstb from '@/public/images/logos/cstb-bdnb.png'
import logoIgn from '@/public/images/logos/ign.png'
import logoDgaln from '@/public/images/logos/dgaln.png'
import logoFnv from '@/public/images/logos/france-nation-verte.jpg'
import logoDinum from '@/public/images/logos/dinum.png'

// Other illustrations
import rapprochementIllu from '@/public/images/rapprochement.png'
import apiIllu from '@/public/images/api.png'
import adsIllu from '@/public/images/ads.png'

// Ghost CMS
import { getBreakingNews } from '@/utils/blog'

// Utils
import { getDatabasesCount, getFeaturedDatabases } from '@/utils/databases'
import HomeDBList from '@/components/homeDBList'


export const revalidate = 10


export default async function Home() {

    const bannerId = "M11Z4KK9Y338";
    const breakingNews = await getBreakingNews();
    const dbs = await getFeaturedDatabases();
    const dbsCount = await getDatabasesCount();
    
    return (
        <>
            <div className="fr-container fr-pt-12v">

            <div className="section">
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 ">
                        <div className={`${styles.banner} ${styles["banner--default"]}`}>
                            <div className={styles.banner__content}>
                                <h1 className={styles.banner__title}>Le Référentiel National des Bâtiments</h1>
                                <p className={styles.banner__subtitle}>Référencer l&apos;intégralité des bâtiments du territoire français au sein de données et d&apos;outils libres</p>
                                <a href="/carte" className='fr-btn'>Voir la carte des bâtiments</a>
                            </div> 
                            
                            <div className={styles.banner__arrowtarget}>
                                <ImageNext src={arrowPic} alt="" className={styles.banner__arrow} />
                                <a href={`carte?q=${bannerId}`} className={styles.banner__rnb_id}>{bannerId}</a>
                            </div>

                            
                            <ImageNext className={`sm-none resp-image ${styles.banner__image}`} alt="" src={bannerPicSm} />
                            <ImageNext className={`none sm-block lg-none resp-image ${styles.banner__image}`}  alt="" src={bannerPicMid} />
                            <ImageNext className={`none lg-block ${styles.banner__image}`}  alt="" src={bannerPic} />
                            
                            

                            
                        </div>
                    </div>  
                </div>

                

            </div>

            {breakingNews.featured && <>
                
                <div className='fr-grid-row'>
                    <div className='fr-col-12 fr-col-md-8 fr-col-offset-md-2'>
                    <div dangerouslySetInnerHTML={{__html: breakingNews.html}}></div>
                    </div>
                </div>
                </>}

            <div className="section">
                <div className='fr-grid-row fr-grid-row--gutters'>
                <div className="fr-col-12 fr-col-md-7">
                        <div className="block block--blue">
                        <h3 className="block__title">Carte des bâtiments</h3>
                        <p className="block__subtitle">Cherchez une adresse ou un identifiant RNB et consultez les 48 millions de bâtiments référencés.</p>
                                <AddressSearchHome />
                        </div>
                    </div>

                    <div className="fr-col-12 fr-col-md-5">
                    <div className="block block--paleBlue">
                        <h3 className="block__title">Actualités</h3>
                        <p>Restez informé des <a href="/blog">actualités</a> du RNB en vous inscrivant à l&apos;infolettre ou en nous suivant sur <a href="https://www.linkedin.com/company/r-f-rentiel-national-des-b-timents/">LinkedIn</a>.</p>
                        <NewsletterForm />
                        </div>
                    </div>    
                </div>
            </div>
        

            
            <div className="section section__big ">
                <div className={styles.dbsShell}>
                <div className="section__titleblock">
                    <h2 className="section__title">Enrichissez vos bases de données bâtimentaires</h2>
                    <p className="section__subtitle">Les identifiants de bâtiments RNB servent de pivot entre des données jusqu'à présent isolées</p>
                </div>
                    <HomeDBList dbs={dbs} dbsCount={dbsCount} />
                </div>
                </div>


            <div className="section">
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 ">

                <div className="section__titleblock">
                <h2 className="section__title">Outils et services</h2>
                <p className="section__subtitle">Consultez, intégrez et alimentez le référentiel</p>
                </div>    
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-4 ">
                    <Card
                    imageUrl={rapprochementIllu.src}
                    desc="Obtenez les identifiants RNB d'un bâtiment et croisez des données jusqu&apos;à présent isolées."
                    linkProps={{ href: "/outils-services/rapprochement" }}
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
                    linkProps={{ href: "/outils-services/autorisation-droit-sols" }}
                    title="Autorisations du droit des sols"
                    />

                    </div>
                </div>
                
                    </div>
                </div>
            </div>
            <div className="section">
                <div className="fr-grid-row fr-grid-row--gutters">
                    
                <div className="fr-col-12 ">
                <div className="section__titleblock">
                    <h2 className="section__title">Cas d&apos;usage</h2>
                    <p className="section__subtitle">Exemples d&apos;utilisation du RNB</p>

                </div>

                <CasListe />
                </div>
                </div>

            </div>

            <div className="section">
                <div className='fr-grid-row fr-grid-row--gutters'>
                    <div className='fr-col-12'>
                        
                        <div className='block block--yellow block--fill'>
                            <h2 className='blockTitle'>D&apos;où proviennent les données du RNB ?</h2>
                            <p>Les bâtiments présentés dans le RNB sont essentiellement issus d&apos;une fusion de la BDNB, éditée par le Centre Scientifique et Technique du Bâtiment (CSTB) et de la BD Topo, éditée par l&apos;Institut national de l&apos;information géographique et forestière (IGN).</p>
                            <div className="blockLinkShell"><a href="/faq" className='fr-btn fr-btn--secondary'>Consulter la Foire aux Questions</a></div>
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
                                <ImageNext className={`${styles.sponsorBlock__logo} ${styles.sponsorBlock__logoAdeme}`} src={logoAdeme} alt="Agence de la transition écologique" />
                            </div>
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={`resp-image ${styles.sponsorBlock__logo} ${styles["sponsorBlock__logo--dgaln"]}`} src={logoDgaln} alt="Direction générale de l’aménagement, du logement et de la nature" />
                            
                            </div>
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={styles.sponsorBlock__logo} src={logoFnv} alt="France Nation Verte" />
                            </div>
                            <div className="fr-col-md-3 fr-col-6 text-center">
                                <ImageNext className={styles.sponsorBlock__logo} src={logoDinum} alt="Direction interministérielle du numérique" />
                            </div>

                            
                            
                        </div>
                    </div>
                
            </div>
</div>
                
             
            </div>
        </>
    )
}
