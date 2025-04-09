import styles from '@/styles/contribution/editPanel.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { useState } from 'react';
import RNBIDHeader from './RNBIDHeader';
import BuildingStatus from './BuildingStatus';
import { useRNBFetch } from '@/utils/use-rnb-fetch';
import { Notice } from '@codegouvfr/react-dsfr/Notice';
import { useEffect } from 'react';

function PanelBody({ children }: { children: React.ReactNode }) {
  return <div className={styles.body}>{children}</div>;
}

function EditSelectedBuildingPanelContent({
  selectedBuilding,
}: {
  selectedBuilding: SelectedBuilding;
}) {
  const [newStatus, setNewStatus] = useState<string>(selectedBuilding.status);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const anyChanges = newStatus !== selectedBuilding.status;
  const { fetch } = useRNBFetch();

  useEffect(() => {
    if (error || success) {
      // show the message for a few seconds
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

    try {
      const response = await fetch(url, {
        body: JSON.stringify({
          status: newStatus,
        }),
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la modification');
      console.error(error);
    }
  };

  return (
    <>
      <RNBIDHeader rnbId={selectedBuilding.rnb_id}></RNBIDHeader>
      <PanelBody>
        <BuildingStatus
          status={newStatus}
          onChange={setNewStatus}
        ></BuildingStatus>
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
