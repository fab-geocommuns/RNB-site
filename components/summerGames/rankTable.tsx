// Styles
import styles from '@/styles/summerGames.module.scss';

// Comps
import ImageNext from 'next/image';

// Images
import medalGoldPic from '@/public/images/summerGames/medal_gold.svg';
import medalSilverPic from '@/public/images/summerGames/medal_silver.svg';
import medalBronzePic from '@/public/images/summerGames/medal_bronze.svg';
import { useEffect, useState } from 'react';

type RankTableProps = {
  title: string;
  ranks: any[];
  limit: number;
};

const mapRankToMedal: Record<number, string> = {
  0: medalGoldPic,
  1: medalSilverPic,
  2: medalBronzePic,
};

export default function RankTable({ title, ranks }: RankTableProps) {
  return (
    <div className={styles.rankShell}>
      <div className={styles.legend}>{title}</div>

      <div className={styles.rankTable}>
        {ranks.map((rank, index) => (
          <div key={index} className={styles.rankRow}>
            <div className={styles.rankMedalShell}>{index + 1} •</div>
            <div className={styles.rankNameShell}>{rank.name}</div>
            <div className={styles.rankCountShell}>{rank.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
