import {
  TrophyDetails,
  trophyImageUrl,
  trophyLevelName,
  trophyMedalColor,
  wonByLabel,
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
  const { description, levels, userLevel, count } = details;
  const won = userLevel > 0;
  // superv est un trophée unique : son visuel PNG se suffit à lui-même quand
  // il est gagné. Tous les autres cas passent par la médaille ; bordure
  // `neutral` tant que le trophée n'est pas gagné (issue #471).
  const showRawImage = trophy.trophy === 'superv' && won;

  return (
    <li className={styles.item}>
      <div className={styles.imageContainer}>
        {showRawImage ? (
          <img src={trophyImageUrl(trophy)} alt={trophy.trophy_label} />
        ) : (
          <Medal
            color={won ? trophyMedalColor(userLevel) : 'neutral'}
            image={trophyImageUrl(trophy)}
            size={120}
            alt={trophy.trophy_label}
          />
        )}
      </div>
      <div className={styles.textContainer}>
        <span className={styles.trophyTitle}>{trophy.trophy_label}</span>
        <p className={styles.trophyDescription}>{description}</p>
        {levels.length > 0 && (
          <ul className={styles.levelsList}>
            {levels.map((level) => (
              <li key={level.level}>
                {/* Pas de préfixe Bronze/Argent/Or pour un trophée à palier
                    unique (superv). */}
                {levels.length > 1 && (
                  <span className={styles.levelName}>
                    {trophyLevelName(level.level)}
                    {userLevel >= level.level && (
                      <span role="img" aria-label="niveau remporté">
                        {' '}
                        ✅
                      </span>
                    )}
                    {' : '}
                  </span>
                )}
                {level.condition}
                {levels.length === 1 && userLevel >= level.level && (
                  <span role="img" aria-label="niveau remporté">
                    {' '}
                    ✅
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
        {/* Trophée gagné mais absent du catalogue : on ne sait pas combien de
            personnes l'ont gagné, mieux vaut ne rien dire que « Pas encore gagné ». */}
        {!(won && count == null) && (
          <p className={styles.trophyDescription}>{wonByLabel(count)}</p>
        )}
      </div>
    </li>
  );
}
