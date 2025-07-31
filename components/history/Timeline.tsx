'use client';
import styles from '@/styles/history.module.scss';
import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import historyImage from '@/public/images/history/history.svg';
import Link from 'next/link';
import TimelineItem from './TimelineItem';

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
          <span className={styles.buildingId}>
            <Link href={`/carte?q=${id}`}>{id}</Link>
          </span>
        </h1>
      </div>

      <div className={styles.timeline}>
        {timelineInfo.map((history: ApiHistoryItem, index: number) => (
          <TimelineItem
            history={history}
            index={index}
            selectedIndex={selectedIndex}
            timelineLength={timelineInfo.length}
            onTimelineItemClick={onTimelineItemClick}
          />
        ))}
      </div>
    </section>
  );
}
