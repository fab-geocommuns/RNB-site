'use client';

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const initialState = {
  panelIsOpen: false,
  addressSearch: {
    q: null,
    results: null,
    unknown_rnb_id: false,
  },
  moveTo: {
    lat: null,
    lng: null,
    zoom: null,
  },
  reloadBuildings: 0,
  marker: {
    lat: null,
    lng: null,
  },
  panelBdg: null,
};

export const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    openPanel(state) {
      state.panelIsOpen = true;
    },
    closePanel(state) {
      state.panelIsOpen = false;
    },
    setMarker(state, action) {
      state.marker = action.payload;
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
    setMoveTo(state, action) {
      if (
        action.payload.lat != state.moveTo.lat ||
        action.payload.lng != state.moveTo.lng ||
        action.payload.zoom != state.moveTo.zoom
      ) {
        state.moveTo = action.payload;
      }
    },
    reloadBuildings(state, action) {
      state.reloadBuildings = Math.random(); // Force le trigger de useEffect
    },
  },

  extraReducers(builder) {
    builder.addCase(fetchBdg.fulfilled, (state, action) => {
      state.panelBdg = action.payload;
    });
  },
});

export const fetchBdg = createAsyncThunk(
  'map/fetchBdg',
  async (bdgId: string) => {
    const url = bdgApiUrl(bdgId + '?from=site');
    const response = await fetch(url);
    if (!response.ok) {
      return null;
    } else {
      const data = await response.json();
      return data;
    }
  },
);

export function bdgApiUrl(bdgId: string) {
  return process.env.NEXT_PUBLIC_API_BASE + '/buildings/' + bdgId;
}

export const {
  setMarker,
  setMoveTo,
  setAddressSearchQuery,
  setAddressSearchResults,
  setAddressSearchUnknownRNBId,
  openPanel,
  closePanel,
  reloadBuildings,
} = mapSlice.actions;
export default mapSlice.reducer;
