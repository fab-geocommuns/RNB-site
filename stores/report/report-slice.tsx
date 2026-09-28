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
import type { AppDispatch, RootState } from '../store';

export type ReportStore = {
  filtersDrawerOpen: boolean;
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

const initialState: ReportStore = {
  filtersDrawerOpen: true,
  selectedReport: null,
  lastReportUpdate: Date.now(),
  displayedTags: getDisplayedTagsFromUrl(),
  showClosedReports: getQueryParam('report_closed') === '1',
  reportIdsAtPoint: [],
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    toggleFiltersDrawer(state) {
      state.filtersDrawerOpen = !state.filtersDrawerOpen;
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
