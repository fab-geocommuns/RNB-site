'use client';
import styles from '@/styles/history.module.scss';
import mergeBuildingImage from '@/public/images/map/edition/merge.svg';
import createBuildingImage from '@/public/images/map/edition/create.svg';
import splitBuildingImage from '@/public/images/map/edition/split.svg';
import disableBuildingImage from '@/public/images/history/disable.svg';
import activateBuildingImage from '@/public/images/history/checked.svg';
import updateBuildingImage from '@/public/images/history/update.svg';
import historyImage from '@/public/images/history/history.svg';
import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';

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

// Helper function to format date
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) +
    ' - ' +
    date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  );
}

export default function TimelineHistory({
  timelineInfo,
  id,
  responsiveTimelineIsOpen,
  onTimelineItemClick,
  selectedIndex = 0,
}: {
  timelineInfo: ApiHistoryItem[];
  id: string;
  responsiveTimelineIsOpen: boolean;
  onTimelineItemClick?: (index: number) => void;
  selectedIndex?: number;
}) {
  return (
    <section
      className={`fr-col-12 fr-col-md-3 ${styles.sidebar} ${responsiveTimelineIsOpen ? styles.timelineSectionOpen : styles.timelineSectionClosed}`}
    >
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarH1}>
          <span className={styles.sidebarTitle}>
            <img src={historyImage.src} alt="" height="20" width="20" />
            Historique de l&apos;identifiant
          </span>
          <span className={styles.buildingId}>{id}</span>
        </h1>
      </div>

      <div className={styles.timeline}>
        {timelineInfo.map((history: ApiHistoryItem, index: number) => (
          <div key={index} className={styles.timelineItem}>
            {index < timelineInfo.length - 1 && (
              <div className={styles.timelineLine} />
            )}
            <div
              className={`${styles.timelineIcon} ${history.event.type === 'creation' ? styles.iconCreation : ''}`}
            >
              <img
                src={
                  history.event.type === 'merge'
                    ? mergeBuildingImage.src
                    : history.event.type === 'creation'
                      ? createBuildingImage.src
                      : history.event.type === 'update'
                        ? updateBuildingImage.src
                        : history.event.type === 'split'
                          ? splitBuildingImage.src
                          : history.event.type === 'deactivation'
                            ? disableBuildingImage.src
                            : activateBuildingImage.src
                }
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
              {history.event?.author?.username && (
                <div className={styles.eventAuthor}>
                  {history.event.author.username}
                </div>
              )}
              <div className={styles.eventDate}>
                {formatDate(history.updated_at)}
              </div>
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
              {history.event.type === 'creation' && (
                <div>
                  <span className={`${styles.timelineDescriptionTitle}`}>
                    Création du bâtiment
                  </span>
                </div>
              )}
              {history.event.type === 'merge' && (
                <div className={`${styles.timelineDescription}`}>
                  <div>
                    <span className={`${styles.timelineDescriptionTitle}`}>
                      Fusion des bâtiments :{' '}
                    </span>
                    <span>
                      {addDashToFields(history.event?.details?.merge_parents)}
                    </span>
                  </div>
                  <div>
                    <span className={`${styles.timelineDescriptionTitle}`}>
                      Bâtiment fusionné :{' '}
                    </span>
                    <span>{history.event?.details.merge_child}</span>
                  </div>
                </div>
              )}
              {history.event.type === 'split' && (
                <div className={`${styles.timelineDescription}`}>
                  <div>
                    <span className={`${styles.timelineDescriptionTitle}`}>
                      Scission du bâtiment :{' '}
                    </span>
                    <span>{history.event?.details.split_parent}</span>
                  </div>
                  <div>
                    <span className={`${styles.timelineDescriptionTitle}`}>
                      Bêtiment divisés :{' '}
                    </span>
                    <span>
                      {addDashToFields(history.event?.details?.split_children)}
                    </span>
                  </div>
                </div>
              )}
              {history.event.type === 'deactivation' && (
                <div className={`${styles.timelineDescriptionTitle}`}>
                  <span>Désactivation du bâtiment</span>
                </div>
              )}
              {history.event.type === 'reactivation' && (
                <div className={`${styles.timelineDescriptionTitle}`}>
                  <span>Réactivation du bâtiment</span>
                </div>
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
