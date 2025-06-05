'use client';

import {
  createListenerMiddleware,
  createSlice,
  ListenerEffect,
  ListenerEffectAPI,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Actions, AppDispatch, RootState } from '../store';
import { SelectedBuilding } from '@/stores/map/map-slice';

export type Operation = null | 'create' | 'update' | 'split' | 'merge';
export type ShapeInteractionMode = null | 'drawing' | 'updating';
export type ToasterInfos = {
  state: null | 'success' | 'error';
  message: string;
};

export type MergeInfos = {
  candidates: SelectedBuilding[];
  candidateToremove: SelectedBuilding | null;
};

export type EditionStore = {
  // data shared by all operations
  operation: Operation;
  toasterInfos: ToasterInfos;

  updateCreate: {
    shapeInteractionMode: ShapeInteractionMode;
    buildingNewShape: GeoJSON.Geometry | null;
  };

  merge: MergeInfos;
  // split: SplitInfos;
};

const initialState: EditionStore = {
  operation: null,
  toasterInfos: { state: null, message: '' },
  updateCreate: {
    shapeInteractionMode: null,
    buildingNewShape: null,
  },
  merge: {
    candidates: [],
    candidateToremove: null,
  },
};

export const editionSlice = createSlice({
  name: 'edition',
  initialState,
  reducers: {
    resetCandidates(state) {
      state.merge.candidates = [];
      state.merge.candidateToremove = null;
    },
    reset(state) {
      state.updateCreate.shapeInteractionMode = null;
      state.updateCreate.buildingNewShape = null;
    },
    setCandidates(
      state,
      action: PayloadAction<{
        candidates: SelectedBuilding[];
        candidateToremove: SelectedBuilding;
      }>,
    ) {
      state.merge = action.payload;
    },
    setOperation(state, action: PayloadAction<Operation>) {
      state.operation = action.payload;
    },
    setShapeInteractionMode(
      state,
      action: PayloadAction<ShapeInteractionMode>,
    ) {
      state.updateCreate.shapeInteractionMode = action.payload;
    },
    setBuildingNewShape(state, action: PayloadAction<GeoJSON.Geometry | null>) {
      state.updateCreate.buildingNewShape = action.payload;
    },
    setToasterInfos(state, action: PayloadAction<ToasterInfos>) {
      state.toasterInfos = action.payload;
    },
  },
});

export const selectBuildingAndSetOperationUpdate =
  (rnb_properties: {
    contributions: number;
    is_active: boolean;
    rnb_id: string;
    status: string;
  }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    let building;
    if (getState().edition.operation !== 'merge') {
      building = await dispatch(
        Actions.map.selectBuilding(rnb_properties.rnb_id),
      );
      dispatch(Actions.edition.setOperation('update'));
    } else {
      building = rnb_properties;
      dispatch(Actions.edition.setOperation('merge'));
      dispatch(
        Actions.edition.setCandidates(
          formatCandidates(rnb_properties, getState().edition.merge.candidates),
        ),
      );
    }
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
      case 'merge':
        // listenerApi.dispatch(Actions.map.unselectItem());
        listenerApi.dispatch(
          Actions.edition.setShapeInteractionMode('updating'),
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

function formatCandidates(
  candidate: SelectedBuilding,
  candidates: SelectedBuilding[],
) {
  const itemExist = candidates.some(
    (item: SelectedBuilding) => item.rnb_id === candidate.rnb_id,
  );
  if (itemExist) {
    return {
      candidates: candidates.filter(
        (item: SelectedBuilding) => item.rnb_id !== candidate.rnb_id,
      ),
      candidateToremove: candidate,
    };
  } else
    return {
      candidates: [...candidates, candidate],
      candidateToremove: null,
    };
}

export const editionActions = editionSlice.actions;
export const editionReducer = editionSlice.reducer;
