'use client';

import {
  createListenerMiddleware,
  createSlice,
  ListenerEffectAPI,
  PayloadAction,
} from '@reduxjs/toolkit';
import { Actions, AppDispatch, RootState } from '../store';
import { BuildingStatusType } from '../contribution/contribution-types';
import { BuildingAddress } from '../map/map-slice';
import { BuildingAddressType } from '@/components/contribution/types';

export type Operation = null | 'create' | 'update' | 'split' | 'merge';
export type ShapeInteractionMode = null | 'drawing' | 'updating';
export type ToasterInfos = {
  state: null | 'success' | 'error';
  message: string;
};

export type MergeInfos = {
  candidates: string[];
};

export type SplitInfos = {
  splitCandidateId: string | null;
  // where is the split candidate located ? Used for address search
  location: [number, number] | null;
  childrenNumber: number;
  currentChildSelected: number | null;
  children: SplitChild[];
};

export type SplitChild = {
  status: BuildingStatusType;
  shape: GeoJSON.Geometry | null;
  addresses: BuildingAddressType[];
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
  split: SplitInfos;
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
  },
  split: {
    splitCandidateId: null,
    location: null,
    currentChildSelected: null,
    childrenNumber: 2,
    children: [],
  },
};

export const editionSlice = createSlice({
  name: 'edition',
  initialState,
  reducers: {
    reset(state) {
      state.updateCreate.shapeInteractionMode = null;
      state.updateCreate.buildingNewShape = null;
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
    setSplitCandidateAndLocation(
      state,
      action: PayloadAction<{ rnb_id: string; location: [number, number] }>,
    ) {
      state.split.splitCandidateId = action.payload.rnb_id;
      state.split.location = action.payload.location;
    },
    setSplitChildrenNumber(state, action: PayloadAction<number>) {
      const n = action.payload;
      state.split.childrenNumber = n;
      state.split.children = Array(n)
        .fill({})
        .map((_item) => ({
          status: 'constructed',
          shape: null,
          addresses: [],
        }));
    },
    setCurrentChildSelected(state, action: PayloadAction<number | null>) {
      state.split.currentChildSelected = action.payload;
    },
    setSplitChildStatus(state, action: PayloadAction<BuildingStatusType>) {
      if (state.split.currentChildSelected) {
        state.split.children[state.split.currentChildSelected].status =
          action.payload;
      }
    },
    setSplitAddresses(state, action: PayloadAction<BuildingAddressType[]>) {
      if (state.split.currentChildSelected) {
        state.split.children[state.split.currentChildSelected].addresses =
          action.payload;
      }
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
