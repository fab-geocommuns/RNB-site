'use client';
import { useRNBAuthentication } from '@/utils/use-rnb-authentication';
import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/summerGames.module.scss';

import { useSummerGameUserData } from '@/utils/summerGames';

interface SummerGameUserData {
  global: number;
  goal: number;
  user_score: number;
  user_rank: number;
}

interface EditMapSummerScoreProps {
  updatedAt: number;
}

export default function EditMapSummerScore({
  updatedAt,
}: EditMapSummerScoreProps) {
  const { user } = useRNBAuthentication({ require: true });

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
            2000,
          ); // Animation duration
        }

        if (userDiff > 0) {
          setScoreDiff((prev) => ({ ...prev, user: userDiff }));
          setIsAnimating((prev) => ({ ...prev, user: true }));
          setTimeout(
            () => setIsAnimating((prev) => ({ ...prev, user: false })),
            2000,
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
    <div className={styles.mapSummerScore}>
      <a href="/classement" className={styles.mapSummerScoreInside}>
        <div className={styles.mapSummerScoreTitle}>
          L'expérience <br />
          collaborative
        </div>

        {!loading && summerGameUserData && (
          <>
            <div className={styles.mapSummerScoreSubpart}>
              <div className={styles.mapSummerScoreSubpartTitle}>
                Score global
              </div>
              <div className={styles.mapSummerScoreSubpartValue}>
                {summerGameUserData.global}/{summerGameUserData.goal}
                {isAnimating.global && (
                  <span className={styles.mapSummerScoreAnimation}>
                    +{scoreDiff.global}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.mapSummerScoreSubpart}>
              <div className={styles.mapSummerScoreSubpartTitle}>Mon score</div>
              <div className={styles.mapSummerScoreSubpartValue}>
                {summerGameUserData.user_score}{' '}
                <span className={styles.userRank}>
                  ({formatRank(summerGameUserData.user_rank)})
                </span>
                {isAnimating.user && (
                  <span className={styles.mapSummerScoreAnimation}>
                    +{scoreDiff.user}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
        {summerGameUserData && summerGameUserData.goal > 0 && (
          <div className={styles.progressBarContainer}>
            <div
              className={styles.progressBar}
              style={{
                width: `${
                  (summerGameUserData.global * 100) / summerGameUserData.goal
                }%`,
              }}
            ></div>
          </div>
        )}
      </a>
    </div>
  );
}
