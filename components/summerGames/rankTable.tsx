// Styles
import styles from '@/styles/summerGames.module.scss';

import Tooltip from '@codegouvfr/react-dsfr/Tooltip';

type RankTableProps = {
  title: string;
  ranks: any[];
};

const bigScoreLimit = 10000;

const formatCount = (count: number) => {
  if (count >= bigScoreLimit) {
    const rounded = Math.round(count / 100) / 10;
    return rounded.toString().replace('.', ',') + 'K';
  }
  return count.toLocaleString('fr-FR');
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
              {rank.count >= bigScoreLimit && (
                <Tooltip kind="hover" title={rank.count}>
                  {formatCount(rank.count)}
                </Tooltip>
              )}
              {rank.count < bigScoreLimit && <>{formatCount(rank.count)}</>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
