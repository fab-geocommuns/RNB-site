'use client';

import { configureStore } from '@reduxjs/toolkit';
import { mapActions, mapReducer } from '@/stores/map/map-slice';
import { appActions, appReducer } from '@/stores/app/app-slice';
import {
  contributionActions,
  contributionReducer,
} from '@/stores/contribution/contribution-slice';

export const store = configureStore({
  reducer: {
    map: mapReducer,
    app: appReducer,
    contribution: contributionReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const Actions = {
  map: mapActions,
  app: appActions,
  contribution: contributionActions,
};
