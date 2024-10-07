'use client';

// Hooks
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

// Styles
import styles from '@/styles/panel.module.scss';

// Store
import { useDispatch, useSelector } from 'react-redux';

// Comps

import { Actions, AppDispatch, RootState } from '@/stores/map/store';
import BuildingPanel from './panel/BuildingPanel';

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector((state: RootState) => state.selectedItem);
  const selectedItemType = useSelector(
    (state: RootState) => state.selectedItemType,
  );
  const dispatch: AppDispatch = useDispatch();

  const close = () => {
    dispatch(Actions.map.selectBuilding(null));
  };

  if (selectedItem) {
    return (
      <>
        <div className={styles.shell}>
          <a href="#" onClick={close} className={styles.closeLink}>
            <i className="fr-icon-close-line" />
          </a>
          <div className={styles.scrollable}>
            {selectedItemType === 'building' && (
              <BuildingPanel bdg={selectedItem} />
            )}

            {selectedItemType === 'ads' && (
              <div>
                <h1>TODO : display ADS</h1>
              </div>
            )}
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
