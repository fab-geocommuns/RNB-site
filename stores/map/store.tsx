'use client';

import { combineReducers, configureStore } from '@reduxjs/toolkit';
import mapReducer from './slice';

export const store = configureStore({
  reducer: mapReducer,
});
