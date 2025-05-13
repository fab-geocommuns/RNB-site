import RNBIDHeader from './RNBIDHeader';
import styles from '@/styles/contribution/editPanel.module.scss';
import { Actions, AppDispatch, RootState } from '@/stores/store';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';
import BuildingStatus from './BuildingStatus';
import BuildingAddresses from './BuildingAddresses';
import { BuildingAddressType } from './types';
import Button from '@codegouvfr/react-dsfr/Button';
import { geojsonToWKT } from '@terraformer/wkt';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import {
  throwErrorMessageForHumans,
  toasterError,
  toasterSuccess,
} from './toaster';

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

export default function CreationPanel() {
  const dispatch: AppDispatch = useDispatch();
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.map.shapeInteractionMode,
  );
  const mapCoordinates = useSelector((state: RootState) => state.map.moveTo);
  const [newStatus, setNewStatus] = useState<BuildingStatusType>('constructed');
  const [localAddresses, setLocalAddresses] = useState<BuildingAddressType[]>(
    [],
  );
  const { fetch } = useRNBFetch();

  const buildingNewShape = useSelector(
    (state: RootState) => state.map.buildingNewShape,
  );

  const handleEditAddress = (addresses: BuildingAddressType[]) => {
    setLocalAddresses(addresses);
  };

  const createBuilding = async () => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/`;

    const data: { [key: string]: any } = {
      status: newStatus,
      addresses_cle_interop: localAddresses.map((a) => a.id),
      shape: geojsonToWKT(buildingNewShape!),
    };

    try {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'POST',
      });

      if (!response.ok) {
        await throwErrorMessageForHumans(response);
      } else {
        // force the map to reload the building, to immediatly show the modifications made
        dispatch(Actions.map.reloadBuildings());
        dispatch(Actions.map.setBuildingNewShape(null));
        dispatch(Actions.map.setOperation(null));
        toasterSuccess(dispatch, 'Bâtiment créé avec succès');
      }
    } catch (err: any) {
      toasterError(dispatch, err.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  return (
    <>
      <RNBIDHeader>
        <span className="fr-text--xs">Créer un nouveau bâtiment </span>
        {shapeInteractionMode === 'drawing' && (
          <h1 className="fr-text--lg fr-m-0">étape 1 - Géométrie</h1>
        )}
        {shapeInteractionMode === 'updating' && (
          <h1 className="fr-text--lg fr-m-0">étape 2 - informations</h1>
        )}
      </RNBIDHeader>
      <PanelBody>
        {shapeInteractionMode === 'drawing' && (
          <div className={`${styles.panelSection} ${styles.noPad}`}>
            {mapCoordinates && mapCoordinates.zoom < 18 ? (
              <div>Zoomez sur la carte pour pouvoir tracer le bâtiment.</div>
            ) : (
              <>
                <div>Tracez la géométrie du bâtiment sur la carte.</div>
                <div className="fr-pt-3v">
                  Pour terminer le tracé, fermez le polygone en recliquant sur
                  le premier point que vous avez placé.
                </div>
              </>
            )}
          </div>
        )}
        {shapeInteractionMode === 'updating' && (
          <>
            <BuildingStatus
              status={newStatus}
              onChange={setNewStatus}
            ></BuildingStatus>

            <BuildingAddresses
              buildingPoint={
                mapCoordinates
                  ? [mapCoordinates!.lng, mapCoordinates!.lat]
                  : undefined
              }
              addresses={localAddresses}
              onChange={handleEditAddress}
            />
          </>
        )}
      </PanelBody>
      {shapeInteractionMode === 'updating' && (
        <div className={styles.footer}>
          <Button onClick={createBuilding}>Créer le bâtiment</Button>
        </div>
      )}
    </>
  );
}
