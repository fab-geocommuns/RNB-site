'use client';
import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/summerGames.module.scss';
import ProgressBar from './ProgressBar';

import { useSummerGameScore, SummerGameScore } from '@/utils/summerGames';

type EditMapSummerScoreProps = {
  updatedAt: number;
  username: string;
};

export default function EditMapSummerScore({
  updatedAt,
  username,
}: EditMapSummerScoreProps) {
  const { summerGameScore, loading } = useSummerGameScore(username, updatedAt);
  const [scoreDiff, setScoreDiff] = useState({ global: 0, user: 0 });
  const [isAnimating, setIsAnimating] = useState({
    global: false,
    user: false,
  });

  const prevSummerGameScoreRef = useRef<SummerGameScore | undefined>(undefined);

  useEffect(() => {
    if (summerGameScore) {
      if (prevSummerGameScoreRef.current) {
        const globalDiff =
          summerGameScore.global - prevSummerGameScoreRef.current.global;
        const userDiff =
          summerGameScore.user_score -
          prevSummerGameScoreRef.current.user_score;

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
      prevSummerGameScoreRef.current = summerGameScore;
    }
  }, [summerGameScore]);

  const formatRank = (rank: number): string => {
    if (rank === 1) return '1er';
    return `${rank}ème`;
  };

  return (
    <div className={styles.mapSummerScore}>
      <a href="/classement" className={styles.mapSummerScoreInside}>
        <div className={styles.mapSummerScoreTitle}>
          Trophées &amp;
          <br />
          Validations
        </div>

        {!loading && summerGameScore && (
          <>
            <div className={styles.mapSummerScoreSubpart}>
              <div className={styles.mapSummerScoreSubpartTitle}>
                Objectif global
              </div>
              <div className={styles.mapSummerScoreSubpartValue}>
                {summerGameScore.global.toLocaleString('fr-FR')}/
                {summerGameScore.goal.toLocaleString('fr-FR')}
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
                {summerGameScore.user_score}
                {summerGameScore.user_score > 0 &&
                  summerGameScore.user_rank !== null && (
                    <>
                      {' '}
                      <span className={styles.userRank}>
                        ({formatRank(summerGameScore.user_rank)})
                      </span>
                    </>
                  )}

                {isAnimating.user && (
                  <span className={styles.mapSummerScoreAnimation}>
                    +{scoreDiff.user}
                  </span>
                )}
              </div>
            </div>
          </>
        )}
        {summerGameScore && (
          <ProgressBar
            score={summerGameScore.global}
            goal={summerGameScore.goal}
          />
        )}
      </a>
    </div>
  );
}
