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
export type MergeCandidate = { rnbId: string; data: SelectedBuilding };

export type MergeInfos = {
  candidates: MergeCandidate[];
  newBuilding: SelectedBuilding | null;
};

export type CutLine = {
  geometry: GeoJSON.Geometry;
  featureId: string | number | undefined;
};

export type SplitInfos = {
  splitCandidateId: string | null;
  // where is the split candidate located ? Used for address search
  location: [number, number] | null;
  selectedChildIndex: number | null;
  children: SplitChild[];
  // New fields for cut-based split
  cutLines: CutLine[];
  candidateShape: GeoJSON.Geometry | null;
  cutStep: 'drawing' | 'done';
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
    children: [],
    cutLines: [],
    candidateShape: null,
    cutStep: 'drawing',
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
      state.split.children = [];
      state.split.location = null;
      state.split.splitCandidateId = null;
      state.split.cutLines = [];
      state.split.candidateShape = null;
      state.split.cutStep = 'drawing';
      state.isLoading = false;
    },
    setCandidates(state, action: PayloadAction<MergeCandidate[]>) {
      state.merge.candidates = action.payload;
    },
    setRemoveCandidate(state, action: PayloadAction<string>) {
      const candidates: MergeCandidate[] = state.merge.candidates.filter(
        (item: MergeCandidate) => item.rnbId !== action.payload,
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
    setCurrentChildSelected(state, action: PayloadAction<number | null>) {
      state.split.selectedChildIndex = action.payload;
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
    // Cut-based split actions
    setCandidateShape(state, action: PayloadAction<GeoJSON.Geometry>) {
      state.split.candidateShape = action.payload;
    },
    addCutLine(
      state,
      action: PayloadAction<{
        geometry: GeoJSON.Geometry;
        featureId: string | number | undefined;
      }>,
    ) {
      state.split.cutLines.push({
        geometry: action.payload.geometry,
        featureId: action.payload.featureId,
      });
    },
    removeCutLine(state, action: PayloadAction<string | number | undefined>) {
      state.split.cutLines = state.split.cutLines.filter(
        (line) => line.featureId !== action.payload,
      );
    },
    removeLastCutLine(state) {
      state.split.cutLines.pop();
    },
    clearCutLines(state) {
      state.split.cutLines = [];
    },
    setCutStep(state, action: PayloadAction<'drawing' | 'done'>) {
      state.split.cutStep = action.payload;
    },
    validateCut(
      state,
      action: PayloadAction<GeoJSON.Feature<GeoJSON.Polygon>[]>,
    ) {
      // Create children from the computed sub-polygons
      state.split.children = action.payload.map((feature) => ({
        status: 'constructed' as BuildingStatusType,
        shape: feature.geometry,
        addresses: [],
      }));
      state.split.cutStep = 'done';
      state.split.selectedChildIndex = 0;
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
          // Fetch precise shape from API
          const fetched = await fetchBuilding(building.rnb_id);
          if (fetched?.shape) {
            listenerApi.dispatch(
              Actions.edition.setCandidateShape(fetched.shape),
            );
          }
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
  async (candidateRnbId: string, { getState }) => {
    let candidates = getState().edition.merge.candidates;
    const itemExist = candidates.some(
      (item: MergeCandidate) => item.rnbId === candidateRnbId,
    );
    if (itemExist) {
      // remove candidate
      return candidates.filter(
        (item: MergeCandidate) => item.rnbId !== candidateRnbId,
      );
    } else {
      // add candidate
      const building = await fetchBuilding(candidateRnbId);
      if (building) {
        candidates = [...candidates, { rnbId: candidateRnbId, data: building }];
      }
      return candidates;
    }
  },
);

export const editionActions = editionSlice.actions;
export const editionReducer = editionSlice.reducer;
