'use client';

import styles from '@/styles/summerGames.module.scss';
import Link from 'next/link';
import Medal from './Medal';
import { userTrophyStatus } from '@/utils/summerGames';
import {
  getTrophiesData,
  getUserTrophiesData,
  wonByLabel,
} from '@/utils/trophies';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';

export default function BadgesList() {
  const { data: trophies, loadingTrophies } = getTrophiesData();
  const { user, isAuthenticated } = useRNBAuthentication();
  const username = isAuthenticated ? user?.username : null;
  const { data: userTrophies } = getUserTrophiesData(username);

  if (loadingTrophies || !trophies) return null;

  return (
    <div className={styles.badges}>
      <div className={styles.badgesGrid}>
        {trophies.map((trophy) => {
          const status = userTrophyStatus(userTrophies, trophy.trophy);
          return (
            <div key={trophy.trophy} className={styles.badge}>
              <div className={styles.badgeIcon} aria-hidden="true">
                <Medal
                  color="neutral"
                  image={`/images/trophies/${trophy.trophy}.png`}
                  size={80}
                  alt=""
                />
              </div>
              <div className={styles.badgeName}>{trophy.trophy_label}</div>
              <div className={styles.badgeCount}>
                {wonByLabel(trophy.count)}
              </div>
              <div className={styles.badgeDesc}>{trophy.description}</div>
              {status.earned && (
                <div className={styles.badgeEarned}>
                  <span className={styles.badgeCheck} aria-hidden="true">
                    ✓
                  </span>
                  {status.levelLabel ? `Gagné · ${status.levelLabel}` : 'Gagné'}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {isAuthenticated && (
        <div className={styles.allTrophiesLinkShell}>
          <Link
            href="/mon-compte/mes-trophees"
            className={styles.allTrophiesLink}
          >
            Voir tous les trophées
          </Link>
        </div>
      )}
    </div>
  );
}
