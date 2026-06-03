import { RootState } from '@/stores/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { SRC_REPORTS, setDisplayedReportFilters } from '../layers/reports';

export const useMapStateSyncReport = (map?: maplibregl.Map) => {
  const selectedReportId = useSelector(
    (state: RootState) => (state.report.selectedReport?.id as number) ?? null,
  );
  const [previousSelectedReportId, setPreviousSelectedReportId] = useState<
    number | null
  >(null);

  const displayedTags = useSelector((state: any) => state.report.displayedTags);

  const lastReportUpdate = useSelector(
    (state: RootState) => state.report.lastReportUpdate,
  );

  const unselectReport = (reportId: number) => {
    if (map?.getSource(SRC_REPORTS)) {
      map.setFeatureState(
        {
          source: SRC_REPORTS,
          sourceLayer: 'default',
          id: reportId,
        },
        { in_panel: false },
      );
    }
  };

  const selectReport = (reportId: number) => {
    if (map?.getSource(SRC_REPORTS)) {
      map.setFeatureState(
        {
          source: SRC_REPORTS,
          sourceLayer: 'default',
          id: reportId,
        },
        { in_panel: true },
      );
    }
  };

  useEffect(() => {
    // No map yet? Nothing to do
    if (!map) return;

    if (previousSelectedReportId !== selectedReportId) {
      if (previousSelectedReportId) {
        unselectReport(previousSelectedReportId);
      }

      if (selectedReportId) {
        selectReport(selectedReportId);
      }

      setPreviousSelectedReportId(selectedReportId);
    }
  }, [selectedReportId]);

  useEffect(() => {
    if (map?.getSource(SRC_REPORTS)) {
      // @ts-ignore
      map.getSource(SRC_REPORTS).setSourceProperty(() => {});
    }
  }, [lastReportUpdate]);

  useEffect(() => {
    if (!map) return;
    setDisplayedReportFilters(map, displayedTags, selectedReportId);
  }, [map, displayedTags, selectedReportId]);
};
