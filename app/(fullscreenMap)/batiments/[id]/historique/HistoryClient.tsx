'use client';
import { useState, useEffect } from 'react';
import styles from '@/styles/history.module.scss';
import Timeline from '@/components/history/Timeline';
import Details from '@/components/history/Details';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import { ApiHistoryItem } from './page';
import Bus from '@/utils/Bus';

interface HistoryClientProps {
  buildingData: ApiHistoryItem[];
  id: string;
}

export default function HistoryClient({
  buildingData,
  id,
}: HistoryClientProps) {
  const [detailsInfo, setDetailsInfo] = useState<ApiHistoryItem>(
    buildingData[0],
  );
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [responsivePanelIsOpen, setResponsivePanelIsOpen] =
    useState<boolean>(true);
  const dispatch: AppDispatch = useDispatch();
  // Function to find event by ID and select it
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

  // Handle hash change and initial load
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1); // Remove the # symbol
      if (hash) {
        const success = selectEventById(hash);
        if (!success) {
          console.warn(`Event with ID ${hash} not found in building history`);
        }
      }
    };

    // Create a proper event listener function for the Bus
    const handleRnbidSearch = (searchId: string) => {
      // Handle the rnbid:search event if needed
      console.log('Received rnbid:search event for:', searchId);
    };

    dispatch(Actions.map.selectBuilding(id));
    Bus.on('rnbid:search', handleRnbidSearch);

    // Check hash on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Cleanup function
    return () => {
      Bus.off('rnbid:search', handleRnbidSearch);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [buildingData]);

  const handleTimelineItemClick = (index: number) => {
    setSelectedIndex(index);
    setDetailsInfo(buildingData[index]);

    // Update URL hash with event ID
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
        />
      </div>
    </div>
  );
}
