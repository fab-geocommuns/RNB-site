'use client';

import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
  createListenerMiddleware,
} from '@reduxjs/toolkit';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import { Actions, AppDispatch, RootState } from '../store';

export type BuildingAddress = {
  id: string; // Also BAN ID
  source: string;
  street_number: string;
  street_rep: string;
  street: string;
  city_name: string;
  city_zipcode: string;
  city_insee_code: string;
};

export interface SelectedBuilding {
  _type: 'building';
  rnb_id: string;
  status: BuildingStatusType;
  point: {
    type: 'Point';
    coordinates: [number, number];
  };
  shape: GeoJSON.Geometry;
  addresses: BuildingAddress[];
  ext_ids: any[];
  plots: any[];
  is_active: boolean;
}

export interface SelectedADS {
  _type: 'ads';
  file_number: string;
  decided_at: string;
  buildings_operations: BuildingADS[];
}

interface BuildingADS {
  rnb_id?: string;
  operation: 'build' | 'modify' | 'demolish';
}

export type SelectedItem = SelectedBuilding | SelectedADS;

export type MapLayers = {
  background: MapBackgroundLayer;
  buildings: MapBuildingsLayer;
  extraLayers: MapExtraLayer[];
};

export type MapBackgroundLayer =
  | 'satellite'
  | 'vectorOsm'
  | 'vectorIgnStandard';
export type MapBuildingsLayer = 'point' | 'polygon';
export type MapExtraLayer = 'ads' | 'plots';
export type MapLayer = MapBackgroundLayer | MapBuildingsLayer | MapExtraLayer;
export type Operation = null | 'create' | 'update' | 'split' | 'merge';
export type ShapeInteractionMode = null | 'drawing' | 'updating';
export type ToasterInfos = {
  state: null | 'success' | 'error';
  message: string;
};

export type MapStore = {
  addressSearch: {
    q?: string;
    results: any[];
    unknown_rnb_id: boolean;
  };
  moveTo?: {
    lat: number;
    lng: number;
    zoom: number;
    fly?: boolean;
    // "true" when the coordinates have been pushed by a moveend event from the map
    fromMapEvent: boolean;
  };
  marker?: [number, number];
  reloadBuildings?: number;
  selectedItem?: SelectedItem;
  layers: MapLayers;
  operation: Operation;
  shapeInteractionMode: ShapeInteractionMode;
  shapeInteractionCounter: number;
  buildingNewShape: GeoJSON.Geometry | null;
  toasterInfos: ToasterInfos;
};

const initialState: MapStore = {
  addressSearch: {
    results: [],
    unknown_rnb_id: false,
  },
  layers: {
    background: 'vectorIgnStandard',
    buildings: 'point',
    extraLayers: ['ads'],
  },
  operation: null,
  shapeInteractionMode: null,
  shapeInteractionCounter: 0,
  buildingNewShape: null,
  toasterInfos: { state: null, message: '' },
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    reset(state) {
      state.shapeInteractionMode = null;
      state.buildingNewShape = null;
    },
    setLayersBackground(state, action) {
      state.layers.background = action.payload;
    },
    setLayersBuildings(state, action) {
      state.layers.buildings = action.payload;
    },
    toggleExtraLayer(state, action) {
      const index = state.layers.extraLayers.indexOf(action.payload);
      if (index === -1) {
        state.layers.extraLayers.push(action.payload);
      } else {
        state.layers.extraLayers.splice(index, 1);
      }
    },
    setAddressSearchQuery(state, action) {
      if (action.payload != state.addressSearch.q) {
        state.addressSearch.q = action.payload;
      }
    },
    setAddressSearchResults(state, action) {
      state.addressSearch.results = action.payload;
    },
    setAddressSearchUnknownRNBId(state, action) {
      state.addressSearch.unknown_rnb_id = action.payload;
    },
    setMarkerAndReset(state, action) {
      state.operation = null;
      state.marker = action.payload;
    },
    setMoveTo(state, action) {
      state.moveTo = action.payload;
      if (state.moveTo) {
        // by default, set to false
        state.moveTo.fromMapEvent = action.payload.fromMapEvent === true;
      }
    },
    reloadBuildings(state) {
      state.reloadBuildings = Math.random(); // Force le trigger de useEffect
    },
    updateAddresses(state, action) {
      if (state.selectedItem && state.selectedItem._type === 'building') {
        state.selectedItem.addresses = action.payload;
      }
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
    incrementShapeInteractionCounter(state) {
      state.shapeInteractionCounter = state.shapeInteractionCounter + 1;
    },
    setBuildingNewShape(state, action: PayloadAction<GeoJSON.Geometry | null>) {
      state.buildingNewShape = action.payload;
    },
    setToasterInfos(state, action: PayloadAction<ToasterInfos>) {
      state.toasterInfos = action.payload;
    },
  },

  extraReducers(builder) {
    builder.addCase(selectBuilding.fulfilled, (state, action) => {
      // No building selected
      if (!action.payload) {
        state.selectedItem = undefined;
      } else {
        state.selectedItem = action.payload;
      }

      if (action.payload) {
        window.history.replaceState({}, '', `?q=${action.payload.rnb_id}`);
      } else {
        let url = new URL(window.location.href);
        url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
      }
    });

    builder.addCase(selectADS.fulfilled, (state, action) => {
      state.selectedItem = action.payload;
    });
  },
});

