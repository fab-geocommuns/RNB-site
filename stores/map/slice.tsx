'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

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
  selectedBuilding?: {
    rnb_id: string;
    status: any[];
    point: [number, number];
    addresses: any[];
    ext_ids: any[];
    is_active: boolean;
  };
  mapBackground?: string;
};

const initialState: MapStore = {
  panelIsOpen: false,
  addressSearch: {
    results: [],
    unknown_rnb_id: false,
  },
  mapBackground: 'osm',
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
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
    setMapBackground(state, action) {
      state.mapBackground = action.payload;
    },
    setMoveTo(state, action) {
      state.moveTo = action.payload;
    },
    reloadBuildings(state) {
      state.reloadBuildings = Math.random(); // Force le trigger de useEffect
    },
  },

  extraReducers(builder) {
    builder.addCase(selectBuilding.fulfilled, (state, action) => {
      state.selectedBuilding = action.payload;

      if (action.payload) {
        window.history.replaceState({}, '', `?q=${action.payload.rnb_id}`);
      } else {
        let url = new URL(window.location.href);
        url.searchParams.delete('q');
        window.history.replaceState({}, '', url);
      }
    });
  },
});

export const selectBuilding = createAsyncThunk(
  'map/selectBuilding',
  async (rnbId: string | null, { dispatch }) => {
    if (!rnbId) return;
    const url = bdgApiUrl(rnbId + '?from=site');
    const response = await fetch(url);
    if (response.ok) {
      return (await response.json()) as MapStore['selectedBuilding'];
    } else {
      dispatch(mapSlice.actions.setAddressSearchUnknownRNBId(true));
    }
  },
);

export function bdgApiUrl(bdgId: string) {
  return process.env.NEXT_PUBLIC_API_BASE + '/buildings/' + bdgId;
}

export const mapActions = {
  ...mapSlice.actions,
  selectBuilding,
};

export const mapReducer = mapSlice.reducer;
