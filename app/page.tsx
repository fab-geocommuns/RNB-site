import Highlight, { Card } from "@codegouvfr/react-dsfr/Card"

export default function Home() {

    
    return (
        <>
            <div className="fr-container fr-py-12v">

                <div className="fr-grid-row fr-grid-row--gutters">
                    <div className="fr-col-12 fr-col-md-4 ">
<Card
    desc="Consultez les données du référentiel sur la carte. Accédez aux identifiants RNB de chaque bâtiment."
    linkProps={{ href: "/carte" }}
    title="Carte des bâtiments"

/>
                    </div>

                    <div className="fr-col-12 fr-col-md-4 ">
<Card
    desc="Consultez la définition retenue d'un bâtiment."
    linkProps={{ href: "/definition" }}
    title="Définition du bâtiment"

/>
                    </div>

                </div>


                


            </div>
        </>
    )
}