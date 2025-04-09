'use client';

import { configureStore } from '@reduxjs/toolkit';
import { mapActions, mapReducer } from '@/stores/map/map-slice';
import { appActions, appReducer } from '@/stores/app/app-slice';

export const store = configureStore({
  devTools: true,
  reducer: {
    map: mapReducer,
    app: appReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const Actions = {
  map: mapActions,
  app: appActions,
};
