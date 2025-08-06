import { createSelector } from 'reselect';
import { SplitChild } from './edition-slice';
import { RootState } from '../store';
import { geojsonToReducedPrecisionWKT } from '@/utils/geojsonToReducedPrecisionWKT';

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

export const selectSplitShapeIdForCurrentChild = createSelector(
  [selectSplitChildren, (state) => state.edition.split.selectedChildIndex],
  (children: SplitChild[], selectedChildIndex) => {
    if (selectedChildIndex !== null && selectedChildIndex < children.length) {
      return children[selectedChildIndex].shapeId;
    }
  },
);
