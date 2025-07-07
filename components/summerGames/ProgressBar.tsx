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

  return (
    <div className={styles.progressBarContainer}>
      <div
        className={styles.progressBar}
        style={{
          width: `${(score * 100) / goal}%`,
        }}
      ></div>
    </div>
  );
};

export default ProgressBar;
