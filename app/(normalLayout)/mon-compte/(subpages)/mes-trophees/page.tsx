'use client';

import { useSession } from 'next-auth/react';
import { FeveData, useUserFeves } from '@/utils/feve';
import styles from '@/styles/mes-trophees.module.scss';
import {
  TrophyUserData,
  getTrophiesData,
  getUserTrophiesData,
  getUserTrophyData,
  getTrophiesToWin,
} from '@/utils/trophee';
import TrophyItem from './components/TrophyItem';
import TrophyToWinItem from './components/TrophyToWinItem';

export default function MesFevesPage() {
  const { data: session } = useSession();
  const { data: userFeves, loading } = useUserFeves(
    session?.username ?? undefined,
  );
  const { data: trophies, loadingTrophies } = getTrophiesData();
  const { data: userTrophies, loadingUserTrophies } = getUserTrophiesData(
    session?.username ?? undefined,
  );
  const trophiesToWin = getTrophiesToWin(trophies, userTrophies);

  if (loading || loadingTrophies || loadingUserTrophies) {
    return <p>Chargement...</p>;
  }

  if ((!userFeves || userFeves.length === 0) && !trophies) {
    return (
      <div className={styles.container}>
        Vous n&apos;avez pas encore gagné de trophée.
      </div>
    );
  }

  return (
    <>
      <div className="fr-container">
        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-12">
            <h2 className="block__title">Mes trophées</h2>
            <ul className={styles.grid}>
              {(Array.isArray(userTrophies) ? userTrophies : []).map(
                (userTrophy: TrophyUserData) => (
                  <TrophyItem
                    key={userTrophy.trophy}
                    userTrophy={userTrophy}
                    details={getUserTrophyData(trophies ?? [], userTrophy)}
                  />
                ),
              )}
              {userFeves &&
                userFeves.map((feve: FeveData) => (
                  <li key={feve.department_code} className={styles.item}>
                    <div className={styles.imageContainer}>
                      <img
                        src={`/images/feves/w150/feve-${feve.department_code}.png`}
                        alt={`Fève ${feve.department_name}`}
                      />
                    </div>
                    <div className={styles.textContainer}>
                      <span
                        className={styles.trophyTitle}
                      >{`Fève ${feve.department_name}`}</span>
                      <p className={styles.trophyDescription}>
                        {`Fève trouvée le ${new Date(feve.found_datetime!).toLocaleDateString('fr-FR')} à ${new Date(feve.found_datetime!).toLocaleTimeString('fr-FR')}`}
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        <div className="fr-grid-row">
          <div className="fr-col-12 fr-col-md-12">
            <h2 className="block__title">Trophées à gagner</h2>
            <ul className={styles.grid}>
              {trophiesToWin.map((trophy) => (
                <TrophyToWinItem key={trophy.trophy} trophy={trophy} />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
