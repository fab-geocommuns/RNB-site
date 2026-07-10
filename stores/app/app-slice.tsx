'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AlertProps } from '@codegouvfr/react-dsfr/Alert';
import { Trophy } from '@/utils/trophies';

type Alert = {
  id: string;
} & AlertProps;

export type AppStore = {
  alerts: Alert[];
  // Trophées gagnés lors de la dernière action de l'utilisateur, à afficher
  // dans la modale de félicitations (cf. `TrophyWon`). Vidé = rien à montrer.
  wonTrophies: Trophy[];
};

const initialState: AppStore = {
  alerts: [],
  wonTrophies: [],
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
    setWonTrophies(state, action: PayloadAction<Trophy[]>) {
      state.wonTrophies = action.payload;
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
