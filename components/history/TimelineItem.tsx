import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import { formatDate, formatTime } from '@/utils/date';
import styles from '@/styles/history.module.scss';
import mergeBuildingImage from '@/public/images/map/edition/merge.svg';
import createBuildingImage from '@/public/images/map/edition/create.svg';
import splitBuildingImage from '@/public/images/map/edition/split.svg';
import disableBuildingImage from '@/public/images/history/disable.svg';
import activateBuildingImage from '@/public/images/history/checked.svg';
import updateBuildingImage from '@/public/images/history/update.svg';
import { getHistoryShortTitle, displayAuthor } from '@/logic/history';

export default function TimelineItem({
  history,
  index,
  selectedIndex,
  timelineLength,
  onTimelineItemClick,
}: {
  history: ApiHistoryItem;
  index: number;
  selectedIndex: number;
  timelineLength: number;
  onTimelineItemClick?: (index: number) => void;
}) {
  return (
    <div key={index} className={styles.timelineItem}>
      {index < timelineLength - 1 && <div className={styles.timelineLine} />}
      <div
        className={`${styles.timelineIcon} ${history.event.type === 'creation' ? styles.iconCreation : ''}`}
      >
        <img
          src={selectIcon(history.event.type)}
          alt=""
          height="24"
          width="24"
        />
      </div>

      <button
        className={`${styles.timelineContent} ${selectedIndex === index ? styles.selected : styles.default}`}
        onClick={() => {
          onTimelineItemClick?.(index);
        }}
      >
        {index === 0 && (
          <div
            className={`fr-badge fr-badge--success fr-badge--no-icon ${styles.currentVersion}`}
          >
            <span>Version actuelle</span>
          </div>
        )}

        <div className={styles.eventAuthor}>
          {getHistoryShortTitle(history)}
        </div>

        <div className={styles.eventDate}>
          Le {formatDate(history.updated_at)} à {formatTime(history.updated_at)}
          <br />
          par {displayAuthor(history)}
        </div>
        {history?.event?.origin?.type === 'import' && (
          <div className={styles.timelineDescription}>
            <span>
              {capitalized(history.event?.origin?.type)} automatique de la{' '}
              {history.event?.origin?.details?.imported_database}
            </span>
          </div>
        )}
        {history.event.type === 'update' &&
          history.event?.details?.updated_fields && (
            <div>
              <span className={`${styles.timelineDescriptionTitle}`}>
                Modifications :{' '}
              </span>
              <span className={`${styles.timelineDescription}`}>
                {addDashToFields(history.event?.details.updated_fields)}
              </span>
            </div>
          )}
      </button>
    </div>
  );
}

function selectIcon(type: string): string {
  if (type === 'merge') return mergeBuildingImage.src;
  if (type === 'creation') return createBuildingImage.src;
  if (type === 'update') return updateBuildingImage.src;
  if (type === 'split') return splitBuildingImage.src;
  if (type === 'deactivation') return disableBuildingImage.src;
  return activateBuildingImage.src;
}
function capitalized(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}
function formatFields(field: string): string {
  if (field === 'status') return 'statut';
  if (field === 'shape') return 'forme';
  if (field === 'addresses') return 'adresses';
  if (field === 'ext_ids') return 'identifiants externes';
  return field;
}
function addDashToFields(fields: string[]): string {
  return fields.map((field: string) => formatFields(field)).join(' - ');
}
