import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import {
  LAYER_REPORTS_CIRCLE,
  SRC_REPORTS,
  getReportIdsAtPoint,
  setDisplayedReportFilters,
} from '../layers/reports';

export const useMapStateSyncReport = (map?: maplibregl.Map) => {
  const dispatch: AppDispatch = useDispatch();
  const store = useStore<RootState>();
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

  // Returns whether the selected report was rendered, hence its group computed
  const refreshReportIdsAtPoint = useCallback(() => {
    // Read at idle time: another report may have been selected meanwhile
    const selectedReportId = store.getState().report.selectedReport?.id;
    if (!map || !selectedReportId || !map.getLayer(LAYER_REPORTS_CIRCLE)) {
      return false;
    }
    const [selectedReport] = map.queryRenderedFeatures({
      layers: [LAYER_REPORTS_CIRCLE],
      filter: ['==', ['get', 'id'], selectedReportId],
    });
    if (!selectedReport) return false;
    dispatch(
      Actions.report.setReportIdsAtPoint(
        getReportIdsAtPoint({ map, report: selectedReport }),
      ),
    );
    return true;
  }, [map, dispatch, store]);

  useEffect(() => {
    if (!map?.getSource(SRC_REPORTS)) return;
    // @ts-ignore
    map.getSource(SRC_REPORTS).setSourceProperty(() => {});

    // Reports created or closed at the selected report's point change its group
    map.once('idle', refreshReportIdsAtPoint);
    return () => {
      map.off('idle', refreshReportIdsAtPoint);
    };
  }, [map, refreshReportIdsAtPoint, lastReportUpdate]);

  // A report opened by link comes without its group: computed once it is rendered
  useEffect(() => {
    if (!map || !selectedReportId) return;
    if (store.getState().report.reportIdsAtPoint.includes(selectedReportId)) {
      return;
    }
    const onIdle = () => {
      if (refreshReportIdsAtPoint()) map.off('idle', onIdle);
    };
    map.on('idle', onIdle);
    return () => {
      map.off('idle', onIdle);
    };
  }, [map, store, refreshReportIdsAtPoint, selectedReportId]);

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
