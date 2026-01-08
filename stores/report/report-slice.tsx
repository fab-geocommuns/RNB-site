'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchReport } from '@/utils/requests';
import { Report } from '@/types/report';

export type ReportStore = {
  filtersDrawerOpen: boolean;
  selectedReport: Report | null;
  lastReportUpdate: number;
  displayedTags: 'all' | number[];
};

function getDisplayedTagsFromUrl() {
  // Check if we're in the browser (SSR-safe)
  if (typeof window === 'undefined') {
    return 'all';
  }

  const searchParams = new URLSearchParams(window.location.search);
  const reportTagsParams = searchParams.getAll('report_tags');
  const tagIds = reportTagsParams
    .map((id) => parseInt(id, 10))
    .filter((id) => !isNaN(id));
  if (tagIds.length === 0) {
    return 'all';
  }
  return tagIds;
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
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    // Remove existing report_tags params
    searchParams.delete('report_tags');

    // Add new report_tags params if not 'all'
    if (displayedTags !== 'all') {
      displayedTags.forEach((tagId) => {
        searchParams.append('report_tags', tagId.toString());
      });
    }

    // Update URL without reloading
    window.history.replaceState({}, '', url.toString());
  };

export const reportReducer = reportSlice.reducer;
export const reportActions = {
  ...reportSlice.actions,
  selectReport,
  setDisplayedTags,
};
