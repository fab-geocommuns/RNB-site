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
import ADSPanel from '@/components/panel/ADSPanel';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { PanelBody, PanelHeader, PanelWrapper } from '@/components/ui/Panel';

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();
  const [comment, setComment] = useState('');
  const { fetch } = useRNBFetch();

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
        <PanelWrapper>
          <PanelHeader onClose={close}>{title()}</PanelHeader>

          <PanelBody>
            {selectedItem?._type === 'building' && (
              <BuildingPanel bdg={selectedItem} />
            )}
            {selectedItem?._type === 'ads' && <ADSPanel ads={selectedItem} />}
          </PanelBody>
        </PanelWrapper>
      </>
    );
  } else {
    return <></>;
  }
}
