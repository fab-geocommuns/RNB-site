// Comps
import AboutCol from "@/components/AboutCol"
import { Highlight } from "@codegouvfr/react-dsfr/Highlight";






export default function Page() {
    return (
      <div className="fr-container">
        
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-12 fr-col-md-8">
            
            <h1 className="text-blue">A propos du Référentiel National des Bâtiments</h1>

            <h2>Le problème que nous tentons de résoudre</h2>

            <Highlight>
            “Du fait d&apos;un écosystème atomisé, la production de l&apos;information géolocalisée dans la sphère publique se traduit par un usage sous-optimal des deniers publics.” Rapport d&apos;Information, Sénat, Commission des Finances pour l&apos;IGN, 5 Octobre 2022
            </Highlight>

            <p>Parmi ces données géolocalisées, l&apos;information relative au bâtiment se démarque par l&apos;absence de référentiel. Le concept de bâtiment ne faisant pas consensus, les acteurs travaillent en silos répondant chacun à leur propre vision du bâtiment…</p>
            <p>Cette absence se traduit par des informations rattachées à l&apos;adresse, au logement ou parfois à la parcelle cadastrale. L&apos;objet bâtiment apparaît alors comme le maillon manquant au socle de données géolocalisées structuré qui relie les concepts d&apos;adresses/bâtiment/locaux (parcelles).</p>
            <p>Ainsi, les données géolocalisées actuelles ne permettent pas un pilotage satisfaisant des politiques publiques, en particulier celles qui concernent la rénovation énergétique, qui nécessitent une vision exhaustive, représentative, actualisée et partagée du parc.</p>


            <h2>Notre solution : Un référentiel national des bâtiments</h2>

            <p>La création d&apos;un référentiel unique des bâtiments, en lien avec les autres référentiels (adresses, locaux, parcelles) existants est nécessaire pour passer d&apos;un “écosystème atomisé” à un fonctionnement en réseau.</p>

<p>C&apos;est dans ce contexte qu&apos;a vu le jour le projet de construction du Référentiel National des Bâtiments (RNB) appelé “Bat-ID”, d&apos;abord au sein du programme EIG en 2021, sous l&apos;impulsion de l&apos;ADEME et du CSTB. Ces sponsors historiques ont ensuit été rejoints par l&apos;IGN et la DGALN en 2023, lors de l&apos;évolution du projet en Start-Up d&apos;État désormais incubée à la Fabrique des Géocommuns de l&apos;IGN.</p>

<p>L&apos;objectif est de co-construire le RNB avec l&apos;ensemble des parties prenantes, à destination des acteurs publics comme privés. Ce référentiel sera alimenté par les processus administratifs existants afin d&apos;aboutir à une mise à jour en continue des bases de données socles.</p>

            

            

            <h2>Comment co-construire un Référentiel National des Bâtiments ?</h2>

            <p>La stratégie du RNB repose sur deux approches complémentaires :</p>
            <ul>
            <li>D&apos;une part, expérimenter au maximum afin d&apos;embarquer les acteurs, démontrer les usages, en créant les boucles de rétroaction de l&apos;alimentation du référentiel.</li>
            <li>De l&apos;autre, co-construire une gouvernance commune aux parties prenantes, afin de susciter l&apos;adhésion et créer le cadre favorable à la vie du référentiel.</li>
            </ul>

            <p>L&apos;approche expérimentale permet de cerner précisément les besoins et points de friction à l&apos;émergence du projet, grâce à une vision terrain et à la mise en œuvre technique. La démarche de co-construction, permet de fédérer les acteurs pour rendre possible l&apos;interopérabilité à l&apos;échelle nationale en permettant le partage et l&apos;échange de données.</p>
            <p>L&apos;objectif à terme : aboutir à un modèle de gouvernance pérenne, pour faire de cette future donnée de référence un véritable géo-commun.</p>
            <p>Vous avez une idée ? Une question ? Vous souhaitez contribuer au projet ou devenir un de nos partenaires ?</p>
            <p>N&apos;hésitez pas à nous écrire à <a href="mailto:rnb@beta.gouv.fr">rnb@beta.gouv.fr</a></p>

            <hr />

            <h2>La démarche start-up d&apos;État</h2>
            <p>Depuis juin 2013, l&apos;État a expérimenté une nouvelle manière de construire des services publics numériques. Cette expérience a commencé au sein du Secrétariat Général pour la Modernisation de l&apos;Action Publique (SGMAP) par la refonte du site data.gouv.fr et s&apos;est généralisée avec la création en septembre 2015 d&apos;une structure dédiée : l&apos;Incubateur de Services Numériques beta.gouv.fr. Cette mission a été confiée à la Direction interministérielle du numérique et du système d&apos;information et de communication de l&apos;État (DINSIC).</p>
            <p>Les changements de société et les évolutions technologiques imposent de repenser l&apos;interaction entre l&apos;administration et les citoyens. De nouvelles opportunités s&apos;ouvrent pour rendre un service gratuit, direct et innovant aux usagers. C&apos;est la volonté des start-up d&apos;État qui, sans capital privé et sans volonté lucrative, agissent dans la simplicité et avec un esprit neuf pour développer des solutions à vos problèmes quotidiens. Pour s&apos;assurer de ne pas tomber dans les travers de la bureaucratie, les projets se développent loin de toute contrainte. Une Startup d&apos;État c&apos;est donc une équipe allant de 2 à 8 personnes totalement autonomes qui travaillent pour votre service : tout simplement !</p>

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