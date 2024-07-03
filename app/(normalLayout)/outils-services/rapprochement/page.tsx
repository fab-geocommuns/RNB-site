// Utils
import { getDatabases } from '@/utils/databases';

// Comps
import DBCard from '@/components/DBCard';
import ImageNext from 'next/image';
import { Card } from '@codegouvfr/react-dsfr/Card';

// Settings
import settings from '@/logic/settings';

// Styles
import styles from '@/styles/richerDatabases.module.scss';

// Images
import pivotIllu from '@/public/images/pivot-sentence.png';
import pivotIlluMobile from '@/public/images/pivot-sentence-mobile.png';
import mountainPhoto from '@/public/images/bdgs-mountains.jpg';
import metalBdgPhoto from '@/public/images/metal-bdg.jpg';
import bdgRiverPhoto from '@/public/images/bdg-river.jpg';

export default async function Page() {
  const dbs = await getDatabases();

  return (
    <>
      <div className="fr-container">
        <div className="section section__big">
          <div className="fr-grid-row ">
            <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2 fr-pt-12v">
              <h1>Enrichissez vos bases de données bâtimentaires</h1>
              <p className="fr-text--lead">
                Les identifiants de bâtiments RNB servent de pivot entre des
                données jusqu&apos;à présent isolées. Obtenez et diffusez les
                identifiants RNB de vos bâtiments pour enrichir vos bases de
                données.
              </p>
            </div>
            <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1 fr-pt-12v">
              <div className="block block--yellow">
                <h2 className="blockTitle">Comment faire ?</h2>
                <ol>
                  <li>
                    <a href="#liste">Identifiez les bases</a> contenant les
                    informations qui vous intéressent
                  </li>
                  <li>
                    <a href="#identifiants">Obtenez les identifiants RNB</a> de
                    vos bâtiments grâce à nos outils et services
                  </li>
                  <li>
                    Croisez les bases en utilisant les identifiants RNB comme
                    pivot
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="fr-grid-row ">
            <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">
              <div className="section__titleblock">
                <h2 id="liste" className="section__title">
                  Les bases contenant des identifiants RNB
                </h2>
                <p className="section__subtitle">
                  Performance énergétique, insalubrité, équipements sportifs,
                  copropriétés, ...
                </p>
              </div>

              {dbs.map((db: any) => {
                return <DBCard key={db.key} db={db} />;
              })}

              <p>
                Votre base contient des identifiants RNB et vous souhaitez en
                faire la promotion sur cette page ?<br />
                Ecrivez-nous à{' '}
                <a href={`mailto:${settings.contactEmail}`}>
                  {settings.contactEmail}
                </a>{' '}
                ou{' '}
                <a
                  href="https://github.com/fab-geocommuns/RNB-site/blob/main/data/databases.yaml"
                  target="_blank"
                >
                  proposez une modification
                </a>{' '}
                du site.
              </p>
            </div>
          </div>
        </div>

        <div className="section section__big">
          <div className="fr-grid-row ">
            <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1">
              <div className={styles.pivotBlock}>
                <h3 className={styles.pivotBlockTitle}>
                  Les identifiants de bâtiments RNB servent de pivot entre des
                  données jusqu&apos;à présent isolées.
                </h3>
                <div className={styles.pivotBlockSentence}>
                  <div className="none md-block">
                    <ImageNext
                      className="resp-image"
                      src={pivotIllu}
                      alt="Illustration d’un pivot"
                    />
                  </div>
                  <div className="md-none">
                    <ImageNext
                      className="resp-image"
                      src={pivotIlluMobile}
                      alt="Illustration d’un pivot"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="section section__big" id="identifiants">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-10 fr-col-offset-md-1">
              <div className="section__titleblock">
                <h2 id="liste" className="section__title">
                  Comment obtenir les identifiants RNB de vos bâtiments ?
                </h2>
                <p className="section__subtitle">
                  Utilisez directement nos outils ou faites appel à nos services
                </p>
              </div>
            </div>
            <div className="fr-col-12 fr-col-md-4">
              <Card
                imageUrl={metalBdgPhoto.src}
                desc="Interrogez notre API bâtiment et intégrez directement les identifiants RNB de vos bâtiments à vos jeux de données."
                linkProps={{
                  href: 'https://rnb-fr.gitbook.io/documentation/api-et-outils/api-batiments/identification-de-batiment',
                }}
                title="Utilisez notre API d'identification de bâtiments"
              />
            </div>
            <div className="fr-col-12 fr-col-md-4">
              <Card
                imageUrl={mountainPhoto.src}
                desc="Intégrez une carte présentant les bâtiments RNB au sein de vos sites et logiciels. Permettez à vos utilisateurs d'identifier et sélectionner le ou les bons bâtiments."
                linkProps={{
                  href: 'https://rnb-fr.gitbook.io/documentation/exemples/selecteur-de-batiments',
                }}
                title="Intégrez un sélecteur de bâtiments à vos outils"
              />
            </div>
            <div className="fr-col-12 fr-col-md-4">
              <Card
                imageUrl={bdgRiverPhoto.src}
                desc="Vous souhaitez intégrer les identifiants RNB à votre base bâtimentaire mais n'avez pas les ressources techniques pour le faire ? Contactez-nous."
                linkProps={{ href: '/contact' }}
                title="Faites appel à notre bureau des rapprochements"
              />
            </div>
          </div>
        </div>

        <div className="section section__big fr-pb-16v">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-8 fr-col-offset-md-2">
              <div className="block block--blue">
                <h2 className="blockTitle">Pour aller plus loin</h2>
                <ul>
                  <li>
                    Article :{' '}
                    <a href="/blog/identifiant-batiment-perenne">
                      Qu&apos;est-ce qu&apos;est un ID de bâtiment pérenne ?
                    </a>
                  </li>
                  <li>
                    Standard :{' '}
                    <a href="/definition">
                      la définition retenue d&apos;un bâtiment
                    </a>
                  </li>
                  <li>
                    La <a href="/faq">Foire aux Questions</a> du RNB
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
