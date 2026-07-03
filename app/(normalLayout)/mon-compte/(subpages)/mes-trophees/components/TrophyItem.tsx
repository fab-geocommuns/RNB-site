import { TrophyDetails, TrophyUserData } from '@/utils/trophee';
import styles from '@/styles/mes-trophees.module.scss';

interface TrophyItemProps {
  userTrophy: TrophyUserData;
  details: TrophyDetails;
}

export default function TrophyItem({ userTrophy, details }: TrophyItemProps) {
  const { description, currentLevel, nextLevel, count } = details;

  return (
    <li className={styles.item}>
      <div className={styles.imageContainer}>
        <img
          src={`/images/badges/${userTrophy.trophy}_${userTrophy.level}.png`}
          alt={userTrophy.trophy_label}
        />
      </div>
      <div className={styles.textContainer}>
        <span className={styles.trophyTitle}>{userTrophy.trophy_label}</span>
        <p className={styles.trophyDescription}>{description}</p>
        {currentLevel && (
          <p className={styles.trophyDescription}>
            Niveau : {currentLevel?.level_label}
          </p>
        )}
        {nextLevel && (
          <p className={styles.trophyDescription}>
            Prochain niveau : {nextLevel?.level_label}
          </p>
        )}
        <p className={styles.trophyDescription}>
          {`Remporté par ${count} personnes`}
        </p>
      </div>
    </li>
  );
}
