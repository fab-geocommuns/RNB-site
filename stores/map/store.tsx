'use client';

import { configureStore } from '@reduxjs/toolkit';
import { mapActions, mapReducer } from '@/stores/map/slice';

export const store = configureStore({
  reducer: mapReducer,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const Actions = {
  map: mapActions,
};
