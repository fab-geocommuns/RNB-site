'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import { fetchBuilding } from '@/utils/requests';
import {
  setArrayQueryParam,
  setQueryParam,
  removeQueryParam,
} from '@/utils/queryParams';
import { RootState } from '../store';

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

export type Plot = {
  id: string;
  bdg_cover_ratio: number;
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
  plots: Plot[] | null;
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
  | 'vectorIgnStandard'
  | 'satellite_2016_2020';
export type MapBuildingsLayer = 'point' | 'polygon';
export type MapExtraLayer = 'ads' | 'plots' | 'addresses' | 'reports';
const validExtraLayers: MapExtraLayer[] = [
  'ads',
  'plots',
  'addresses',
  'reports',
];
export function isValidExtraLayer(layer: MapExtraLayer): boolean {
  return validExtraLayers.includes(layer);
}
export type MapLayer = MapBackgroundLayer | MapBuildingsLayer | MapExtraLayer;

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
};

const initialState: MapStore = {
  addressSearch: {
    results: [],
    unknown_rnb_id: false,
  },
  layers: {
    background: 'vectorIgnStandard',
    buildings: 'point',
    extraLayers: [],
  },
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setLayersBackground(state, action) {
      state.layers.background = action.payload;
    },
    setLayersBuildings(state, action) {
      state.layers.buildings = action.payload;
    },
    setLayersExtraInStore(state, action) {
      state.layers.extraLayers = action.payload;
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
    removeBuildings(state) {
      state.selectedItem = undefined;
    },
  },

  extraReducers(builder) {
    builder.addCase(selectBuilding.fulfilled, (state, action) => {
      // No building selected
      if (!action.payload) state.selectedItem = undefined;
      else state.selectedItem = action.payload;
      if (action.payload) {
        setQueryParam('q', action.payload.rnb_id);
      } else {
        removeQueryParam('q');
      }
    });

    builder.addCase(selectADS.fulfilled, (state, action) => {
      state.selectedItem = action.payload;
    });
  },
});

const setExtraLayers = (extraLayers: MapExtraLayer[]) => (dispatch: any) => {
  dispatch(mapSlice.actions.setLayersExtraInStore(extraLayers));
  setArrayQueryParam('extra_layers', extraLayers);
};
const toggleExtraLayer =
  (extraLayer: MapExtraLayer) => (dispatch: any, getState: () => RootState) => {
    const state = getState();
    const index = state.map.layers.extraLayers.indexOf(extraLayer);
    const newExtraLayers = [...state.map.layers.extraLayers];
    if (index === -1) {
      newExtraLayers.push(extraLayer);
    } else {
      newExtraLayers.splice(index, 1);
    }
    dispatch(setExtraLayers(newExtraLayers));
  };

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
    const buildingFetched = await fetchBuilding(rnbId);
    if (buildingFetched?.rnb_id) {
      return buildingFetched;
    } else {
      dispatch(mapSlice.actions.setAddressSearchUnknownRNBId(true));
    }
  },
);

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
  setExtraLayers,
  toggleExtraLayer,
};

export const mapReducer = mapSlice.reducer;
