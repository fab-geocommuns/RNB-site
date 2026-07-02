'use client';

import styles from '@/styles/summerGames.module.scss';
import {
  useTrophies,
  useUserTrophies,
  userTrophyStatus,
} from '@/utils/summerGames';
import { useRNBAuthentication } from '@/utils/useRNBAuthentication';

// Placeholder en attendant les vraies images : une pastille emoji par trophée.
const TROPHY_EMOJI: Record<string, string> = {
  validateur: '🏗️',
  course_de_fond: '🏃',
  tour_de_france: '🚴',
  superv: '🏆',
};

const winnersLabel = (count: number) =>
  count <= 0
    ? "Personne ne l'a encore gagné"
    : count === 1
      ? "1 personne l'a gagné"
      : `${count.toLocaleString('fr-FR')} personnes l'ont gagné`;

export default function BadgesList() {
  const { trophies, loading } = useTrophies();
  const { user, isAuthenticated } = useRNBAuthentication();
  const username = isAuthenticated ? user?.username : null;
  const { userTrophies } = useUserTrophies(username);

  if (loading || !trophies) return null;

  return (
    <div className={styles.badges}>
      <div className={styles.badgesGrid}>
        {trophies.map((trophy) => {
          const status = userTrophyStatus(userTrophies, trophy.trophy);
          return (
            <div key={trophy.trophy} className={styles.badge}>
              <div className={styles.badgeIcon} aria-hidden="true">
                {TROPHY_EMOJI[trophy.trophy] ?? '🏅'}
              </div>
              <div className={styles.badgeName}>{trophy.trophy_label}</div>
              <div className={styles.badgeCount}>
                {winnersLabel(trophy.count)}
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
    </div>
  );
}
