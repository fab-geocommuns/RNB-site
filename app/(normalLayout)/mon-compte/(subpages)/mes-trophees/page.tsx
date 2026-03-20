'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { FeveData, useUserFeves } from '@/utils/feve';
import styles from '@/styles/mes-trophees.module.scss';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';

export default function MesFevesPage() {
  const { data: session } = useSession();
  const { data: userFeves, loading } = useUserFeves(
    session?.username ?? undefined,
  );

  if (loading) {
    return <p>Chargement...</p>;
  }

  if (!userFeves || userFeves.length === 0) {
    return (
      <div className={styles.container}>
        Vous n&apos;avez pas encore gagné de trophée.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ul className={styles.grid}>
        {userFeves.map((feve: FeveData) => (
          <li key={feve.department_code} className={styles.item}>
            <Tooltip
              title={`Fève trouvée le ${new Date(feve.found_datetime!).toLocaleDateString('fr-FR')} à ${new Date(feve.found_datetime!).toLocaleTimeString('fr-FR')}`}
            >
              <div className={styles.imageContainer}>
                <img
                  src={`/images/feves/w150/feve-${feve.department_code}.png`}
                  alt={`Fève ${feve.department_name}`}
                />
              </div>
            </Tooltip>
            <span className={styles.departmentName}>
              {feve.department_name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
