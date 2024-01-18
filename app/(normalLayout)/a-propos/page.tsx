// Comps
import AboutCol from "@/components/AboutCol"

// Settings
import settings from '@/logic/settings'





export default function Page() {
  
    const contactEmail = settings.contactEmail;

    return (
      <div className="fr-container">
        
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-12 fr-col-md-8">
            
            <h1 className="text-blue">À propos du Référentiel National des Bâtiments</h1>

            <h2>Problématique : le cloisennement de l&apos;information bâtimentaire</h2>
            <p>Jusqu&apos;à présent, les données liées aux bâtiments sont détenues par une multitude d’acteurs, travaillant en silos. Les administrations, les collectivités et de nombreux acteurs privés (ex : fournisseurs d’énergie), œuvrent individuellement pour produire et obtenir l&pos;information sans que celle-ci soit mise en commun.</p>
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