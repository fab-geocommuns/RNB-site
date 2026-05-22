import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { mapReducer } from '@/stores/map/map-slice';
import MapPointerClaim from './MapPointerClaim';

function renderWithStore(ui: React.ReactElement) {
  const store = configureStore({ reducer: { map: mapReducer } });
  const utils = render(<Provider store={store}>{ui}</Provider>);
  return { ...utils, store };
}

describe('<MapPointerClaim />', () => {
  it('sets the pointer in the store on mount', () => {
    const { store } = renderWithStore(<MapPointerClaim cursor="crosshair" />);
    expect(store.getState().map.pointer).toBe('crosshair');
  });

  it('clears the pointer on unmount', () => {
    const { store, unmount } = renderWithStore(
      <MapPointerClaim cursor="crosshair" />,
    );
    unmount();
    expect(store.getState().map.pointer).toBe('');
  });

  it('updates the pointer when the cursor prop changes', () => {
    const { store, rerender } = renderWithStore(
      <MapPointerClaim cursor="crosshair" />,
    );
    rerender(
      <Provider store={store}>
        <MapPointerClaim cursor="pointer" />
      </Provider>,
    );
    expect(store.getState().map.pointer).toBe('pointer');
  });
});
