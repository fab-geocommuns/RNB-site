// Utils
import path from 'path';
import { parse } from 'yaml'
import { promises as fs } from 'fs';

// Comps
import DBCard from '@/components/DBCard'
import ImageNext from 'next/image'
import { Card } from "@codegouvfr/react-dsfr/Card"

// Settings
import settings from '@/logic/settings'

// Styles
import styles from '@/styles/richerDatabases.module.scss'

// Images
import pivotIllu from '@/public/images/pivot-sentence.png'
import mountainPhoto from '@/public/images/bdgs-mountains.jpg'
import metalBdgPhoto from '@/public/images/metal-bdg.jpg'
import bdgRiverPhoto from '@/public/images/bdg-river.jpg'


async function fetchDBs() {
    // Read json file in the data folder
    const jsonDirectory = path.join(process.cwd(), 'data');
    //Read the json data file data.json
    const fileContents = await fs.readFile(jsonDirectory + '/databases.yaml', 'utf8');
    //Return the content of the data file in json format
    const data = parse(fileContents);

    return data
}

export default async function Page() {

    const dbs = await fetchDBs();

    return (
        <>
        
        <div className="fr-container">

            <div className='section section__big'>
                <div className="fr-grid-row ">
                    <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2 fr-pt-12v">
                        <h1>Enrichissez vos bases de données bâtimentaires</h1>
                        <p className='fr-text--lead'>Un petit texte d’intro de motivation qui aborde rapidement le quoi et le comment. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam diam  eros, imperdiet sed eleifend a, tempus eu dui.</p>
                    </div>
                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pt-12v">
                        <div className="block block--yellow">
                            <h2 className="blockTitle">Comment faire ?</h2>            
                            <ol>
                                <li><a href="#liste">Identifiez les bases</a> contenant les informations qui vous intéressent.</li>
                                <li>Obtenez les identifiants RNB de vos bâtiments grâce à nos <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments">outils en self-service</a> ou notre service de rapprochement</li>
                                <li>Croisez les bases en utilisant les identifiants RNB comme pivot</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>

            <div className='section'>
                <div className="fr-grid-row ">
                    <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">

                        <div className="section__titleblock">
                            <h2 id='liste' className='section__title'>Les bases contenant des identifiants RNB</h2>
                            <p className="section__subtitle">Performance énergétique, insalubrité, équipements sportifs, copropriétés, ...</p>
                        </div>
                            
                        {dbs.map((db: any) => {
                            return (
                                <DBCard key={db.key} db={db} />
                            )
                        })}

                        <p>
                            Votre base contient des identifiants RNB et vous souhaitez en faire la promotion sur cette page ?<br />
                            Ecrivez-nous à <a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a> ou <a href="https://github.com/fab-geocommuns/RNB-site/blob/main/data/databases.yaml" target='_blank'>proposez une modification</a> du site.
                        </p>

                    </div>
                </div>
            </div>

            <div className='section section__big'>

                <div className="fr-grid-row ">
                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1">

                        <div className={styles.pivotBlock}>          
                            <h3 className={styles.pivotBlockTitle}>Les identifiants de bâtiments RNB servent de pivot entre des données jusqu'à présent isolées.</h3>
                            <div className={styles.pivotBlockSentence}>
                                <ImageNext src={pivotIllu} alt='Illustration d’un pivot' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='section section__big'>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1">

                        <div className="section__titleblock">
                            <h2 id='liste' className='section__title'>Comment obtenir les identifiants RNB de vos bâtiments ?</h2>
                            <p className="section__subtitle">Utilisez directement nos outils ou demandez nous de l'aide</p>
                        </div>
                        

                    </div>
                    <div className='fr-col-12 fr-col-md-4'>
                        <Card
                        imageUrl={metalBdgPhoto.src}
                        desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam diam  eros, imperdiet sed eleifend a, tempus eu dui."
                        linkProps={{ href: "https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/identification-de-batiment" }}
                        title="Utilisez notre API d'identification de bâtiments"
                        />
                    </div>
                    <div className='fr-col-12 fr-col-md-4'>
                        <Card
                        imageUrl={mountainPhoto.src}
                        desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam diam  eros, imperdiet sed eleifend a, tempus eu dui."
                        linkProps={{ href: "https://rnb-fr.gitbook.io/documentation/exemples/selecteur-de-batiments" }}

                        title="Intégrez un sélecteur de bâtiments à vos outils"
                        />
                    </div>
                    <div className='fr-col-12 fr-col-md-4'>
                        <Card
                        imageUrl={bdgRiverPhoto.src}
                        desc="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam diam  eros, imperdiet sed eleifend a, tempus eu dui."
                        linkProps={{ href: "/contact" }}

                        title="Faites appel à nos services"
                        />
                    </div>
                    
                </div>
            </div>

            <div className='section section__big fr-pb-16v'>
                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">
                    <div className="block block--blue">
                            <h2 className="blockTitle">Pour aller plus loin</h2>            
                            <ul>
                                <li><a href="#liste">Identifiez les bases</a> contenant les informations qui vous intéressent.</li>
                                <li>Obtenez les identifiants RNB de vos bâtiments grâce à nos <a href="https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments">outils en self-service</a> ou notre service de rapprochement</li>
                                <li>Croisez les bases en utilisant les identifiants RNB comme pivot</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

        
        </div>
        
        </>
    )
}