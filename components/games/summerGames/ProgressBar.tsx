import React from 'react';
import styles from '@/styles/summerGames.module.scss';

interface ProgressBarProps {
  score: number;
  goal: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ score, goal }) => {
  if (goal <= 0) {
    return null;
  }

  const progressPercentage = (score / goal) * 100;

  return (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{
          width: `${Math.min(progressPercentage, 100)}%`,
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
