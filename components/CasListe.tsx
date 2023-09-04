// Styles
import styles from '@/styles/home.module.scss'

// Components
import { Card } from "@codegouvfr/react-dsfr/Card"

export default function CasList() {

    return (
        <>
        
                    
                    
                    <div className="fr-grid-row fr-grid-row--gutters">
                        <div className="fr-col-12 fr-col-md-4 ">
                        <Card
                        
                            desc="Plus de 2.7 millions de DPE ont été réalisés en France en 2022. Hors, le local dont le DPE fait l’objet est uniquement relié à une adresse et non à un bâtiment géolocalisé."
                            linkProps={{ href: "/cas/dpe" }}
                            title="Fiabiliser les Diagnostics de Performance Énergétique (DPE)"
                        />
                        </div>
                        <div className="fr-col-12 fr-col-md-4 ">
    
                        <Card
                        
                        desc="Les gains en efficacité des procédures et les facilités qui en découlent laissent entrevoir un ROI global qui peut être estimé à plusieurs ETP au travers de toutes les directions” Toulouse Métropole - Direction du Numérique "
                        linkProps={{ href: "/cas/communes" }}
                        title="Faciliter les échanges d’informations bâtimentaires au sein des communes"
                        />
                        </div>
    
                        <div className="fr-col-12 fr-col-md-4 ">
                        <Card
                        
                        desc="La saisine d’un ID bâtiment lors du processus de référencement des ERP doit permettre de préciser leur géolocalisation, de faciliter et fiabiliser le processus de recensement et, d’aider le suivi des ERP."
                        linkProps={{ href: "/cas/erp" }}
                        title="Améliorer l’identification des Etablissements Recevant du Public (ERP)"
                        />
    
                        </div>
                    </div>
                    
                        
        </>
        )

}