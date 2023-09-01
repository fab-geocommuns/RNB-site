import Link from "next/link"


export default function Page() {

    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                    <div className="fr-col-12 fr-col-md-8 fr-py-12v">
                    <h1>Définition du bâtiment</h1>
                    <p>Construction souterraine et/ou au-dessus du sol, ayant pour objectif d&apos;être permanente, pour abriter des humains ou des activités humaines.</p>
                    <p>Un bâtiment possède a minima un accès depuis l’extérieur. Dans la mesure du possible, un bâtiment est distinct d’un autre dès lors qu’il est impossible de circuler entre eux.</p>
                    <p>Cette définition est complétée par une <Link href="https://github.com/fab-geocommuns/BatID/blob/eea3555c0de8fb178a85379306fbe85c358ea9ce/docs/CNIG/Annexe-Definition-Batiment.md">annexe</Link>, qui vise à l’étayer et apporter un éclairage aux cas particuliers rencontrés.</p>
                    </div>
                </div>
            </div>
        </>
    )
}