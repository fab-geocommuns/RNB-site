'use client';

// Hooks
import React, { useState } from 'react';

// Styles
import styles from '@/styles/panel.module.scss';

// Store
import { useDispatch, useSelector } from 'react-redux';

// Comps
import { Actions, AppDispatch, RootState } from '@/stores/store';
import BuildingPanel from '@/components/panel/BuildingPanel';
import GenericPanel from '@/components/panel/GenericPanel';
import ADSPanel from '@/components/panel/ADSPanel';
import { SelectedItem } from '@/stores/map/map-slice';

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();
  const title = () => {
    if (selectedItem?._type === 'building') {
      return 'Bâtiment';
    }

    if (selectedItem?._type === 'ads') {
      return 'Autorisation du droit des sols';
    }

    return null;
  };

  const close = () => {
    dispatch(Actions.map.unselectItem());
  };
  if (selectedItem) {
    return (
      <>
        <GenericPanel
          operation="visualisation"
          title={title()}
          onClose={close}
          body={bodyPanel(selectedItem)}
          data-testid="visu-panel"
        ></GenericPanel>
      </>
    );
  } else {
    return <></>;
  }
}
function bodyPanel(selectedItem: SelectedItem): React.ReactNode {
  return (
    <>
      {selectedItem?._type === 'building' && (
        <BuildingPanel bdg={selectedItem} />
      )}
      {selectedItem?._type === 'ads' && <ADSPanel ads={selectedItem} />}
    </>
  );
}
