import { createSlice } from '@reduxjs/toolkit';

export type ReportStore = {
  filtersDrawerOpen: boolean;
};

const initialState: ReportStore = {
  filtersDrawerOpen: false,
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    toggleFiltersDrawer(state) {
      state.filtersDrawerOpen = !state.filtersDrawerOpen;
    },
    openFiltersDrawer(state) {
      state.filtersDrawerOpen = true;
    },
    closeFiltersDrawer(state) {
      state.filtersDrawerOpen = false;
    },
  },
});

export const reportReducer = reportSlice.reducer;
export const reportActions = reportSlice.actions;
