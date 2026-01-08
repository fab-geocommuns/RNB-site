'use client';

// Styles
import styles from '@/styles/feve.module.scss';
import { useEffect, useState } from 'react';
import { FeveData, useFeveData } from '@/utils/feve';
import Image from 'next/image';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';

export const revalidate = 10;

export default function FeveLeaderBoard() {
  const [loading, setLoading] = useState(true);
  const [feveData, setFeveData] = useState<FeveData[]>();

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await useFeveData();
        const sortedData = data.sort((a, b) =>
          a.dpt_name.localeCompare(b.dpt_name),
        );
        setFeveData(sortedData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  return (
    <div className={styles.container}>
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
          {feveData?.length || 0} fèves sur tout le territoire. Traitez des
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
      {!loading && feveData && (
        <ul className={styles.grid}>
          {feveData.map((dpt) => (
            <li
              key={dpt.dpt_code}
              className={`${styles.item} ${dpt.feve_found_at ? styles.found : styles.not_found}`}
            >
              <Image
                src={`/images/feves/feve-${dpt.dpt_code}.png`}
                alt={dpt.dpt_name}
                width={130}
                height={130}
              />

              <span className={styles.department_name}>{dpt.dpt_name}</span>
              {dpt.feve_found_at ? (
                <Tooltip
                  title={`Fève trouvée le ${new Date(
                    dpt.feve_found_at,
                  ).toLocaleDateString('fr-FR')} à ${new Date(
                    dpt.feve_found_at,
                  ).toLocaleTimeString('fr-FR')} par ${dpt.feve_found_by}`}
                >
                  <span className={styles.found_date}>
                    <span className={styles.found_by}>
                      <i className="fr-icon-success-fill"></i>{' '}
                      {dpt.feve_found_by}
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
