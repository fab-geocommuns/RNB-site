// Styles
import styles from '@/styles/summerGames.module.scss';

type RankTableProps = {
  title: string;
  ranks: any[];
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
