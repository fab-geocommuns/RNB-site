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
            “Du fait d’un écosystème atomisé, la production de l’information géolocalisée dans la sphère publique se traduit par un usage sous-optimal des deniers publics.” Rapport d’Information, Sénat, Commission des Finances pour l’IGN, 5 Octobre 2022
            </Highlight>

            <p>Parmi ces données géolocalisées, l’information relative au bâtiment se démarque par l’absence de référentiel. Le concept de bâtiment ne faisant pas consensus, les acteurs travaillent en silos répondant chacun à leur propre vision du bâtiment…</p>
            <p>Cette absence se traduit par des informations rattachées à l’adresse, au logement ou parfois à la parcelle cadastrale. L’objet bâtiment apparaît alors comme le maillon manquant au socle de données géolocalisées structuré qui relie les concepts d’adresses/bâtiment/locaux (parcelles).</p>
            <p>Ainsi, les données géolocalisées actuelles ne permettent pas un pilotage satisfaisant des politiques publiques, en particulier celles qui concernent la rénovation énergétique, qui nécessitent une vision exhaustive, représentative, actualisée et partagée du parc.</p>


            <h2>Notre solution : Un référentiel national des bâtiments</h2>

            <p>La création d’un référentiel unique des bâtiments, en lien avec les autres référentiels (adresses, locaux, parcelles) existants est nécessaire pour passer d’un “écosystème atomisé” à un fonctionnement en réseau.</p>
            <p>C’est dans ce contexte qu’a vu le jour le projet de construction du Référentiel National des Bâtiments (RNB) appelé “Bat-ID”, d’abord au sein du programme EIG puis en tant que Start Up d’État. L’objectif est de co-construire le RNB avec l’ensemble des parties prenantes, à destination des acteurs publics comme privés. Ce référentiel sera alimenté par les processus administratifs existants afin d’aboutir à une mise à jour en continue des bases de données socles.</p>

            <h2>Comment co-construire un Référentiel National des Bâtiments ?</h2>

            <p>La stratégie du RNB repose sur deux approches complémentaires :</p>
            <ul>
            <li>D’une part, expérimenter au maximum afin d’embarquer les acteurs, démontrer les usages, en créant les boucles de rétroaction de l’alimentation du référentiel.</li>
            <li>De l’autre, co-construire une gouvernance commune aux parties prenantes, afin de susciter l’adhésion et créer le cadre favorable à la vie du référentiel.</li>
            </ul>

            <p>L’approche expérimentale permet de cerner précisément les besoins et points de friction à l’émergence du projet, grâce à une vision terrain et à la mise en œuvre technique. La démarche de co-construction, permet de fédérer les acteurs pour rendre possible l’interopérabilité à l’échelle nationale en permettant le partage et l’échange de données.</p>
            <p>L’objectif à terme : aboutir à un modèle de gouvernance pérenne, pour faire de cette future donnée de référence un véritable géo-commun.</p>
            <p>Vous avez une idée ? Une question ? Vous souhaitez contribuer au projet ou devenir un de nos partenaires ?</p>
            <p>N’hésitez pas à nous écrire à <a href="mailto:rnb@beta.gouv.fr">rnb@beta.gouv.fr</a></p>

            <hr />

            <h2>La démarche start-up d’État</h2>
            <p>Depuis juin 2013, l’État a expérimenté une nouvelle manière de construire des services publics numériques. Cette expérience a commencé au sein du Secrétariat Général pour la Modernisation de l’Action Publique (SGMAP) par la refonte du site data.gouv.fr et s’est généralisée avec la création en septembre 2015 d’une structure dédiée : l’Incubateur de Services Numériques beta.gouv.fr. Cette mission a été confiée à la Direction interministérielle du numérique et du système d'information et de communication de l'État (DINSIC).</p>
            <p>Les changements de société et les évolutions technologiques imposent de repenser l’interaction entre l’administration et les citoyens. De nouvelles opportunités s’ouvrent pour rendre un service gratuit, direct et innovant aux usagers. C’est la volonté des start-up d’État qui, sans capital privé et sans volonté lucrative, agissent dans la simplicité et avec un esprit neuf pour développer des solutions à vos problèmes quotidiens. Pour s'assurer de ne pas tomber dans les travers de la bureaucratie, les projets se développent loin de toute contrainte. Une Startup d’État c’est donc une équipe allant de 2 à 8 personnes totalement autonomes qui travaillent pour votre service : tout simplement !</p>

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