'use client';

import {
  createListenerMiddleware,
  createSlice,
  ListenerEffect,
  ListenerEffectAPI,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Actions, AppDispatch, RootState } from '../store';

export type Operation = null | 'create' | 'update' | 'split' | 'merge';
export type ShapeInteractionMode = null | 'drawing' | 'updating';
export type ToasterInfos = {
  state: null | 'success' | 'error';
  message: string;
};

export type EditionStore = {
  operation: Operation;
  shapeInteractionMode: ShapeInteractionMode;
  buildingNewShape: GeoJSON.Geometry | null;
  toasterInfos: ToasterInfos;
};

const initialState: EditionStore = {
  operation: null,
  shapeInteractionMode: null,
  buildingNewShape: null,
  toasterInfos: { state: null, message: '' },
};

export const editionSlice = createSlice({
  name: 'edition',
  initialState,
  reducers: {
    reset(state) {
      state.shapeInteractionMode = null;
      state.buildingNewShape = null;
    },
    setOperation(state, action: PayloadAction<Operation>) {
      state.operation = action.payload;
    },
    setShapeInteractionMode(
      state,
      action: PayloadAction<ShapeInteractionMode>,
    ) {
      state.shapeInteractionMode = action.payload;
    },
    setBuildingNewShape(state, action: PayloadAction<GeoJSON.Geometry | null>) {
      state.buildingNewShape = action.payload;
    },
    setToasterInfos(state, action: PayloadAction<ToasterInfos>) {
      state.toasterInfos = action.payload;
    },
  },
});

export const selectBuildingAndSetOperationUpdate =
  (rnb_id: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const building = await dispatch(Actions.map.selectBuilding(rnb_id));
    dispatch(Actions.edition.setOperation('update'));
    return building;
  };

// Create d'un middleware pour réagir aux changements du store
export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
  actionCreator: editionSlice.actions.setOperation,
  effect: async (
    action: PayloadAction<Operation>,
    listenerApi: ListenerEffectAPI<RootState, AppDispatch>,
  ) => {
    const state = listenerApi.getState();
    const operation = state.edition.operation;

    // a chaque changement d'operation, on reset le store
    await listenerApi.dispatch(Actions.edition.reset());

    // en fonction de l'opération nouvellement selectionnée, on dispatch des actions spécifiques
    switch (operation) {
      case null:
        break;
      case 'create':
        listenerApi.dispatch(Actions.map.unselectItem());
        listenerApi.dispatch(
          Actions.edition.setShapeInteractionMode('drawing'),
        );
        break;
      case 'update':
        if (state.map.selectedItem?._type === 'building') {
          if (state.map.selectedItem.shape.type === 'Point') {
            listenerApi.dispatch(Actions.edition.setShapeInteractionMode(null));
          } else {
            listenerApi.dispatch(
              Actions.edition.setShapeInteractionMode('updating'),
            );
          }
        }
        break;
      default:
        break;
    }
  },
});

export const editionActions = editionSlice.actions;
export const editionReducer = editionSlice.reducer;
