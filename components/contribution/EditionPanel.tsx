import styles from '@/styles/editPanel.module.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/stores/store';
import { SelectedBuilding } from '@/stores/map/map-slice';

function EditSelectedBuildingPanel({
  selectedBuilding,
}: {
  selectedBuilding: SelectedBuilding;
}) {
  return (
    <div className={styles.content}>
      Sélectionné : {selectedBuilding.rnb_id}
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
      <div className={styles.shell}>
        {selectedBuilding && (
          <EditSelectedBuildingPanel selectedBuilding={selectedBuilding} />
        )}
      </div>
    </>
  );
}
