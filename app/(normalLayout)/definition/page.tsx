import Link from "next/link"

// Style
import styles from '@/styles/definition.module.scss'


export default function Page() {

    
    return (
        <>
            <div className="fr-container">

                <div className="fr-grid-row">
                        <div className="fr-col-12 fr-py-12v">

                            <h1>Définition du bâtiment</h1>

                            <div className="fr-grid-row fr-grid-row--gutters">
                                <div className="fr-col-12 fr-col-md-8">
                        
                                    <div className="block block--paleGreen block--fill">
                                        <p className={styles.bdgDefinition}>
                                        Construction souterraine et/ou au-dessus du sol, ayant pour objectif d&apos;être permanente, pour abriter des humains ou des activités humaines. Un bâtiment possède a minima un accès depuis l’extérieur. Dans la mesure du possible, un bâtiment est distinct d’un autre dès lors qu’il est impossible de circuler entre eux.
                                        </p>
                                        <div className={styles.bdgDefinitionContext}>
                                            Cette définition est complétée par une <Link href="https://github.com/fab-geocommuns/BatID/blob/eea3555c0de8fb178a85379306fbe85c358ea9ce/docs/CNIG/Annexe-Definition-Batiment.md">annexe</Link>, qui vise à l’étayer et apporter un éclairage aux cas particuliers rencontrés.
                                        </div>
                                    </div>

                                
                                
                    </div>
                    <div className="fr-col-12 fr-col-md-4">

                    <div className="block block--yellow block--fill">
                        <p>
                            La construction du RNB est réalisée en collaboration avec les experts de la donnée géomatique du Conseil National de l’Information Géolocalisée (CNIG). La définition du bâtiment ci-dessus est le standard validé par la Commission des Standards du CNIG.
                        </p>
                        </div>

                    </div>
                </div>

                            
                        </div>
                </div>

                
            </div>
        </>
    )
}