export const selectADS = createAsyncThunk(
  'map/selectADS',
  async (fileNumber: string | null, { dispatch }) => {
    if (!fileNumber) return;

    const url = adsApiUrl(fileNumber + '?from=site');
    const adsResponse = await fetch(url);

    if (adsResponse.ok) {
      const adsData = (await adsResponse.json()) as SelectedADS;

      return {
        ...adsData,
        _type: 'ads',
      } satisfies SelectedADS;
    }
  },
);

export const selectBuilding = createAsyncThunk(
  'map/selectBuilding',
  async (rnbId: string | null, { dispatch }) => {
    if (!rnbId) return;

    const url = bdgApiUrl(rnbId + '?from=site&withPlots=1');
    const rnbResponse = await fetch(url);

    if (rnbResponse.ok) {
      const rnbData = (await rnbResponse.json()) as SelectedBuilding;

      const selectedBuilding = {
        ...rnbData,
        _type: 'building',
      } satisfies SelectedBuilding;

      return selectedBuilding;
    } else {
      dispatch(mapSlice.actions.setAddressSearchUnknownRNBId(true));
    }
  },
);

export const selectBuildingAndSetOperationUpdate =
  (rnb_id: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    await dispatch(Actions.map.selectBuilding(rnb_id));
    dispatch(Actions.map.setOperation('update'));
  };

export function adsApiUrl(fileNumber: string) {
  return process.env.NEXT_PUBLIC_API_BASE + '/permis/' + fileNumber + '/';
}

export function bdgApiUrl(bdgId: string) {
  return process.env.NEXT_PUBLIC_API_BASE + '/buildings/' + bdgId;
}

export const mapActions = {
  ...mapSlice.actions,
  unselectItem: () => selectBuilding(null),
  selectBuilding,
  selectADS,
};
// Create d'un middleware pour réagir aux changements du store
export const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening.withTypes<RootState, AppDispatch>()({
  actionCreator: mapSlice.actions.setOperation,
  effect: async (action, listenerApi) => {
    const state = listenerApi.getState();
    const operation = state.map.operation;

    // a chaque changement d'operation, on reset le store
    listenerApi.dispatch(Actions.map.reset());
    listenerApi.dispatch(Actions.map.incrementShapeInteractionCounter());

    // en fonction de l'opération nouvellement selectionnée, on dispatch des actions spécifiques
    switch (operation) {
      case null:
        break;
      case 'create':
        listenerApi.dispatch(Actions.map.unselectItem());
        listenerApi.dispatch(Actions.map.setShapeInteractionMode('drawing'));
        break;
      case 'update':
        if (state.map.selectedItem?._type === 'building') {
          if (state.map.selectedItem.shape.type === 'Point') {
            listenerApi.dispatch(Actions.map.setShapeInteractionMode(null));
          } else {
            listenerApi.dispatch(
              Actions.map.setShapeInteractionMode('updating'),
            );
          }
        }
        break;
      default:
        break;
    }
  },
});

export const mapReducer = mapSlice.reducer;
