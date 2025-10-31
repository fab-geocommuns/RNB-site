import { createSlice } from '@reduxjs/toolkit';

export type ReportStore = {
  filtersDrawerVisible: boolean;
};

const initialState: ReportStore = {
  filtersDrawerVisible: false,
};

export const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    showFiltersDrawer(state) {
      state.filtersDrawerVisible = true;
    },
    hideFiltersDrawer(state) {
      state.filtersDrawerVisible = false;
    },
  },
});
