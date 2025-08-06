import { SelectedBuilding } from '@/stores/map/map-slice';
import BuildingInfo from './BuildingInfo';
import styles from '@/styles/contribution/mergePanel.module.scss';

interface MergeSummaryProps {
  newBuilding: SelectedBuilding;
  buildingsMerged: (SelectedBuilding | undefined)[] | null;
}

export default function MergeSummary({
  newBuilding,
  buildingsMerged,
}: MergeSummaryProps) {
  return (
    <>
      <div>
        {buildingsMerged && buildingsMerged.length > 0 && (
          <div className={styles.mergePanelSummaryHeaderWrapper}>
            <h3 className={styles.mergePanelSummaryTitle}>
              Bâtiments fusionnés (ID-RNB)
            </h3>
            <div className={styles.mergePanelSummaryHeader}>
              {buildingsMerged.map(
                (building: SelectedBuilding | undefined) =>
                  building && (
                    <div
                      key={building.rnb_id}
                      className={styles.mergePanelSummaryMerged}
                    >
                      <span
                        className={`${styles.mergePanelRnbId} ${styles.mergePanelRnbIdMerged}`}
                      >
                        {building.rnb_id}
                      </span>
                    </div>
                  ),
              )}
            </div>
          </div>
        )}
        <div
          className={`${styles.mergePanelDescWrapper} ${styles.mergePanelNewBuildingWrapper}`}
        >
          <h3 className={styles.mergePanelSummaryTitle}>
            Nouveau bâtiment créé:
          </h3>
          <BuildingInfo key={newBuilding.rnb_id} building={newBuilding} />
        </div>
      </div>
    </>
  );
}
