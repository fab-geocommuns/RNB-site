import styles from '@/styles/editPanel.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { Select } from '@codegouvfr/react-dsfr/SelectNext';
import { useState } from 'react';

function EditSelectedBuildingPanel({
  selectedBuilding,
}: {
  selectedBuilding: SelectedBuilding;
}) {
  const [newStatus, setNewStatus] = useState<string>(selectedBuilding.status);
  const anyChanges = newStatus !== selectedBuilding.status;

  return (
    <div className={styles.content}>
      <RNBIDheader rnb_id={selectedBuilding.rnb_id}></RNBIDheader>
      <Status status={newStatus} onChange={setNewStatus}></Status>
      <button disabled={!anyChanges}>Valider les modifications</button>
    </div>
  );
}

function RNBIDheader({ rnb_id }: { rnb_id: string }) {
  return (
    <>
      Identifiant RNB
      {rnb_id}
    </>
  );
}

function Status({
  status,
  onChange,
}: {
  status: string;
  onChange: (status: string) => void;
}) {
  const statusList = [
    {
      label: 'Construit',
      value: 'constructed',
    },
    {
      label: 'En ruine',
      value: 'notUsable',
    },
    {
      label: 'Démoli',
      value: 'demolished',
    },
  ];

  return (
    <>
      <Select
        nativeSelectProps={{
          value: status,
          onChange: (event) => {
            onChange(event.target.value);
          },
        }}
        label="Statut du bâtiment"
        options={statusList}
      />
    </>
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
      <div className={styles.shell}>
        {selectedBuilding && (
          <EditSelectedBuildingPanel selectedBuilding={selectedBuilding} />
        )}
      </div>
    </>
  );
}
