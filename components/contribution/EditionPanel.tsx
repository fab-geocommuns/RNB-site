import styles from '@/styles/contribution/editPanel.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { useState } from 'react';
import RNBIDHeader from './RNBIDHeader';
import BuildingStatus from './BuildingStatus';

function EditSelectedBuildingPanelContent({
  selectedBuilding,
}: {
  selectedBuilding: SelectedBuilding;
}) {
  const [newStatus, setNewStatus] = useState<string>(selectedBuilding.status);
  const anyChanges = newStatus !== selectedBuilding.status;

  return (
    <>
      <RNBIDHeader rnbId={selectedBuilding.rnb_id}></RNBIDHeader>
      <BuildingStatus
        status={newStatus}
        onChange={setNewStatus}
      ></BuildingStatus>
      <button disabled={!anyChanges}>Valider les modifications</button>
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
      <div className={styles.actions}>Actions</div>

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
