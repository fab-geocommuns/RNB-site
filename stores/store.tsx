'use client';

import { configureStore } from '@reduxjs/toolkit';
import { mapActions, mapReducer } from '@/stores/map/map-slice';
import { appActions, appReducer } from '@/stores/app/app-slice';
import { listenerMiddleware } from '@/stores/map/map-slice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    app: appReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const Actions = {
  map: mapActions,
  app: appActions,
};
