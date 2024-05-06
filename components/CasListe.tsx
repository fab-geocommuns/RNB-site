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
                        endDetail="Lire la suite"
                            desc="La possibilité d’indiquer dans chaque DPE l’identifiant unique du bâtiment dans lequel le local se situe permettra ainsi d’améliorer la fiabilité des bases de données de l’observatoire des DPE ..."
                            linkProps={{ href: "/cas/dpe" }}
                            title="Fiabiliser les Diagnostics de Performance Énergétique (DPE)"
                        />
                        </div>
                        <div className="fr-col-12 fr-col-md-4 ">
    
                        <Card
                        endDetail="Lire la suite"
                        desc="L’existence du RNB doit permettre à toutes les communes d’assurer la cohérence du système d’information et la transversalité des données de la collectivité entre les différents services ..."
                        linkProps={{ href: "/cas/communes" }}
                        title="Faciliter les échanges d’informations bâtimentaires au sein des communes"
                        />
                        </div>
    
                        <div className="fr-col-12 fr-col-md-4 ">
                        <Card
                        endDetail="Lire la suite"
                        desc="La saisie d’un ID bâtiment lors du processus de référencement des ERP doit permettre de préciser leur géolocalisation, de faciliter et fiabiliser le processus de recensement et, d’aider le suivi des ERP."
                        linkProps={{ href: "/cas/erp" }}
                        title="Améliorer l’identification des Etablissements Recevant du Public (ERP)"
                        />
    
                        </div>
                    </div>
                    
                        
        </>
        )

}