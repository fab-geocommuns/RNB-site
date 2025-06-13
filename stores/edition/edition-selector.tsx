import { createSelector } from 'reselect';
import { SplitChild } from './edition-slice';
import { RootState } from '../store';
import { geojsonToWKT } from '@terraformer/wkt';

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
        data['shape'] = geojsonToWKT(child.shape);
      }

      return data;
    }),
);

export const selectSplitShapeIdForCurrentChild = createSelector(
  [selectSplitChildren, (state) => state.edition.split.currentChildSelected],
  (children: SplitChild[], currentChildSelected) => {
    if (currentChildSelected !== null) {
      return children[currentChildSelected].shapeId;
    }
  },
);
