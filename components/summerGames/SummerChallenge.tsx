import React from 'react';
import styles from '@/styles/summerGames.module.scss';

import { useSummerGameUserData } from '@/utils/summerGames';

interface SummerChallengeProps {
  updatedAt: number;
}

export default function SummerChallenge({ updatedAt }: SummerChallengeProps) {
  const { summerGameUserData, loading } = useSummerGameUserData(1, updatedAt);

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

        {(!loading || summerGameUserData) && (
          <>
            <div className={styles.editMapBadgeSubpart}>
              <div className={styles.editMapBadgeSubpartTitle}>
                Score global
              </div>
              <div className={styles.editMapBadgeSubpartValue}>
                {summerGameUserData.global}/{summerGameUserData.goal}
              </div>
            </div>

            <div className={styles.editMapBadgeSubpart}>
              <div className={styles.editMapBadgeSubpartTitle}>Mon score</div>
              <div className={styles.editMapBadgeSubpartValue}>
                {summerGameUserData.user_score}{' '}
                <span className={styles.userRank}>
                  ({formatRank(summerGameUserData.user_rank)})
                </span>
              </div>
            </div>
          </>
        )}
      </a>
    </div>
  );
}
