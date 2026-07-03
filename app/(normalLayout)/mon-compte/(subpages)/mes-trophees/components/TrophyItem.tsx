import {
  TrophyDetails,
  trophyImageUrl,
  trophyMedalColor,
  TrophyUserData,
} from '@/utils/trophee';
import styles from '@/styles/mes-trophees.module.scss';
import Medal from '@/components/games/summerGames/Medal';

interface TrophyItemProps {
  userTrophy: TrophyUserData;
  details: TrophyDetails;
}

export default function TrophyItem({ userTrophy, details }: TrophyItemProps) {
  const { description, currentLevel, nextLevel, count } = details;

  return (
    <li className={styles.item}>
      <div className={styles.imageContainer}>
        {userTrophy.trophy === 'superv' ? (
          <img
            src={`/images/trophies/${userTrophy.trophy}.png`}
            alt={userTrophy.trophy_label}
          />
        ) : (
          <Medal
            color={trophyMedalColor(Number(currentLevel?.level) ?? 0)}
            image={trophyImageUrl(userTrophy)}
            size={120}
            alt={userTrophy.trophy_label}
          />
        )}
      </div>
      <div className={styles.textContainer}>
        <span className={styles.trophyTitle}>{userTrophy.trophy_label}</span>
        <p className={styles.trophyDescription}>{description}</p>
        {currentLevel?.level_label && (
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
          {`Remporté par ${count} ${Number(count) > 1 ? 'personnes' : 'personne'}`}
        </p>
      </div>
    </li>
  );
}
