'use client';

import { createSlice } from '@reduxjs/toolkit';

export type AppStore = {};

const initialState: AppStore = {};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {},
});

export const appActions = {
  ...appSlice.actions,
};

export const appReducer = appSlice.reducer;
