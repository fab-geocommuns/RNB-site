import styles from '@/styles/contribution/editPanel.module.scss';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/stores/store';
import {
  SelectedBuilding,
  mapActions,
  BuildingAddress as BuildingAddressType,
} from '@/stores/map/map-slice';
import { useState, useEffect } from 'react';
import RNBIDHeader from './RNBIDHeader';
import BuildingStatus from './BuildingStatus';
import BuildingAddresses from './BuildingAddresses';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';

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
  const dispatch = useDispatch();
  const [newStatus, setNewStatus] = useState<string>(selectedBuilding.status);
  const [localAddresses, setLocalAddresses] = useState<BuildingAddressType[]>(
    selectedBuilding.addresses,
  );
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const anyChanges = anyChangesBetween(
    { status: newStatus, addresses: localAddresses.map((a) => a.id).sort() },
    {
      status: selectedBuilding.status,
      addresses: selectedBuilding.addresses.map((a) => a.id).sort(),
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

  const dispatch: AppDispatch = useDispatch();

  const handleSubmit = async () => {
    setError(null);
    setSuccess(false);
    const url = `${process.env.NEXT_PUBLIC_API_BASE}/buildings/${rnbId}/`;

    try {
      const response = await fetch(url, {
        body: JSON.stringify({
          status: newStatus,
          addresses_cle_interop: localAddresses.map((a) => a.id),
        }),
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      await dispatch(Actions.map.selectBuilding(rnbId));
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
      console.error(error);
    }
  };

  return (
    <>
      <RNBIDHeader rnbId={rnbId}></RNBIDHeader>
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
        <button onClick={handleSubmit} disabled={!anyChanges}>
          Valider les modifications
        </button>
      </PanelBody>

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
  const selectedBuilding =
    selectedItem?._type === 'building'
      ? (selectedItem as SelectedBuilding)
      : null;
  return (
    <>
      <div className={styles.actions}>&nbsp;{/* Actions placeholder */}</div>

      {selectedBuilding && (
        <PanelWrapper>
          <EditSelectedBuildingPanelContent
            selectedBuilding={selectedBuilding}
          />
        </PanelWrapper>
      )}
    </>
  );
}
