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
import BuildingPanel from '@/components/panel/BuildingPanel';
import ADSPanel from '@/components/panel/ADSPanel';
import { Group, ShouldBeConnected } from '@/components/util/ShouldBeConnected';
import { fr } from '@codegouvfr/react-dsfr';
import { DisableBuilding } from '@/components/contribution/DisableBuilding';
import { EditBuilding } from '@/components/contribution/EditBuilding';

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector((state: RootState) => state.selectedItem);
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
        <div className={styles.shell}>
          <div className={styles.content}>
            <div className={styles.head}>
              <h1 className={styles.title}>{title()}</h1>
              <a href="#" onClick={close} className={styles.closeLink}>
                <i className="fr-icon-close-line" />
              </a>
            </div>

            <div className={styles.body}>
              {selectedItem?._type === 'building' && (
                <>
                  <BuildingPanel bdg={selectedItem} />
                </>
              )}

              {selectedItem?._type === 'ads' && (
                <>
                  <ADSPanel ads={selectedItem} />
                </>
              )}
            </div>

            <ShouldBeConnected withGroup={Group.CONTRIBUTORS}>
              <div className={styles.footer}>
                <DisableBuilding />
                <EditBuilding />
              </div>
            </ShouldBeConnected>
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
