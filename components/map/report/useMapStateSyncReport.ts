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
  const showClosedReports = useSelector(
    (state: RootState) => state.report.showClosedReports,
  );

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
        { highlighted: false },
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
        { highlighted: true },
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
    const syncReportLayers = () =>
      setDisplayedReportFilters({
        map,
        displayedTags,
        showClosedReports,
        selectedReportId,
      });
    syncReportLayers();

    // A layers change reinstalls the reports source, losing its filters and feature states
    const onReportsSourceLoaded = (e: maplibregl.MapSourceDataEvent) => {
      if (e.sourceId !== SRC_REPORTS || e.sourceDataType !== 'metadata') return;
      // Also fired by removeSource, once the source is gone
      if (!map.getSource(SRC_REPORTS)) return;
      syncReportLayers();
      if (selectedReportId) selectReport(selectedReportId);
    };
    map.on('sourcedata', onReportsSourceLoaded);
    return () => {
      map.off('sourcedata', onReportsSourceLoaded);
    };
  }, [map, displayedTags, showClosedReports, selectedReportId]);
};
