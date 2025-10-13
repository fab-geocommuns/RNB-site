import Link from 'next/link';

// Style
import styles from '@/styles/definition.module.scss';
import path from 'path';
import { promises as fs } from 'fs';
import { parse } from 'yaml';
import BuildingList from '@/app/(normalLayout)/definition/BuildingList';
import { BuildingExample } from '@/app/(normalLayout)/definition/BuildingList.type';
import BuildingDistinctions from '@/app/(normalLayout)/definition/BuildingDistinctions';

async function fetchBuildingList() {
  const jsonDirectory = path.join(process.cwd(), 'data');
  const fileContents = await fs.readFile(
    jsonDirectory + '/building-list.yaml',
    'utf8',
  );
  const data = parse(fileContents);
  return data;
}

export default async function Page() {
  const buildingList = (await fetchBuildingList()) as BuildingExample[];
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
                    objectif d&apos;être permanente, pour{' '}
                    <a href="#" target="_blank" className="target-blank-noIcon">
                      abriter
                    </a>{' '}
                    des humains ou des activités humaines. Un bâtiment possède a
                    minima un accès depuis l’extérieur. Dans la mesure du
                    possible, un bâtiment est distinct d’un autre dès lors qu’il
                    est impossible de circuler entre eux.
                  </p>
                  <div className={styles.bdgDefinitionContext}>
                    Cette définition est complétée par une{' '}
                    <Link href="https://github.com/fab-geocommuns/RNB/blob/main/CNIG/Annexe-Definition-Batiment.md">
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
                <h2 className="block__title">
                  Evaluez si votre construction est un bâtiment
                </h2>

                <p>
                  <strong>
                    Vous ne savez pas si votre construction ou structure
                    correspond à la définition du bâtiment ?
                  </strong>
                  <br />
                  Parcourez la liste des cas recensés par le RNB, par mots clés
                  (ex&nbsp;: extension; terrasse; kiosque …) .
                </p>

                <BuildingList buildingList={buildingList} />
              </div>
              <BuildingDistinctions buildingList={buildingList} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
