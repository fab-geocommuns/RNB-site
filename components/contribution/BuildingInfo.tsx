import styles from '@/styles/merge.module.scss';
import { BuildingStatusMap } from '@/stores/contribution/contribution-types';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { SplitChild } from '@/stores/edition/edition-slice';
import { ReactNode } from 'react';
import { isNewAddress, BuildingAddressType } from './types';

interface BuildingInfoProps {
  building: SelectedBuilding | SplitChild;
  children?: ReactNode;
}

export default function BuildingInfo({
  building,
  children,
}: BuildingInfoProps) {
  return (
    <>
      <div className={styles.mergePanel__infoWrapper}>
        {(building as SelectedBuilding)?.rnb_id && (
          <div className={styles.mergePanel__rnbIdWrapper}>
            <div className={styles.mergePanel__rnbId}>
              <span className="fr-text--lg fr-m-0">
                {(building as SelectedBuilding).rnb_id}
              </span>
              {children}
            </div>
          </div>
        )}
        <div className={styles.mergePanel__addressesWrapper}>
          <span className={styles.mergePanel__label}>Statut du bâtiment</span>
          <div className="fr-badge fr-badge--success fr-badge--no-icon">
            <span>{BuildingStatusMap[building.status]}</span>
          </div>
        </div>
        <div className={styles.mergePanel__addressesWrapper}>
          <span className={styles.mergePanel__label}>
            {building?.addresses?.length > 1 ? 'Adresses' : 'Adresse'}
          </span>
          {building?.addresses?.length ? (
            <div>
              {building.addresses.map((addresse, i) => (
                <div key={i}>
                  <div className={styles.mergePanel__addressWrapper}>
                    <span className={styles.mergePanel__addressText}>
                      {isNewAddress(addresse)
                        ? addresse.label
                        : `${addresse.street_number}${addresse.street_rep} ${addresse.street}, ${addresse.city_zipcode} ${addresse.city_name}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className={styles.mergePanel__addressText}>
              <i>Aucune adresse</i>
            </span>
          )}
        </div>
      </div>
    </>
  );
}
