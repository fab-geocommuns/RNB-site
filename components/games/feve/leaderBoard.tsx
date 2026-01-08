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
            Nouveau : les signalements permettent de trouver où améliorer le
            référentiel.
          </b>
        </p>
        <p>
          Pour fêter le lancement de cette fonctionnalité, nous avons caché{' '}
          {data?.length || 0} fèves sur tout le territoire. Traitez des
          signalements pour tenter de les retrouver !
        </p>
        <div className={styles.actions}>
          <a className={`fr-btn ${styles.btnParticipate}`} href="#">
            Participer
          </a>
          <a className={`fr-btn ${styles.btnLearnMore}`} href="#">
            En savoir plus
          </a>
        </div>
      </div>
      {!loading && data && (
        <ul className={styles.grid}>
          {data.map((dpt: FeveData) => (
            <li
              key={dpt.department_code}
              className={`${styles.item} ${dpt.found_datetime ? styles.found : styles.not_found}`}
            >
              <Image
                src={`/images/feves/feve-${dpt.department_code}.png`}
                alt={dpt.department_name}
                width={130}
                height={130}
              />

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
