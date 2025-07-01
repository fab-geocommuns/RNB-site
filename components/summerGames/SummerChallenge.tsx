import React from 'react';
import styles from '@/styles/summerChallenge.module.scss';

interface SummerChallengeProps {
  globalScore: number;
  globalObjective: number;
  personalScore: number;
  personalRank: number;
}

export default function SummerChallenge({
  globalScore,
  globalObjective,
  personalScore,
  personalRank,
}: SummerChallengeProps) {
  const formatRank = (rank: number): string => {
    if (rank === 1) return '1er';
    return `${rank}ème`;
  };

  return (
    <div className={styles.summerChallenge}>
      <h3 className={styles.title}>Défi de l'été</h3>

      <div className={styles.scoreSection}>
        <div className={styles.scoreItem}>
          <span className={styles.label}>Score global :</span>
          <span className={styles.value}>
            {globalScore}/{globalObjective}
          </span>
        </div>

        <div className={styles.scoreItem}>
          <span className={styles.label}>Mon score :</span>
          <span className={styles.value}>
            {personalScore} ({formatRank(personalRank)})
          </span>
        </div>
      </div>
    </div>
  );
}
