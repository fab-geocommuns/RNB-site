import { TrophyData } from '@/utils/trophee';
import styles from '@/styles/mes-trophees.module.scss';

interface TrophyToWinItemProps {
  trophy: TrophyData;
}

export default function TrophyToWinItem({ trophy }: TrophyToWinItemProps) {
  const firstLevel = trophy.levels[0];

  return (
    <li className={`${styles.item} ${styles.itemLocked}`}>
      <div className={styles.imageContainer}>
        <img
          src={`/images/trophies/${trophy.trophy}.png`}
          alt={trophy.trophy_label}
        />
      </div>
      <div className={styles.textContainer}>
        <span className={styles.trophyTitle}>{trophy.trophy_label}</span>
        <p className={styles.trophyDescription}>{trophy.description}</p>
        {firstLevel?.condition && (
          <p className={styles.trophyDescription}>
            Prochain niveau :{' '}
            {`${firstLevel.level_label} (${firstLevel.condition})`}
          </p>
        )}
        <p className={styles.trophyDescription}>
          {`Remporté par ${firstLevel.count} ${Number(firstLevel.count) > 1 ? 'personnes' : 'personne'}`}
        </p>
      </div>
    </li>
  );
}
