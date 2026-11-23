'use client';

import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import { fetchReport } from '@/utils/requests';
import { Report } from '@/types/report';
import {
  getArrayQueryParam,
  getQueryParam,
  setArrayQueryParam,
  setQueryParam,
  removeQueryParam,
} from '@/utils/queryParams';
import { selectADS, selectBuilding } from '@/stores/map/map-slice';
import { editionActions } from '@/stores/edition/edition-slice';
import type { AppDispatch, RootState } from '../store';

export type ReportStore = {
  filtersDrawerOpen: boolean;
  // On mobile, the last panel opened between the reports one and the page's own one (building, edition) is shown
  reportPanelInFront: boolean;
  selectedReport: Report | null;
  lastReportUpdate: number;
  displayedTags: 'all' | number[];
  showClosedReports: boolean;
  reportIdsAtPoint: number[];
};

function getDisplayedTagsFromUrl() {
  return (
    getArrayQueryParam(
      'report_tags',
      (value) => parseInt(value, 10),
      (value) => !isNaN(value),
    ) || 'all'
  );
}

const displayedTags = getDisplayedTagsFromUrl();
const showClosedReports = getQueryParam('report_closed') === '1';

const initialState: ReportStore = {
  // A shared link that filters the map shows its filters
  filtersDrawerOpen: displayedTags !== 'all' || showClosedReports,
  reportPanelInFront: false,
  selectedReport: null,
  lastReportUpdate: Date.now(),
  displayedTags,
  showClosedReports,
  reportIdsAtPoint: [],
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    toggleFiltersDrawer(state) {
      state.filtersDrawerOpen = !state.filtersDrawerOpen;
      state.reportPanelInFront = state.filtersDrawerOpen;
      if (state.filtersDrawerOpen) {
        state.selectedReport = null;
        removeQueryParam('report');
      }
    },
    setSelectedReport(state, action) {
      state.selectedReport = action.payload;
    },
    setLastReportUpdate(state) {
      state.lastReportUpdate = Date.now();
    },
    setDisplayedTagsInStore(state, action) {
      state.displayedTags = action.payload;
    },
    setShowClosedReportsInStore(state, action: PayloadAction<boolean>) {
      state.showClosedReports = action.payload;
    },
    setReportIdsAtPoint(state, action: PayloadAction<number[]>) {
      state.reportIdsAtPoint = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(selectReport.fulfilled, (state, action) => {
      // In all cases, set the selected report
      state.selectedReport = action.payload || null;
      state.reportPanelInFront = Boolean(action.payload?.id);

      if (action.payload?.id) {
        // If there is something to show, open the details panel
        state.filtersDrawerOpen = false;
        // Update URL with report parameter
        setQueryParam('report', action.payload.id);
      } else {
        // Remove report parameter when no report is selected
        removeQueryParam('report');
      }
    });
    // The selected report opens its own building: that one stays behind the report
    builder.addCase(selectBuilding.fulfilled, (state, action) => {
      if (
        action.payload &&
        action.payload.rnb_id !== state.selectedReport?.rnb_id
      )
        state.reportPanelInFront = false;
    });
    builder.addCase(selectADS.fulfilled, (state, action) => {
      if (action.payload) state.reportPanelInFront = false;
    });
    // 'update' always follows a building selection, handled above
    builder.addCase(editionActions.setOperation, (state, action) => {
      if (action.payload !== null && action.payload !== 'update')
        state.reportPanelInFront = false;
    });
  },
});

export const selectReport = createAsyncThunk(
  'report/selectReport',
  async (reportId: number | null, { dispatch }) => {
    if (reportId) {
      return await fetchReport(reportId);
    }
  },
);

// Thunk to update displayedTags with URL persistence side-effect
export const setDisplayedTags =
  (displayedTags: 'all' | number[]) => (dispatch: any) => {
    // Update state
    dispatch(reportSlice.actions.setDisplayedTagsInStore(displayedTags));

    // Update URL as side-effect
    if (displayedTags !== 'all') {
      setArrayQueryParam('report_tags', displayedTags);
    } else {
      setArrayQueryParam('report_tags', []);
    }
  };

export const setShowClosedReports =
  (showClosedReports: boolean) => (dispatch: AppDispatch) => {
    dispatch(
      reportSlice.actions.setShowClosedReportsInStore(showClosedReports),
    );

    if (showClosedReports) {
      setQueryParam('report_closed', 1);
    } else {
      removeQueryParam('report_closed');
    }
  };

// Keeps the selected report when it is part of the clicked stack
export const selectReportAtPoint =
  (reportIds: number[]) =>
  (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(reportSlice.actions.setReportIdsAtPoint(reportIds));
    const selectedReportId = getState().report.selectedReport?.id;
    if (!selectedReportId || !reportIds.includes(selectedReportId)) {
      dispatch(selectReport(reportIds[0]));
    }
  };

export const reportReducer = reportSlice.reducer;
export const reportActions = {
  ...reportSlice.actions,
  selectReport,
  setDisplayedTags,
  setShowClosedReports,
  selectReportAtPoint,
};
