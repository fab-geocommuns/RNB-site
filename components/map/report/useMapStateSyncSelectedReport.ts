import { RootState } from '@/stores/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { SRC_REPORTS } from '../useMapLayers';

export const useMapStateSyncSelectedReport = (map?: maplibregl.Map) => {
  const selectedReportId = useSelector(
    (state: RootState) => (state.report.selectedReport?.id as number) ?? null,
  );
  const [previousSelectedReportId, setPreviousSelectedReportId] = useState<
    number | null
  >(null);

  const unselect = (reportId: number) => {
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

  const select = (reportId: number) => {
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
        unselect(previousSelectedReportId);
      }

      if (selectedReportId) {
        select(selectedReportId);
      }

      setPreviousSelectedReportId(selectedReportId);
    }
  }, [selectedReportId]);
};
