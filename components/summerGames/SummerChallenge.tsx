'use client';
import { useRNBAuthentication } from '@/utils/use-rnb-authentication';
import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/summerGames.module.scss';
import { useSession } from 'next-auth/react';

import { useSummerGameUserData } from '@/utils/summerGames';

interface SummerGameUserData {
  global: number;
  goal: number;
  user_score: number;
  user_rank: number;
}

interface SummerChallengeProps {
  updatedAt: number;
}

export default function SummerChallenge({ updatedAt }: SummerChallengeProps) {
  const { user } = useRNBAuthentication({ require: true });

  console.log('User:', user);

  const { summerGameUserData, loading } = useSummerGameUserData(
    user?.username,
    updatedAt,
  );
  const [scoreDiff, setScoreDiff] = useState({ global: 0, user: 0 });
  const [isAnimating, setIsAnimating] = useState({
    global: false,
    user: false,
  });

  const prevSummerGameUserDataRef = useRef<SummerGameUserData | undefined>(
    undefined,
  );

  useEffect(() => {
    if (summerGameUserData) {
      if (prevSummerGameUserDataRef.current) {
        const globalDiff =
          summerGameUserData.global - prevSummerGameUserDataRef.current.global;
        const userDiff =
          summerGameUserData.user_score -
          prevSummerGameUserDataRef.current.user_score;

        if (globalDiff > 0) {
          setScoreDiff((prev) => ({ ...prev, global: globalDiff }));
          setIsAnimating((prev) => ({ ...prev, global: true }));
          setTimeout(
            () => setIsAnimating((prev) => ({ ...prev, global: false })),
            3000,
          ); // Animation duration
        }

        if (userDiff > 0) {
          setScoreDiff((prev) => ({ ...prev, user: userDiff }));
          setIsAnimating((prev) => ({ ...prev, user: true }));
          setTimeout(
            () => setIsAnimating((prev) => ({ ...prev, user: false })),
            3000,
          ); // Animation duration
        }
      }
      prevSummerGameUserDataRef.current = summerGameUserData;
    }
  }, [summerGameUserData]);

  const formatRank = (rank: number): string => {
    if (rank === 1) return '1er';
    return `${rank}ème`;
  };

  return (
    <div className={styles.editMapBadge}>
      <a href="/defi-ete" className={styles.editMapBadgeInside}>
        <div className={styles.editMapBadgeTitle}>
          L'expérience <br />
          collaborative
        </div>

        {!loading && summerGameUserData && (
          <>
            <div className={styles.editMapBadgeSubpart}>
              <div className={styles.editMapBadgeSubpartTitle}>
                Score global
              </div>
              <div className={styles.editMapBadgeSubpartValue}>
                {summerGameUserData.global}/{summerGameUserData.goal}
                {isAnimating.global && (
                  <span className={styles.scoreAnimation}>
                    +{scoreDiff.global}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.editMapBadgeSubpart}>
              <div className={styles.editMapBadgeSubpartTitle}>Mon score</div>
              <div className={styles.editMapBadgeSubpartValue}>
                {summerGameUserData.user_score}{' '}
                <span className={styles.userRank}>
                  ({formatRank(summerGameUserData.user_rank)})
                </span>
                {isAnimating.user && (
                  <span className={styles.scoreAnimation}>
                    +{scoreDiff.user}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
      </a>
    </div>
  );
}
