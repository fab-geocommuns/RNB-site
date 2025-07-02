import React from 'react';
import styles from '@/styles/summerGames.module.scss';

interface SummerChallengeProps {
  globalScore: number;
  globalObjective: number;
  personalScore: number;
  personalRank: number;
  updatedAt: number;
}

export default function SummerChallenge({
  globalScore,
  globalObjective,
  personalScore,
  personalRank,
  updatedAt,
}: SummerChallengeProps) {
  const formatRank = (rank: number): string => {
    if (rank === 1) return '1er';
    return `${rank}ème`;
  };

  return (
    <div className={styles.editMapBadge}>
      <a href="/defi-ete" className={styles.editMapBadgeInside}>
        <div className={styles.editMapBadgeTitle}>
          Le défi <br />
          de l'été
        </div>
        <div className={styles.editMapBadgeSubpart}>
          <div className={styles.editMapBadgeSubpartTitle}>Score global</div>
          <div className={styles.editMapBadgeSubpartValue}>
            {globalScore}/{globalObjective}
          </div>
        </div>

        <div className={styles.editMapBadgeSubpart}>
          <div className={styles.editMapBadgeSubpartTitle}>Mon score</div>
          <div className={styles.editMapBadgeSubpartValue}>
            {personalScore} ({formatRank(personalRank)})
          </div>
        </div>
      </a>
    </div>
  );
}
