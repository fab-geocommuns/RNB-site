'use client';

import { createSlice } from '@reduxjs/toolkit';
import { AlertProps } from '@codegouvfr/react-dsfr/Alert';

type Alert = {
  id: string;
} & AlertProps;

export type AppStore = {
  alerts: Alert[];
};

const initialState: AppStore = {
  alerts: [],
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    _showAlert(state, action) {
      state.alerts.push(action.payload);
    },
    _hideAlert(state, action) {
      state.alerts = state.alerts.filter((a) => a.id !== action.payload);
    },
  },
});

export const showAlert =
  ({ alert, timeout = 5000 }: { alert: Alert; timeout?: number }) =>
  (dispatch: any) => {
    dispatch(appSlice.actions._showAlert(alert));
    setTimeout(() => {
      dispatch(appSlice.actions._hideAlert(alert.id));
    }, timeout);
  };

export const appActions = {
  ...appSlice.actions,
  showAlert,
};

export const appReducer = appSlice.reducer;
