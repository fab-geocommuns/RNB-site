'use client';

// Styles
import styles from '@/styles/feve.module.scss';
import { useEffect, useState } from 'react';
import { FeveData, useFeveData } from '@/utils/feve';
import Image from 'next/image';

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
        <Image
          src={`/images/feves/curl-left.png`}
          alt=""
          width={100}
          height={43}
        />
        <h1 className={styles.title}>Les fèves du RNB</h1>
        <Image
          src={`/images/feves/curl-right.png`}
          alt=""
          width={100}
          height={43}
        />
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
              {/* {dpt.feve_found_at && (
                <span>Trouvée par {dpt.feve_found_by}</span>
              )} */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
