'use client';
import { useState, useEffect } from 'react';
import styles from '@/styles/history.module.scss';
import Timeline from '@/components/history/Timeline';
import Details from '@/components/history/Details';
import { ApiHistoryItem, EditionAnnotation } from './page';
import { RNBGroup, useRNBAuthentication } from '@/utils/useRNBAuthentication';

type HistoryClientProps = {
  buildingData: ApiHistoryItem[];
  id: string;
};

type AnnotationsByEvent = Record<string, EditionAnnotation[]>;

function initialAnnotationsByEvent(
  buildingData: ApiHistoryItem[],
): AnnotationsByEvent {
  const map: AnnotationsByEvent = {};
  for (const item of buildingData) {
    if (item.event?.id) {
      map[item.event.id] = item.event.annotations ?? [];
    }
  }
  return map;
}

export default function HistoryClient({
  buildingData,
  id,
}: HistoryClientProps) {
  const { is, user } = useRNBAuthentication();
  const isReviewer = is(RNBGroup.REVIEWERS);

  const [detailsInfo, setDetailsInfo] = useState<ApiHistoryItem>(
    buildingData[0],
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [responsivePanelIsOpen, setResponsivePanelIsOpen] =
    useState<boolean>(true);
  const [annotationsByEvent, setAnnotationsByEvent] =
    useState<AnnotationsByEvent>(() => initialAnnotationsByEvent(buildingData));

  const handleAnnotationsChange = (
    eventId: string,
    next: EditionAnnotation[],
  ) => {
    setAnnotationsByEvent((prev) => ({ ...prev, [eventId]: next }));
  };
  const selectEventById = (eventId: string) => {
    const eventIndex = buildingData.findIndex(
      (item) => item.event.id === eventId,
    );
    if (eventIndex !== -1) {
      setSelectedIndex(eventIndex);
      setDetailsInfo(buildingData[eventIndex]);
      return true;
    }
    return false;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const success = selectEventById(hash);
        if (!success) {
          console.warn(`Event with ID ${hash} not found in building history`);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [buildingData]);

  const handleTimelineItemClick = (index: number) => {
    setSelectedIndex(index);
    setDetailsInfo(buildingData[index]);

    const eventId = buildingData[index].event.id;
    if (eventId) {
      window.history.replaceState(null, '', `#${eventId}`);
    }
  };

  return (
    <div className={`fr-container-fluid ${styles.container}`}>
      <div className={`fr-grid-row ${styles.mainGrid}`}>
        <Timeline
          timelineInfo={buildingData}
          id={id}
          responsiveTimelineIsOpen={!responsivePanelIsOpen}
          onTimelineItemClick={handleTimelineItemClick}
          selectedIndex={selectedIndex}
          isReviewer={isReviewer}
          annotationsByEvent={annotationsByEvent}
        />
        <button
          className={`${styles.responsiveButton} ${responsivePanelIsOpen ? styles.responsiveButtonInitial : styles.responsiveButtonClicked}`}
          onClick={() => {
            setResponsivePanelIsOpen(!responsivePanelIsOpen);
          }}
        >
          {responsivePanelIsOpen ? (
            <i className="fr-icon-arrow-left-s-line-double"></i>
          ) : (
            <i className="fr-icon-arrow-right-s-line-double"></i>
          )}
        </button>
        <Details
          detailsInfo={detailsInfo}
          responsivePanelIsOpen={responsivePanelIsOpen}
          isReviewer={isReviewer}
          annotations={
            detailsInfo.event?.id
              ? (annotationsByEvent[detailsInfo.event.id] ?? [])
              : []
          }
          currentUsername={user?.username}
          onAnnotationsChange={handleAnnotationsChange}
        />
      </div>
    </div>
  );
}
