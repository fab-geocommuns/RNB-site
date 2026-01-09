'use client';

// Styles
import styles from '@/styles/feve.module.scss';

import { FeveData, useFeveData } from '@/utils/feve';
import Image from 'next/image';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';

export const revalidate = 10;

export default function FeveLeaderBoard() {
  const { data, loading } = useFeveData();

  return (
    <div className={styles.container} id="feves">
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Les fèves du RNB</h1>
      </div>

      <div className={styles.intro}>
        <p>
          <b>
            Nouvelle fonctionnalité : les signalements permettent de trouver où
            améliorer le référentiel.
          </b>
        </p>
        <p>
          Pour fêter ce lancement nous avons caché {data?.length || 0} fèves sur
          tout le territoire. Venez éditer le RNB et traiter ces signalements
          pour tenter de les retrouver !
        </p>
        <div className={styles.actions}>
          <a
            className={`fr-btn ${styles.btnParticipate}`}
            href="/edition?report_tags=6&extra_layers=reports&extra_layers=addresses"
          >
            Participer
          </a>
          {/* <a className={`fr-btn ${styles.btnLearnMore}`} href="#">
            En savoir plus
          </a> */}
        </div>
      </div>
      {!loading && data && (
        <ul className={styles.grid}>
          {data.map((dpt: FeveData) => (
            <li
              key={dpt.department_code}
              className={`${styles.item} ${dpt.found_datetime ? styles.found : styles.not_found}`}
            >
              <div className={styles.imageContainer}>
                <img
                  src={`/images/feves/w150/feve-${dpt.department_code}.png`}
                />
              </div>

              <span className={styles.department_name}>
                {dpt.department_name}
              </span>
              {dpt.found_datetime ? (
                <Tooltip
                  title={`Fève trouvée le ${new Date(
                    dpt.found_datetime,
                  ).toLocaleDateString('fr-FR')} à ${new Date(
                    dpt.found_datetime,
                  ).toLocaleTimeString('fr-FR')} par ${dpt.found_by_username}`}
                >
                  <span className={styles.found_date}>
                    <span className={styles.found_by}>
                      <i className="fr-icon-success-fill"></i>{' '}
                      {dpt.found_by_username}
                    </span>
                  </span>
                </Tooltip>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
