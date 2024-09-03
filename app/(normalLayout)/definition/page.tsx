import Link from 'next/link';

// Style
import styles from '@/styles/definition.module.scss';
import path from 'path';
import { promises as fs } from 'fs';
import { parse } from 'yaml';
import ListeCas from '@/app/(normalLayout)/definition/ListeCas';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { fr } from '@codegouvfr/react-dsfr';
import { Cas } from '@/app/(normalLayout)/definition/ListeCas.type';

async function fetchListeCas() {
  const jsonDirectory = path.join(process.cwd(), 'data');
  const fileContents = await fs.readFile(
    jsonDirectory + '/liste-cas.yaml',
    'utf8',
  );
  const data = parse(fileContents);
  return data;
}

export default async function Page() {
  const listeCas = (await fetchListeCas()) as Cas[];
  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-py-12v">
            <h1>Définition et Standard</h1>

            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-8">
                <div className="block block--paleGreen block--fill">
                  <h3 className="block__title">
                    Définition d&apos;un bâtiment
                  </h3>

                  <p className={styles.bdgDefinition}>
                    Construction souterraine et/ou au-dessus du sol, ayant pour
                    objectif d&apos;être permanente, pour abriter des humains ou
                    des activités humaines. Un bâtiment possède a minima un
                    accès depuis l’extérieur. Dans la mesure du possible, un
                    bâtiment est distinct d’un autre dès lors qu’il est
                    impossible de circuler entre eux.
                  </p>
                  <div className={styles.bdgDefinitionContext}>
                    Cette définition est complétée par une{' '}
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
                  <p>
                    <strong>Contruction de la définition</strong>
                  </p>
                  <p>
                    La construction du RNB est réalisée en collaboration avec
                    les experts de la donnée géographique du Conseil National de
                    l’Information Géolocalisée (
                    <a href="https://cnig.gouv.fr/" target="_blank">
                      CNIG
                    </a>
                    ). Cette définition du bâtiment est le standard validé par
                    la Commission des Standards du CNIG.
                  </p>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-12">
                <div className="block">
                  <h3 className="block__title">
                    🏠 Evaluez si votre construction est un bâtiment
                  </h3>

                  <p>
                    <strong>
                      Vous ne savez pas si votre construction ou structure
                      correspond à la définition du bâtiment ?{' '}
                    </strong>{' '}
                    <br />
                    Parcourez la liste des cas recensés par le RNB, par mots
                    clés (ex. extension; terrasse; kiosk…) .
                  </p>

                  <ListeCas listeCas={listeCas} />
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-8">
                <div className="block">
                  <h3 className="block__title">
                    Distinction entre un bâtiment unique et plusieurs bâtiments
                  </h3>

                  <p>
                    <strong>
                      Vous vous demandez si la construction constitue un ou
                      plusieurs bâtiments ?
                    </strong>{' '}
                    <br />
                    Parcourez les exemples ci-dessous apportant un éclairage sur
                    les cas particuliers rencontrés.
                  </p>

                  <div className={fr.cx('fr-accordions-group')}>
                    {listeCas
                      .filter((cas) => !!cas.texteDistinction)
                      .map((cas) => (
                        <Accordion
                          key={cas.id}
                          label={<span id={cas.id}>{cas.titre}</span>}
                        >
                          {cas.texteDistinction!}
                        </Accordion>
                      ))}
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-8">
                <div className="block block--pink block--fill">
                  <h3 className="block__title">
                    {' '}
                    Identifiant RNB, la plaque d’immatriculation à vie du
                    bâtiment
                  </h3>

                  <p>
                    Le parc bâtimentaire français est en constante évolution. En
                    permanence, des bâtiments sont construits, d’autres sont
                    détruits. C’est pourquoi, pour disposer d’une vision commune
                    du parc bâti en France, le Référentiel National des
                    Bâtiments (RNB) porte une promesse forte : celle de{' '}
                    <strong>
                      diffuser des identifiants bâtimentaires pérennes
                    </strong>
                    .
                  </p>
                  <p>
                    Grâce aux identifiants pérennes vous pouvez, dès à présent,
                    identifier des bâtiments et stocker leurs identifiants RNB.
                    Si le contenu du RNB est en évolution constante, ses
                    identifiants sont pensés pour être{' '}
                    <strong>
                      le moyen le plus simple et le plus fiable de désigner un
                      bâtiment en France
                    </strong>
                    , aujourd’hui comme à l’avenir.
                  </p>
                  <div>
                    <b>Pour en savoir plus : </b>
                  </div>
                  <ul>
                    <li>
                      <a href="/a-propos">A propos du RNB</a>
                    </li>

                    <li>
                      <a href="/faq">Foire aux questions</a>
                    </li>
                    <li>
                      <a href="https://rnb-fr.gitbook.io/documentation/repository-rnb-coeur/proprietes-dun-batiment">
                        Les propriétés d&apos;un bâtiment RNB
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
