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
import { Group, ShouldBeConnected } from '@/components/util/ShouldBeConnected';
import { DisableBuilding } from '@/components/contribution/DisableBuilding';
import { EditBuilding } from '@/components/contribution/EditBuilding';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { Input } from '@codegouvfr/react-dsfr/Input';

export default function VisuPanel() {
  // Store
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();
  const [comment, setComment] = useState('');
  const { fetch } = useRNBFetch();
  const contribution = useSelector((state: RootState) => state.contribution);

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

  const saveAndStopEditing = async () => {
    const building = selectedItem as SelectedBuilding;
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${building.rnb_id}/`;

    try {
      const res = await fetch(url, {
        body: JSON.stringify({
          status: contribution.status,
          addresses_cle_interop: contribution.addresses?.map((a) => a.id),
          comment,
        }),
        method: 'PATCH',
      });

      if (res.ok) {
        // Stop editing
        dispatch(Actions.contribution.stopEdit());

        // Update building in selectedItem
        await dispatch(Actions.map.selectBuilding(building.rnb_id));

        // Show alert
        dispatch(
          Actions.app.showAlert({
            alert: {
              id: `edit-building-${building.rnb_id}`,
              severity: 'success',
              description: 'Le bâtiment a été modifié',
              small: true,
            },
          }),
        );
      } else {
        // Show error
        dispatch(
          Actions.app.showAlert({
            alert: {
              id: `edit-building-${building.rnb_id}`,
              severity: 'error',
              description:
                'Une erreur est survenue, veuillez essayer plus tard',
              small: true,
            },
          }),
        );
      }
    } catch (e) {
      console.error(e);
    }
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
                <BuildingPanel bdg={selectedItem} />
              )}
              {selectedItem?._type === 'ads' && <ADSPanel ads={selectedItem} />}
            </div>

            {selectedItem?._type === 'building' && !contribution.editing && (
              <ShouldBeConnected withGroup={Group.CONTRIBUTORS}>
                <div className={styles.footer}>
                  <div className={styles.footerActions}>
                    <DisableBuilding />
                    <EditBuilding />
                  </div>
                </div>
              </ShouldBeConnected>
            )}

            {selectedItem?._type === 'building' && contribution.editing && (
              <ShouldBeConnected withGroup={Group.CONTRIBUTORS}>
                <div className={styles.footer}>
                  <Input
                    label="Justification de la contribution (*)"
                    style={{
                      marginBottom: '0',
                    }}
                    nativeTextAreaProps={{
                      rows: 3,
                      value: comment,
                      onChange: (e: any) => setComment(e.target.value),
                    }}
                    textArea={true}
                  />

                  <div className={styles.footerActions}>
                    <button
                      className="action"
                      onClick={() => {
                        dispatch(Actions.contribution.stopEdit());
                        setComment('');
                      }}
                    >
                      Annuler
                    </button>
                    <button
                      className="action"
                      onClick={saveAndStopEditing}
                      disabled={!comment}
                    >
                      Sauvegarder
                    </button>
                  </div>
                </div>
              </ShouldBeConnected>
            )}
          </div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
}
