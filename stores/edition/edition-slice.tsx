'use client';

import {
  createListenerMiddleware,
  createSlice,
  ListenerEffectAPI,
  PayloadAction,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { Actions, AppDispatch, RootState } from '../store';
import { BuildingStatusType } from '../contribution/contribution-types';
import { BuildingAddressType } from '@/components/contribution/types';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { fetchBuilding } from '@/utils/requests';

export type Operation = null | 'create' | 'update' | 'split' | 'merge';
export type ShapeInteractionMode = null | 'drawing' | 'updating';
export type ToasterInfos = {
  state: null | 'success' | 'error';
  message: string;
};
export type MergeCandidate = { rnb_id: string; data: SelectedBuilding };

export type MergeInfos = {
  candidates: MergeCandidate[];
  newBuilding: SelectedBuilding | null;
};

export type SplitInfos = {
  splitCandidateId: string | null;
  // where is the split candidate located ? Used for address search
  location: [number, number] | null;
  selectedChildIndex: number | null;
  children: SplitChild[];
};

export type SplitChild = {
  status: BuildingStatusType;
  shape: GeoJSON.Geometry | null;
  shapeId: string | null | undefined | number;
  addresses: BuildingAddressType[];
};

const createEmptySplitChildren = (n: number): SplitChild[] => {
  return Array(n)
    .fill({})
    .map((_item) => ({
      status: 'constructed',
      shape: null,
      shapeId: null,
      addresses: [],
    }));
};

export type EditionStore = {
  // data shared by all operations
  operation: Operation;
  toasterInfos: ToasterInfos;
  isLoading: boolean;

  updateCreate: {
    shapeInteractionMode: ShapeInteractionMode;
    buildingNewShape: GeoJSON.Geometry | null;
  };

  merge: MergeInfos;
  split: SplitInfos;

  // Summer challenge
  editMapSummerScoreUpdatedAt: number | null;
};
const initialState: EditionStore = {
  operation: null,
  toasterInfos: { state: null, message: '' },
  isLoading: false,
  updateCreate: {
    shapeInteractionMode: null,
    buildingNewShape: null,
  },
  merge: {
    candidates: [],
    newBuilding: null,
  },
  split: {
    splitCandidateId: null,
    location: null,
    selectedChildIndex: null,
    children: createEmptySplitChildren(2),
  },

  // Summer challenge
  editMapSummerScoreUpdatedAt: null,
};

export const editionSlice = createSlice({
  name: 'edition',
  initialState,
  reducers: {
    reset(state) {
      state.updateCreate.shapeInteractionMode = null;
      state.updateCreate.buildingNewShape = null;
      state.merge.candidates = [];
      state.merge.newBuilding = null;
      state.split.selectedChildIndex = null;
      state.split.children = createEmptySplitChildren(2);
      state.split.location = null;
      state.split.splitCandidateId = null;
    },
    setCandidates(state, action: PayloadAction<MergeCandidate[]>) {
      state.merge.candidates = action.payload;
    },
    setRemoveCandidate(state, action: PayloadAction<string>) {
      const candidates: MergeCandidate[] = state.merge.candidates.filter(
        (item: MergeCandidate) => item.rnb_id !== action.payload,
      );
      state.merge.candidates = candidates;
    },
    setNewBuilding(state, action: PayloadAction<SelectedBuilding | null>) {
      state.merge.newBuilding = action.payload;
    },
    setOperation(state, action: PayloadAction<Operation>) {
      state.operation = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
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
    setSummerChallengeBadgeUpdatedAt(
      state,
      action: PayloadAction<number | null>,
    ) {
      state.editMapSummerScoreUpdatedAt = action.payload;
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
      state.split.children = createEmptySplitChildren(n);
    },
    setCurrentChildSelected(state, action: PayloadAction<number | null>) {
      const selectedChildIndex = action.payload;
      state.split.selectedChildIndex = selectedChildIndex;
      if (
        selectedChildIndex !== null &&
        state.split.selectedChildIndex !== state.split.children.length
      ) {
        if (state.split.children[selectedChildIndex].shapeId) {
          state.updateCreate.shapeInteractionMode = 'updating';
        } else {
          state.updateCreate.shapeInteractionMode = 'drawing';
        }
      }
    },
    setSplitChildStatus(state, action: PayloadAction<BuildingStatusType>) {
      if (state.split.selectedChildIndex !== null) {
        state.split.children[state.split.selectedChildIndex].status =
          action.payload;
      }
    },
    setSplitChildAddresses(
      state,
      action: PayloadAction<BuildingAddressType[]>,
    ) {
      if (state.split.selectedChildIndex !== null) {
        state.split.children[state.split.selectedChildIndex].addresses =
          action.payload;
      }
    },
    setSplitChildBuildingShape(
      state,
      action: PayloadAction<{
        shape: GeoJSON.Geometry;
        shapeId: string | undefined | number;
      }>,
    ) {
      if (state.split.selectedChildIndex !== null) {
        state.split.children[state.split.selectedChildIndex].shape =
          action.payload.shape;
        state.split.children[state.split.selectedChildIndex].shapeId =
          action.payload.shapeId;
      }
    },
    updateSplitBuildingShape(
      state,
      action: PayloadAction<{
        shape: GeoJSON.Geometry;
        shapeId: string | undefined | number;
      }>,
    ) {
      if (state.split.selectedChildIndex !== null) {
        const childIndex = state.split.children.findIndex(
          (child) => child.shapeId === action.payload.shapeId,
        );
        state.split.children[childIndex].shape = action.payload.shape;
      }
    },
    setCurrentChildFromShapeId(
      state,
      action: PayloadAction<string | undefined | number>,
    ) {
      const shapeId = action.payload;
      const childIndex = state.split.children.findIndex(
        (child) => child.shapeId === shapeId,
      );
      if (childIndex >= 0) {
        state.split.selectedChildIndex = childIndex;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addOrRemoveCandidate.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addOrRemoveCandidate.fulfilled, (state, action) => {
        state.isLoading = false;
        state.merge.candidates = action.payload;
      })
      .addCase(addOrRemoveCandidate.rejected, (state, action) => {
        state.isLoading = false;
        state.toasterInfos = {
          state: 'error',
          message: 'Impossible de récupérer les informations de ce bâtiment',
        };
      });
  },
});

export const selectBuildingsAndSetMergeCandidates =
  (rnbId: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(Actions.map.unselectItem());
    if (!getState().edition.merge.newBuilding?.rnb_id) {
      dispatch(addOrRemoveCandidate(rnbId));
    }
  };

export const selectBuildingAndSetOperationUpdate =
  (rnbId: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const building = await dispatch(Actions.map.selectBuilding(rnbId));
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
        listenerApi.dispatch(Actions.map.unselectItem());
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
      case 'split':
        // in case user first click the building, then clicks on split action
        if (
          state.map.selectedItem &&
          state.map.selectedItem._type === 'building'
        ) {
          const building = state.map.selectedItem;
          listenerApi.dispatch(
            Actions.edition.setSplitCandidateAndLocation({
              rnb_id: building.rnb_id,
              location: building.point.coordinates,
            }),
          );
        }
        // now we can safely unselect the building
        listenerApi.dispatch(Actions.map.unselectItem());
      default:
        break;
    }
  },
});

export const addOrRemoveCandidate = createAsyncThunk<
  any,
  string,
  { state: RootState }
>(
  'edition/addOrRemoveCandidate',
  async (candidate_rnb_id: string, { getState }) => {
    let candidates = getState().edition.merge.candidates;
    const itemExist = candidates.some(
      (item: MergeCandidate) => item.rnb_id === candidate_rnb_id,
    );
    if (itemExist) {
      // remove candidate
      return candidates.filter(
        (item: MergeCandidate) => item.rnb_id !== candidate_rnb_id,
      );
    } else {
      // add candidate
      const building = await fetchBuilding(candidate_rnb_id);
      if (building) {
        candidates = [
          ...candidates,
          { rnb_id: candidate_rnb_id, data: building },
        ];
      }
      return candidates;
    }
  },
);

export const editionActions = editionSlice.actions;
export const editionReducer = editionSlice.reducer;
