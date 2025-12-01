import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { fetchReport } from '@/utils/requests';
import { Report } from '@/types/report';

export type ReportStore = {
  filtersDrawerOpen: boolean;
  selectedReport: Report | null;
  lastReportUpdate: number;
  displayedTags: 'all' | number[];
};

const initialState: ReportStore = {
  filtersDrawerOpen: true,
  selectedReport: null,
  lastReportUpdate: Date.now(),
  displayedTags: 'all',
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
    setDisplayedTags(state, action) {
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
      return await fetchReport(Number(reportId));
    }
  },
);

export const reportReducer = reportSlice.reducer;
export const reportActions = {
  ...reportSlice.actions,
  selectReport,
};
