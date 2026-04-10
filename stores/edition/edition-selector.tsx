import { createSelector } from '@reduxjs/toolkit';
import { SplitChild } from './edition-slice';
import { RootState } from '../store';
import { geojsonToReducedPrecisionWKT } from '@/utils/geojsonToReducedPrecisionWKT';
import { splitPolygonByLines } from '@/utils/splitPolygonByLines';

export const selectSplitChildren = (state: RootState) =>
  state.edition.split.children;

export const selectSplitChildrenForAPI = createSelector(
  [selectSplitChildren],
  (children) =>
    children.map((child: SplitChild) => {
      let data: { [key: string]: any } = {
        status: child.status,
        addresses_cle_interop: child.addresses.map((address) => address.id),
      };

      if (child.shape) {
        data['shape'] = geojsonToReducedPrecisionWKT(child.shape);
      }

      return data;
    }),
);

export const selectCutPreview = createSelector(
  [
    (state: RootState) => state.edition.split.candidateShape,
    (state: RootState) => state.edition.split.cutLines,
  ],
  (candidateShape, cutLines) => {
    if (!candidateShape || cutLines.length === 0) return null;
    return splitPolygonByLines(
      candidateShape,
      cutLines.map((line) => line.geometry),
    );
  },
);
