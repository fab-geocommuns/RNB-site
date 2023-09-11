// Comps
import { Tile } from "@codegouvfr/react-dsfr/Tile";

// Logos
import toolsIllu from '@/public/images/tools-illu.svg'
import defIllu from '@/public/images/definition-illu.svg'
import casIllu from '@/public/images/cas-illu.svg'

export default function CasLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="fr-container">
        
        <div className="fr-grid-row fr-grid-row--gutters fr-py-12v">
          <div className="fr-col-12 fr-col-md-8">
            {children}
          </div>
          <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1">
            <div>

             
            <Tile
            desc="Nous mettons à disposition des outils gratuits pour consulter le référentiel et l&apos;intégrer à vos outils et systèmes."
            imageUrl={toolsIllu.src}
            title="Utiliser le RNB"
            linkProps={{
              href: '/outils-services'
            }}
            className="fr-mb-12v"
            />

            <Tile
            
            imageUrl={casIllu.src}
            title="Voir tous les cas"
            linkProps={{
              href: '/cas'
            }}
            className="fr-mb-12v"
            />

            <Tile
            
            
            imageUrl={defIllu.src}
            title="Définition du bâtiment"
            linkProps={{
              href: '/definition'
            }}
            className="fr-mb-12v"
            />
            </div>


          </div>
        </div>
   
        
      </div>
    )
  }