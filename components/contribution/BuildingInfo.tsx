import styles from '@/styles/merge.module.scss';
import { BuildingStatusMap } from '@/stores/contribution/contribution-types';
import { SelectedBuilding } from '@/stores/map/map-slice';
import { ReactNode } from 'react';

interface BuildingInfoProps {
  building: SelectedBuilding;
  children?: ReactNode;
}

export default function BuildingInfo({
  building,
  children,
}: BuildingInfoProps) {
  return (
    <>
      <div key={building?.rnb_id} className={styles.mergePanel__infoWrapper}>
        <div className={styles.mergePanel__rnbIdWrapper}>
          <div className={styles.mergePanel__rnbId}>
            <span className="fr-text--lg fr-m-0">{building.rnb_id}</span>
            {children}
          </div>
        </div>
        <div className={styles.mergePanel__addressesWrapper}>
<<<<<<< HEAD
          <span className={styles.mergePanel__label}>Statut du bâtiment</span>
          <div className="fr-badge fr-badge--success fr-badge--no-icon">
            <span>{BuildingStatusMap[building.status]}</span>
          </div>
        </div>
        <div className={styles.mergePanel__addressesWrapper}>
=======
>>>>>>> d0ec334 (new panel version)
          <span className={styles.mergePanel__label}>
            {building?.addresses?.length > 1 ? 'Adresses' : 'Adresse'}
          </span>
          {building?.addresses?.length ? (
            <div>
              {building.addresses.map((addresse, i) => (
                <div key={i}>
                  <div className={styles.mergePanel__addressWrapper}>
                    <span className={styles.mergePanel__addressText}>
                      {addresse.street_number}
                      {addresse.street_rep} {addresse.street}{' '}
                      {addresse.city_zipcode} {addresse.city_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className={styles.mergePanel__addressText}>
<<<<<<< HEAD
              <i>Aucune adresse disponible</i>
            </span>
          )}
        </div>
=======
              Aucune adresse disponible
            </span>
          )}
        </div>
        <div className={styles.mergePanel__addressesWrapper}>
          <span className={styles.mergePanel__label}>Statut du bâtiment</span>
          <div className="fr-badge fr-badge--success fr-badge--no-icon">
            <span>{BuildingStatusMap[building.status]}</span>
          </div>
        </div>
        <div className={styles.mergePanel__addressesWrapper}>
          <span className={styles.mergePanel__label}>
            {building?.ext_ids?.length > 1 ? 'Sources' : 'Source'}
          </span>
          {building?.ext_ids?.length && (
            <div>
              {building.ext_ids.map(
                (source: { id: string; source: string }) => (
                  <div key={source.id}>
                    <div className={styles.mergePanel__addressWrapper}>
                      <span className={styles.mergePanel__addressText}>
                        {source.source.toUpperCase()} :{' '}
                        {source.id.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
>>>>>>> d0ec334 (new panel version)
      </div>
    </>
  );
}
