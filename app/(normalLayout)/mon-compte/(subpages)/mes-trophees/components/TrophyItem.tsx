import {
  TrophyDetails,
  trophyImageUrl,
  trophyMedalColor,
  Trophy,
  TrophyData,
} from '@/utils/trophies';
import styles from '@/styles/mes-trophees.module.scss';
import Medal from '@/components/games/summerGames/Medal';

interface TrophyItemProps {
  trophy: Trophy | TrophyData;
  details: TrophyDetails;
}

export default function TrophyItem({ trophy, details }: TrophyItemProps) {
  const { description, currentLevel, nextLevel, count } = details;

  return (
    <li className={styles.item}>
      <div className={styles.imageContainer}>
        {trophy.trophy === 'superv' || ('levels' in trophy && trophy.levels) ? (
          <img
            src={`/images/trophies/${trophy.trophy}.png`}
            alt={trophy.trophy_label}
          />
        ) : (
          <Medal
            color={trophyMedalColor(currentLevel?.level ?? 0)}
            image={trophyImageUrl(trophy)}
            size={120}
            alt={trophy.trophy_label}
          />
        )}
      </div>
      <div className={styles.textContainer}>
        <span className={styles.trophyTitle}>{trophy.trophy_label}</span>
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
