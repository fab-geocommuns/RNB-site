'use client';

import { useSession } from 'next-auth/react';
import { FeveData, useUserFeves } from '@/utils/feve';
import styles from '@/styles/mes-trophees.module.scss';
import Tooltip from '@codegouvfr/react-dsfr/Tooltip';
import {
  TrophyData,
  TrophyUserData,
  getTrophiesData,
  getUserTrophiesData,
} from '@/utils/trophee';

export default function MesFevesPage() {
  const { data: session } = useSession();
  const { data: userFeves, loading } = useUserFeves(
    session?.username ?? undefined,
  );
  const { data: trophies, loadingTrophies } = getTrophiesData();
  const { data: userTrophies, loadingUserTrophies } = getUserTrophiesData(
    session?.username ?? undefined,
  );

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
    <div className="fr-tabs">
      <ul className="fr-tabs__list" role="tablist">
        <li role="presentation">
          <button
            type="button"
            id="storybook-tab-0"
            className="fr-tabs__tab"
            tabIndex={0}
            role="tab"
            aria-selected="true"
            aria-controls="storybook-tab-0-panel"
          >
            Trophées gagnés
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            id="storybook-tab-1"
            className="fr-tabs__tab"
            tabIndex={-1}
            role="tab"
            aria-selected="false"
            aria-controls="storybook-tab-1-panel"
          >
            Liste des trophées
          </button>
        </li>
        <li role="presentation">
          <button
            type="button"
            id="storybook-tab-2"
            className="fr-tabs__tab"
            tabIndex={-1}
            role="tab"
            aria-selected="false"
            aria-controls="storybook-tab-2-panel"
          >
            Fèves
          </button>
        </li>
      </ul>

      <div
        id="storybook-tab-0-panel"
        className="fr-tabs__panel fr-tabs__panel--selected"
        role="tabpanel"
        aria-labelledby="storybook-tab-0"
        tabIndex={0}
      >
        <ul className={styles.grid}>
          {(Array.isArray(userTrophies) ? userTrophies : []).map(
            (trophie: TrophyUserData) => (
              <li key={trophie.trophy} className={styles.item}>
                <span className={styles.trophyTitle}>
                  {trophie.trophy_label}
                </span>
                <Tooltip
                  title={
                    trophie.level_label
                      ? trophie.level_label
                      : 'Super validateur !'
                  }
                >
                  <div className={styles.imageContainer}>
                    <img
                      src={`/images/badges/${trophie.trophy}_${trophie.level}.png`}
                      alt={
                        trophie.level_label
                          ? trophie.level_label
                          : 'Super validateur !'
                      }
                    />
                  </div>
                </Tooltip>
              </li>
            ),
          )}
        </ul>
      </div>

      <div
        id="storybook-tab-1-panel"
        className="fr-tabs__panel"
        role="tabpanel"
        aria-labelledby="storybook-tab-1"
        tabIndex={-1}
      >
        <ul className={styles.grid}>
          {(trophies ?? []).map((trophie: TrophyData) => (
            <li key={trophie.trophy} className={styles.item}>
              <span className={styles.trophyTitle}>{trophie.trophy_label}</span>
              <span className={styles.trophyDescription}>
                {trophie.description}
              </span>

              <div className={styles.levelsRow}>
                {trophie.levels.map((level) => (
                  <Tooltip
                    key={level.level}
                    title={
                      <>
                        <strong>
                          {level.level_label ? level.level_label : ''}
                        </strong>
                        {level.level_label ? ' : ' : ''}
                        {level.condition}
                      </>
                    }
                  >
                    <div className={styles.imageContainer}>
                      <img
                        src={`/images/badges/${trophie.trophy}_${level.level}.png`}
                        alt={`Badge ${trophie.trophy_label} niveau ${level.level}`}
                      />
                    </div>
                  </Tooltip>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div
        id="storybook-tab-2-panel"
        className="fr-tabs__panel"
        role="tabpanel"
        aria-labelledby="storybook-tab-2"
        tabIndex={-1}
      >
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
    </div>
  );
}
