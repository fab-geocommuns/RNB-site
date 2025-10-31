'use client';

import { configureStore } from '@reduxjs/toolkit';
import { mapActions, mapReducer } from '@/stores/map/map-slice';
import { appActions, appReducer } from '@/stores/app/app-slice';
import { editionActions, editionReducer } from '@/stores/edition/edition-slice';
import { reportActions, reportReducer } from '@/stores/report/report-slice';
import { listenerMiddleware } from '@/stores/edition/edition-slice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    app: appReducer,
    edition: editionReducer,
    report: reportReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const Actions = {
  map: mapActions,
  app: appActions,
  edition: editionActions,
  report: reportActions,
};
