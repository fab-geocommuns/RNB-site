'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchReport } from '@/utils/requests';
import { Report } from '@/types/report';
import {
  getArrayQueryParam,
  setArrayQueryParam,
  setQueryParam,
  removeQueryParam,
} from '@/utils/queryParams';

export type ReportStore = {
  filtersDrawerOpen: boolean;
  selectedReport: Report | null;
  lastReportUpdate: number;
  displayedTags: 'all' | number[];
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

export const reportReducer = reportSlice.reducer;
export const reportActions = {
  ...reportSlice.actions,
  selectReport,
  setDisplayedTags,
};
