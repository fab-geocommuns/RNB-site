import { RootState } from '@/stores/store';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  SRC_REPORTS,
  LAYER_REPORTS_CIRCLE,
  LAYER_REPORTS_ICON,
  LAYER_REPORTS_SMALL_CIRCLES,
  getDefaultReportFilter,
} from '../useMapLayers';
import { FilterSpecification } from 'maplibre-gl';

export const useMapStateSyncSelectedReport = (map?: maplibregl.Map) => {
  const selectedReportId = useSelector(
    (state: RootState) => (state.report.selectedReport?.id as number) ?? null,
  );
  const [previousSelectedReportId, setPreviousSelectedReportId] = useState<
    number | null
  >(null);

  const displayedTags = useSelector((state: any) => state.report.displayedTags);

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
    if (
      map?.getLayer(LAYER_REPORTS_CIRCLE) &&
      map?.getLayer(LAYER_REPORTS_ICON) &&
      map?.getLayer(LAYER_REPORTS_SMALL_CIRCLES)
    ) {
      let filter = getDefaultReportFilter();

      if (displayedTags !== 'all') {
        let tagFilters = ['any'] as any;

        displayedTags.forEach((tagId: number) => {
          const singleTagFilter = ['in', tagId.toString(), ['get', 'tag_ids']];
          tagFilters.push(singleTagFilter);
        });

        filter.push(tagFilters);
      }

      map?.setFilter(LAYER_REPORTS_CIRCLE, filter);
      map?.setFilter(LAYER_REPORTS_ICON, filter);
      map?.setFilter(LAYER_REPORTS_SMALL_CIRCLES, filter);
    }
  }, [displayedTags]);
};
