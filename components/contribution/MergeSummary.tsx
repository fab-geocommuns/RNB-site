import { BuildingStatusMap } from '@/stores/contribution/contribution-types';
import { SelectedBuilding } from '@/stores/map/map-slice';
import BuildingInfo from './BuildingInfo';
import styles from '@/styles/merge.module.scss';

interface MergeSummaryProps {
  newBuilding: SelectedBuilding;
  buildingsMerged: (SelectedBuilding | undefined)[] | null;
}

export default function MergeSummary({ newBuilding, buildingsMerged }) {
  return (
    <>
      <div>
        {buildingsMerged && buildingsMerged.length > 0 && (
          <div className={styles.mergePanel__summaryHeaderWrapper}>
            <h3 className={styles.mergePanel__summaryTitle}>
              Bâtiments fusionnés (RNB ID)
            </h3>
            <div className={styles.mergePanel__summaryHeader}>
              {buildingsMerged.map(
                (building: SelectedBuilding) =>
                  building && (
                    <div
                      key={building.rnb_id}
                      className={styles.mergePanel__summaryMerged}
                    >
                      <span
                        className={`${styles.mergePanel__rnbId} ${styles.mergePanel__rnbIdMerged}`}
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
          className={`${styles.mergePanel__descWrapper} ${styles.mergePanel__newBuildingWrapper}`}
        >
          <h3 className={styles.mergePanel__summaryTitle}>
            Nouveau bâtiment créé:
          </h3>
          <BuildingInfo key={newBuilding.rnb_id} building={newBuilding} />
        </div>
      </div>
    </>
  );
}
