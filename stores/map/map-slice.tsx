'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { BuildingStatus } from '@/stores/contribution/contribution-types';
import { contributionActions } from '@/stores/contribution/contribution-slice';

export interface SelectedBuilding {
  _type: 'building';
  rnb_id: string;
  status: BuildingStatus;
  point: {
    type: 'Point';
    coordinates: [number, number];
  };
  addresses: {
    id: string;
    banId: string;
    source: string;
    street_number: string;
    street_rep: string;
    street: string;
    city_name: string;
    city_zipcode: string;
    city_insee_code: string;
  }[];
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

export type MapBackgroundLayer = 'satellite' | 'vectorOsm' | 'vectorIgn';
export type MapBuildingsLayer = 'point' | 'polygon';
export type MapExtraLayer = 'ads' | 'plots';

export type MapStore = {
  panelIsOpen: boolean;
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
  };
  marker?: [number, number];
  reloadBuildings?: number;
  selectedItem?: SelectedItem;
  layers: MapLayers;
};

const initialState: MapStore = {
  panelIsOpen: false,
  addressSearch: {
    results: [],
    unknown_rnb_id: false,
  },
  layers: {
    background: 'vectorIgn',
    buildings: 'point',
    extraLayers: ['ads'],
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
    setMarker(state, action) {
      state.marker = action.payload;
    },
    setMoveTo(state, action) {
      state.moveTo = action.payload;
    },
    reloadBuildings(state) {
      state.reloadBuildings = Math.random(); // Force le trigger de useEffect
    },
    updateAddresses(state, action) {
      if (state.selectedItem && state.selectedItem._type === 'building') {
        state.selectedItem.addresses = action.payload;
      }
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

      // Add banId to each addresses
      if (rnbData?.addresses && rnbData.addresses.length > 0) {
        dispatch(addBanUUID(rnbData));
      }

      const selectedBuilding = {
        ...rnbData,
        _type: 'building',
      } satisfies SelectedBuilding;

      dispatch(contributionActions.reloadContributionData(selectedBuilding));

      return selectedBuilding;
    } else {
      dispatch(mapSlice.actions.setAddressSearchUnknownRNBId(true));
    }
  },
);

export const addBanUUID = createAsyncThunk(
  'map/addBanUUID',
  async (rnbData: NonNullable<SelectedBuilding>, { dispatch, getState }) => {
    const updatedAddresses = await Promise.all(
      rnbData.addresses?.map(async (address) => {
        const banResponse = await fetch(banApiUrl(address.id));
        if (banResponse.ok) {
          const banData = await banResponse.json();
          return {
            ...address,
            banId: banData.banId,
          };
        }
        return address;
      }),
    );

    // We update only if we are still looking at the same building.
    // Otherwise, we might experience a bug where we update the current building with the addresses of another building.
    const state = getState();
    if (rnbData.rnb_id === state.selectedItem?.rnb_id) {
      dispatch(mapSlice.actions.updateAddresses(updatedAddresses));
    }
  },
);

export function adsApiUrl(fileNumber: string) {
  return process.env.NEXT_PUBLIC_API_BASE + '/permis/' + fileNumber + '/';
}

export function bdgApiUrl(bdgId: string) {
  return process.env.NEXT_PUBLIC_API_BASE + '/buildings/' + bdgId;
}

export function banApiUrl(interopBanId: string) {
  return process.env.NEXT_PUBLIC_API_BAN_URL + '/lookup/' + interopBanId;
}

export const mapActions = {
  ...mapSlice.actions,
  unselectItem: () => selectBuilding(null),
  selectBuilding,
  selectADS,
};

export const mapReducer = mapSlice.reducer;
