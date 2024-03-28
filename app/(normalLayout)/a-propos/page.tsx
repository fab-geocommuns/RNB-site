// Styles
import styles from '@/styles/about.module.scss'

// Comps
import AboutCol from "@/components/AboutCol"
import ImageNext from 'next/image'

// Settings
import settings from '@/logic/settings'

// Logos
import logoFnv from '@/public/images/logos/france-nation-verte.jpg'



export default function Page() {
  
    const contactEmail = settings.contactEmail;
    

    return (
      <div className="fr-container">
        
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-12 fr-col-md-8">
            
            <h1 className="text-blue">À propos du Référentiel National des Bâtiments</h1>

            <h2>Problématique : le cloisonnement de l&apos;information bâtimentaire</h2>
            <p>Jusqu&apos;à présent, les données liées aux bâtiments sont détenues par une multitude d’acteurs, travaillant en silos. Les administrations, les collectivités et de nombreux acteurs privés (ex : fournisseurs d’énergie), œuvrent individuellement pour produire et obtenir l&apos;information sans que celle-ci soit mise en commun.</p>
            <p>Cette absence de base de données nationale de référence sur le bâtiment engendre des ralentissements et des coûts importants dans la conduite d&apos;actions publiques et territoriales, pour répondre aux enjeux de la transition écologique ou du logement notamment.</p>

            <h2>Solution : le RNB, la plaque d&apos;immatriculation du bâtiment</h2>
            <p>Le Référentiel national des bâtiments (RNB) est un service public numérique, qui a pour vocation de créer une nouvelle donnée nationale de référence du bâtiment, inexistante jusqu&apos;ici et pourtant essentielle à la conduite de nombreuses politiques publiques. </p>
            <p>Pour cela, il répertorie l&apos;ensemble des bâtiments du territoire et leur associe un identifiant unique. Cette donnée pivot, composée d’une suite de 12 caractères alphanumériques, permet d’être facilement reproductible et transmissible par une personne ou un logiciel. </p>
            <p>Une fois apposée au bâtiment, cette véritable plaque d&apos;immatriculation du bâtiment permet de simplifier le suivi et le croisement de différents jeux de données bâtimentaires pour les administrations publiques, les collectivités et les acteurs privés.</p>

            <h2>Méthode : Co-construire ensemble ce nouveau géocommun</h2>
            <p>Le financement du RNB est assuré conjointement par l&apos;Agence de la Transition Écologique (<a href="https://www.ademe.fr/" target="_blank">ADEME</a>), le Centre Scientifique et Technique du Bâtiment (<a href="https://www.cstb.fr/fr/" target="_blank">CSTB</a>), la Direction générale de l&apos;Aménagement, du Logement et de la Nature (<a href="https://www.ecologie.gouv.fr/direction-generale-lamenagement-du-logement-et-nature-dgaln" target="_blank">DGALN</a>) et l&apos;Institut national de l&apos;information géographique et forestière (<a href="https://www.ign.fr/" target="_blank">IGN</a>).</p>
            <p>Le service est réalisé à la fabrique des géocommuns, l&apos;incubateur de l&apos;IGN, appliquant la méthode du programme <a href="https://beta.gouv.fr/" target="_blank">beta.gouv</a> de la Direction Interministérielle du Numérique (<a href="https://www.numerique.gouv.fr/dinum/" target="_blank">DINUM</a>).</p>
            <p>Les standards du RNB sont également réalisés en collaboration avec les experts de la donnée géomatique du Conseil National de l&apos;Information Géolocalisée (<a href="https://cnig.gouv.fr/gt-bati-a25939.html" target="_blank">CNIG</a>).</p>
            <p>Vous souhaitez contribuer ? Toutes les contributions sont les bienvenues pour construire ce géocommun, faciliter et réduire les coûts de maintenance et optimiser la qualité des données. Contactez nous sur <a href={contactEmail}>{contactEmail}</a></p>

            <div className="block block--paleGreen fr-mt-24v">

                    <div className="fr-grid-row fr-grid-row--gutters ">
                      <div className="fr-col-12 fr-col-md-3">
                        <ImageNext className={styles.fnvLogo} src={logoFnv} alt="France Nation Verte" />
                      </div>
                      <div className="fr-col-12 fr-col-md-9">
                        <p className="block__title"><strong>Le RNB prioritaire pour la feuille de route Numérique et Données de France Nation Verte</strong></p>
                        <p>L’année 2024 s’annonce importante pour le RNB sur le plan son déploiement et de sa diffusion au sein des “Systèmes d’information métiers et partenaires-clés (DPE, Autorisations Droits des Sols, SDIS, BD TOPO, etc).” Des jalons essentiels qui permettront, à terme, comme le précise les axes du groupe de travail “Mieux se Loger” de France Nation Verte de “consolider les analyses à la maille du logement et du bâtiment”.</p>
                        <p><small>Cf. <a href="https://anct-decidim-nfnv.s3.fr-par.scw.cloud/4ejxlm1frxhgrjthtuq555eo0dmb?response-content-disposition=inline%3B%20filename%3D%22FDR%20Nume%253Frique%20et%20Donne%253Fes%20-%20e%253Fle%253Fments%20the%253Fmatiques.pdf%22%3B%20filename%2A%3DUTF-8%27%27FDR%2520Nume%25CC%2581rique%2520et%2520Donne%25CC%2581es%2520-%2520e%25CC%2581le%25CC%2581ments%2520the%25CC%2581matiques.pdf&response-content-type=application%2Fpdf&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=SCWN21VRTY4W0AHS51FB%2F20240326%2Ffr-par%2Fs3%2Faws4_request&X-Amz-Date=20240326T144413Z&X-Amz-Expires=604800&X-Amz-SignedHeaders=host&X-Amz-Signature=5afa8dc51a196e35bacecc7f3be8b9c341a60621143a257483597b97908b11b2" target="_blankl">Cf. Feuille de route Numérique et Données pour la Planification écologique France Nation Verte</a> du 22 décembre 2023 - page 68</small></p>
                      </div>
                    </div>


                    
                    
                  
                </div>


          </div>
          <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
            <div>

            <AboutCol />

             
            
            </div>


          </div>
        </div>
   
        
      </div>
    )
  }
