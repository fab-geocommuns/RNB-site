'use client';

import { createSlice } from '@reduxjs/toolkit';
import { BuildingStatus } from '@/stores/contribution/contribution-types';
import { MultiPolygon, Point, Polygon } from 'geojson';

export type ContributionAddress = {
  id?: string; // Interoperability key
  street_number?: string;
  street_rep?: string;
  street?: string;
  city_zipcode?: string;
  city_name?: string;
  banId?: string; // New UUID Ban ID
  point: [number, number];
};

export type ContributionStore = {
  rnb_id?: string;
  addresses?: ContributionAddress[];
  status?: BuildingStatus;
  shape?: MultiPolygon | Polygon | Point;
};

const initialState: ContributionStore = {};

export const contributionSlice = createSlice({
  name: 'contribution',
  initialState,
  reducers: {
    reloadContributionData(state, action) {
      state.rnb_id = action.payload.rnb_id;
      state.status = action.payload.status;
      state.addresses = action.payload.addresses;
      state.shape = action.payload.shape;
    },
    stopEdit(state) {
      state.addresses = undefined;
    },
    setStatus(state, action) {
      state.status = action.payload;
    },
    newAddress(state, action) {
      state.addresses?.push(action.payload);
    },
    setAddress(state, action) {
      state.addresses![action.payload.index] = action.payload.address;
    },
    setShape(state, action) {
      state.shape = action.payload;
    },
    deleteAddress(state, action) {
      state.addresses?.splice(action.payload, 1);
    },
  },
});

export const contributionActions = {
  ...contributionSlice.actions,
};

export const contributionReducer = contributionSlice.reducer;
