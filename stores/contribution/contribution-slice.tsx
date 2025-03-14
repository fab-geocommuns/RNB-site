'use client';

import { createSlice } from '@reduxjs/toolkit';
import { BuildingStatus } from '@/stores/contribution/contribution-types';

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
  addresses?: ContributionAddress[];
  status?: BuildingStatus;
};

const initialState: ContributionStore = {};

export const contributionSlice = createSlice({
  name: 'contribution',
  initialState,
  reducers: {
    reloadContributionData(state, action) {
      state.status = action.payload.status;
      state.addresses = action.payload.addresses;
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
      console.log(action.payload);
      state.addresses![action.payload.index] = action.payload.address;
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
