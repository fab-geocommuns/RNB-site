import Link from "next/link";

// Style
import styles from "@/styles/definition.module.scss";

export default function Page() {
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-py-12v">
            <h1>Définition et standard</h1>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-8">
                <div className="block block--paleGreen block--fill">
                    <h3 className="block__title">Définition d&apos;un bâtiment</h3>
                  
                  <p className={styles.bdgDefinition}>
                    Construction souterraine et/ou au-dessus du sol, ayant pour
                    objectif d&apos;être permanente, pour abriter des humains ou
                    des activités humaines. Un bâtiment possède a minima un
                    accès depuis l’extérieur. Dans la mesure du possible, un
                    bâtiment est distinct d’un autre dès lors qu’il est
                    impossible de circuler entre eux.
                  </p>
                  <div className={styles.bdgDefinitionContext}>
                    Cette définition est complétée par une{" "}
                    <Link href="https://github.com/fab-geocommuns/BatID/blob/eea3555c0de8fb178a85379306fbe85c358ea9ce/docs/CNIG/Annexe-Definition-Batiment.md">
                      annexe
                    </Link>
                    , qui vise à l’étayer et apporter un éclairage aux cas
                    particuliers rencontrés.
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-4">
                <div className="block block--yellow block--fill">
                    <p><strong>Contruction de la définition</strong></p>
                  <p>
                    La construction du RNB est réalisée en collaboration avec
                    les experts de la donnée géomatique du Conseil National de
                    l’Information Géolocalisée (CNIG). Cette définition du bâtiment est le standard validé par la Commission des
                    Standards du CNIG.
                  </p>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-8">
                <div className="block block--pink block--fill">
                    <h3 className="block__title"> Identifiant RNB, la plaque d’immatriculation à vie du bâtiment</h3>
                  
                  <p>
                    Le parc bâtimentaire français est en constante évolution. En
                    permanence, des bâtiments sont construits, d’autres sont
                    détruits. C’est pourquoi, pour disposer d’une vision commune
                    du parc bâti en France, le Référentiel National des
                    Bâtiments (RNB) porte une promesse forte : celle de <strong>diffuser des identifiants bâtimentaires pérennes</strong>.
                  </p>
                  <p>
                    Grâce aux identifiants pérennes vous pouvez, dès à présent,
                    identifier des bâtiments et stocker leurs identifiants RNB.
                    Si le contenu du RNB est en évolution constante, ses
                    identifiants sont pensés pour être <strong>
                       le moyen le plus simple et le plus fiable de désigner un
                      bâtiment en France
                    </strong>
                    , aujourd’hui comme à l’avenir.
                  </p>
                </div>
              </div>
            
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
