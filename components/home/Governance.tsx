import styles from '@/styles/home.module.scss';
import ImageNext from 'next/image';
import logoAdeme from '@/public/images/logos/ademe.svg';
import logoCstb from '@/public/images/logos/cstb-bdnb.png';
import logoIgn from '@/public/images/logos/ign.png';
import logoDgaln from '@/public/images/logos/dgaln.png';
import logoFnv from '@/public/images/logos/france-nation-verte.jpg';
import logoDinum from '@/public/images/logos/dinum.png';

export default function Governance() {
  return (
    <div className="section">
      <div className="fr-grid-row fr-grid-row--gutters">
        <div className="fr-col-12 ">
          <div className="section__titleblock">
            <h2 className="section__title">Gouvernance</h2>
            <p className="section__subtitle">
              Les financeurs et soutiens du RNB
            </p>
          </div>
          <div
            className="fr-grid-row fr-grid-row--gutters"
            style={{
              display: 'flex',
              placeItems: 'center',
              placeContent: 'center',
            }}
          >
            <div className="fr-col-md-3 fr-col-6 text-center">
              <ImageNext
                className={styles.sponsorBlock__logo}
                src={logoIgn}
                alt="Institut national de l’information géographique et forestière"
              />
            </div>
            <div className="fr-col-md-3 fr-col-6 text-center">
              <ImageNext
                className={styles.sponsorBlock__logo}
                src={logoCstb}
                alt="Centre scientifique et technique du bâtiment"
              />
            </div>
            <div className="fr-col-md-3 fr-col-6 text-center">
              <ImageNext
                className={`${styles.sponsorBlock__logo} ${styles.sponsorBlock__logoAdeme}`}
                src={logoAdeme}
                alt="Agence de la transition écologique"
              />
            </div>
            <div className="fr-col-md-3 fr-col-6 text-center">
              <ImageNext
                className={`resp-image ${styles.sponsorBlock__logo} ${styles['sponsorBlock__logo--dgaln']}`}
                src={logoDgaln}
                alt="Direction générale de l’aménagement, du logement et de la nature"
              />
            </div>
            <div className="fr-col-md-3 fr-col-6 text-center">
              <ImageNext
                className={styles.sponsorBlock__logo}
                src={logoFnv}
                alt="France Nation Verte"
              />
            </div>
            <div className="fr-col-md-3 fr-col-6 text-center">
              <ImageNext
                className={styles.sponsorBlock__logo}
                src={logoDinum}
                alt="Direction interministérielle du numérique"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
