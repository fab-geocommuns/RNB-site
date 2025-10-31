import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { mockFetchReportById } from '@/components/map/report/mock';

export type ReportStore = {
  filtersDrawerOpen: boolean;
  selectedReport: GeoJSON.Feature | null;
};

const initialState: ReportStore = {
  filtersDrawerOpen: true,
  selectedReport: null,
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
  async (reportId: string | null, { dispatch }) => {
    if (reportId) {
      const report = await mockFetchReportById(reportId);
      console.log('Fetched report:', report);
      return report;
    }
  },
);

export const reportReducer = reportSlice.reducer;
export const reportActions = {
  ...reportSlice.actions,
  selectReport,
};
