import { RootState } from '@/stores/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  SRC_REPORTS,
  LAYER_REPORTS_CIRCLE,
  LAYER_REPORTS_ICON,
  LAYER_REPORTS_SMALL_CIRCLES,
} from '../useMapLayers';

export function setDisplayedReportFilters(
  map: maplibregl.Map,
  displayedTags: 'all' | number[],
  selectedReportId?: number,
) {
  const reportLayersSetup = [
    LAYER_REPORTS_CIRCLE,
    LAYER_REPORTS_ICON,
    LAYER_REPORTS_SMALL_CIRCLES,
  ].every((layer) => map?.getLayer(layer));
  if (!reportLayersSetup) return;
  // We want to show only some reports given by vector tiles.
  // We can either show the selected report, or the pending reports with the right tags.
  let filters = ['any'] as any;

  // First possibility: a report is selected
  if (selectedReportId) {
    filters.push(['==', ['get', 'id'], selectedReportId]);
  }

  // Second possibility: we want to show pending reports with the right tags
  let catFilter = ['all', ['==', ['get', 'status'], 'pending']];
  if (displayedTags !== 'all') {
    let tagFilters = ['any'] as any;

    displayedTags.forEach((tagId: number) => {
      const singleTagFilter = ['in', tagId.toString(), ['get', 'tag_ids']];
      tagFilters.push(singleTagFilter);
    });

    catFilter.push(tagFilters);
  }

  filters.push(catFilter);

  map?.setFilter(LAYER_REPORTS_CIRCLE, filters);
  map?.setFilter(LAYER_REPORTS_ICON, filters);
  map?.setFilter(LAYER_REPORTS_SMALL_CIRCLES, filters);
}

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
