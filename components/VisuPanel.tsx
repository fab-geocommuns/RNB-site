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
import { SelectedBuilding } from '@/stores/map/map-slice';

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector((state: RootState) =>
    state.map.selectedItem ? state.map.selectedItem[0] : undefined,
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
        <div className={styles.shell} data-testid="visu-panel">
          <div className={styles.content}>
            <div className={styles.head}>
              <h1 className={styles.title}>{title()}</h1>
              <a href="#" onClick={close} className={styles.closeLink}>
                <i className="fr-icon-close-line" />
              </a>
            </div>

            <div className={styles.body}>
              {selectedItem?._type === 'building' && (
                <BuildingPanel bdg={selectedItem} />
              )}
              {selectedItem?._type === 'ads' && <ADSPanel ads={selectedItem} />}
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
