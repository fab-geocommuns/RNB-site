'use client';

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BuildingStatusType } from './contribution-types';
import { WritableDraft } from 'immer';

export type Address = {
  // Define the properties of an Address here
};

export type Shape = {
  // Define the properties of a Shape here
};

type EmptyState = {
  operation: null;
};

type CreatingState = {
  operation: 'creating';
  creationStep: 'shape' | 'address';
  createdItem: {
    addresses: Address[];
    shape: null | Shape;
  };
};

type EditingState = {
  operation: 'editing';
  editedItem: {
    id: string;
    isActive: boolean;
    status: BuildingStatusType;
    shape: Shape;
  };
};

type MergingState = {
  operation: 'merging';
  mergeStep: 'selection' | 'creation';
  mergedItems: { id: string; shape: Shape }[];
  creationStep: string;
  createdItem: {
    addresses: Address[];
    shape: null | Shape;
  };
};

type SplittingState = {
  operation: 'splitting';
  splitStep: 'selection' | 'childCountSelection' | 'creation';
  childCount: number;
  creationStep: string;
  childItems: { id: string; shape: null | Shape }[];
  createdItem: {
    addresses: Address[];
    shape: null | Shape;
  };
};

export type ContributionStore =
  | EmptyState
  | CreatingState
  | EditingState
  | MergingState
  | SplittingState;

const initialState: ContributionStore = {
  operation: null,
};

export const contributionSlice = createSlice({
  name: 'contribution',
  initialState,
  reducers: {
    startCreating(state: WritableDraft<ContributionStore>) {
      const newState = state as WritableDraft<CreatingState>;
      newState.operation = 'creating';
      newState.creationStep = 'shape';
      newState.createdItem = { addresses: [], shape: null };
    },
    startMerging(state: WritableDraft<ContributionStore>) {
      const newState = state as WritableDraft<MergingState>;
      newState.operation = 'merging';
      newState.mergeStep = 'selection';
      newState.mergedItems = [];
      newState.creationStep = 'creation';
      newState.createdItem = { addresses: [], shape: null };
    },
    stopOperation(state: WritableDraft<ContributionStore>) {
      const newState = state as WritableDraft<EmptyState>;
      newState.operation = null;
    },
    selectBuilding(
      state: WritableDraft<ContributionStore>,
      action: PayloadAction<string>,
    ) {
      if (state.operation === 'merging') {
        const newState = state as WritableDraft<MergingState>;
        newState.mergedItems.push({ id: action.payload, shape: null });
      }
    },
  },
});

export const contributionActions = {
  ...contributionSlice.actions,
};

export const contributionReducer = contributionSlice.reducer;
