// Styles
import styles from '@/styles/summerGames.module.scss';

type RankTableProps = {
  title: string;
  ranks: any[];
};

const formatCount = (count: number) => {
  if (count >= 10000) {
    const rounded = Math.round(count / 100) / 10;
    return rounded.toString().replace('.', ',') + 'K';
  }
  return count;
  //return count.toLocaleString('fr-FR');
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
            <div className={styles.rankCountShell}>
              {formatCount(rank.count)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
