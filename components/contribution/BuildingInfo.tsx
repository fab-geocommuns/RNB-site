import styles from '@/styles/contribution/mergePanel.module.scss';
import stylesEdit from '@/styles/contribution/editPanel.module.scss';
import { BuildingStatusMap } from '@/stores/contribution/contribution-types';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { SplitChild } from '@/stores/edition/edition-slice';
import { ReactNode } from 'react';
import { isNewAddress } from './types';

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
      <div className={styles.mergePanelInfoWrapper}>
        {(building as SelectedBuilding)?.rnb_id && (
          <div className={styles.mergePanelRnbIdWrapper}>
            <div className={styles.mergePanelRnbId}>
              <span className="fr-text--lg fr-m-0">
                {(building as SelectedBuilding).rnb_id}
              </span>
              {children}
            </div>
          </div>
        )}
        <div className={styles.mergePanelAddressesWrapper}>
          <span className={styles.mergePanelLabel}>Statut du bâtiment</span>
          <span className={stylesEdit.text}>
            {BuildingStatusMap[building.status]}
          </span>
        </div>
        <div className={styles.mergePanelAddressesWrapper}>
          <span className={styles.mergePanelLabel}>
            {building?.addresses?.length > 1 ? 'Adresses' : 'Adresse'}
          </span>
          {building?.addresses?.length ? (
            <div>
              {building.addresses.map((addresse, i) => (
                <div key={i}>
                  <div className={styles.mergePanelAddressWrapper}>
                    <span className={styles.mergePanelAddressText}>
                      {isNewAddress(addresse)
                        ? addresse.label
                        : `${addresse.street_number}${addresse.street_rep} ${addresse.street}, ${addresse.city_zipcode} ${addresse.city_name}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className={styles.mergePanelAddressText}>
              <i>Aucune adresse disponible</i>
            </span>
          )}
        </div>
      </div>
    </>
  );
}
