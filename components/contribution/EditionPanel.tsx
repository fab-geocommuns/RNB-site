import styles from '@/styles/contribution/editPanel.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState, AppDispatch } from '@/stores/store';
import { mapActions, SelectedBuilding } from '@/stores/map/map-slice';
import { useState, useEffect } from 'react';
import RNBIDHeader from './RNBIDHeader';
import BuildingStatus from './BuildingStatus';
import BuildingAddresses from './BuildingAddresses';
import BuildingShape from './BuildingShape';
import CreationPanel from './CreationPanel';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { geojsonToWKT } from '@terraformer/wkt';
import { BuildingAddressType } from './types';
import Button from '@codegouvfr/react-dsfr/Button';

import createBuildingImage from '@/public/images/map/edition/create.svg';
import { BuildingStatusType } from '@/stores/contribution/contribution-types';

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

function anyChangesBetween(a: any, b: any) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

function EditSelectedBuildingPanelContent({
  selectedBuilding,
}: {
  selectedBuilding: SelectedBuilding;
}) {
  const rnbId = selectedBuilding.rnb_id;
  const dispatch: AppDispatch = useDispatch();
  const [newStatus, setNewStatus] = useState<BuildingStatusType>(
    selectedBuilding.status,
  );
  const [localAddresses, setLocalAddresses] = useState<BuildingAddressType[]>(
    selectedBuilding.addresses,
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const buildingNewShape = useSelector(
    (state: RootState) => state.map.buildingNewShape,
  );
  const shapeInteractionMode = useSelector(
    (state: RootState) => state.map.shapeInteractionMode,
  );

  const anyChanges = anyChangesBetween(
    {
      status: newStatus,
      addresses: localAddresses.map((a) => a.id).sort(),
      shape: buildingNewShape,
    },
    {
      status: selectedBuilding.status,
      addresses: selectedBuilding.addresses.map((a) => a.id).sort(),
      shape: null,
    },
  );

  const { fetch } = useRNBFetch();

  useEffect(() => {
    setNewStatus(selectedBuilding.status);
    setLocalAddresses(selectedBuilding.addresses);
  }, [selectedBuilding]);

  const handleEditAddress = (addresses: BuildingAddressType[]) => {
    setLocalAddresses(addresses);
  };

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);

    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${selectedBuilding.rnb_id}/`;

    let data: { [key: string]: any } = {
      status: newStatus,
      addresses_cle_interop: localAddresses.map((a) => a.id),
    };

    if (buildingNewShape) {
      // send the data in WKT format
      data['shape'] = geojsonToWKT(buildingNewShape);
    }

    try {
      const response = await fetch(url, {
        body: JSON.stringify(data),
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      setSuccess(true);
      // force the map to reload the building, to immediatly show the modifications made
      dispatch(Actions.map.reloadBuildings());
      dispatch(Actions.map.setBuildingNewShape(null));
      await dispatch(Actions.map.selectBuilding(rnbId));
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
      console.error(err);
    }
  };

  return (
    <>
      <RNBIDHeader>
        <span className="fr-text--xs">Identifiant RNB</span>
        <h1 className="fr-text--lg fr-m-0">{rnbId}</h1>
      </RNBIDHeader>
      <PanelBody>
        <BuildingStatus
          status={newStatus}
          onChange={setNewStatus}
        ></BuildingStatus>
        <BuildingAddresses
          buildingPoint={selectedBuilding.point.coordinates}
          addresses={localAddresses}
          onChange={handleEditAddress}
        />
        <BuildingShape
          shapeInteractionMode={shapeInteractionMode}
          selectedBuilding={selectedBuilding}
        ></BuildingShape>
      </PanelBody>
      <div className={styles.footer}>
        <Button onClick={handleSubmit} disabled={!anyChanges}>
          Valider les modifications
        </Button>
      </div>

      <div className={styles.noticeContainer}>
        <div
          className={`${styles.notice} ${success || error ? styles.noticeVisible : ''}`}
        >
          {success && (
            <Notice title="Modification enregistrée" severity="info" />
          )}
          {error && (
            <Notice title="Modification impossible" severity="warning" />
          )}
        </div>
      </div>
    </>
  );
}

function PanelWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <div className={styles.content}>{children}</div>
    </div>
  );
}

export default function EditionPanel() {
  const selectedItem = useSelector(
    (state: RootState) => state.map.selectedItem,
  );
  const dispatch: AppDispatch = useDispatch();
  const operation = useSelector((state: RootState) => state.map.operation);

  const selectedBuilding =
    selectedItem?._type === 'building'
      ? (selectedItem as SelectedBuilding)
      : null;

  const toggleCreateBuilding = () => {
    if (operation === 'create') {
      dispatch(Actions.map.setOperation(null));
    } else {
      dispatch(Actions.map.setOperation('create'));
    }
  };

  useEffect(() => {
    if (operation === 'create') {
      dispatch(Actions.map.reset());
      dispatch(Actions.map.setShapeInteractionMode('drawing'));
    } else if (operation === null) {
      dispatch(Actions.map.setShapeInteractionMode(null));
    }
  }, [operation]);

  return (
    <>
      <div className={styles.actions}>
        <Button
          onClick={toggleCreateBuilding}
          size="small"
          priority="tertiary no outline"
        >
          <div className={styles.action}>
            <img src={createBuildingImage.src} alt="" height="32" width="32" />
            <small>créer</small>
          </div>
        </Button>
      </div>

      {operation == 'update' && selectedBuilding && (
        <PanelWrapper>
          <EditSelectedBuildingPanelContent
            selectedBuilding={selectedBuilding}
          />
        </PanelWrapper>
      )}
      {operation == 'create' && (
        <PanelWrapper>
          <CreationPanel />
        </PanelWrapper>
      )}
    </>
  );
}
