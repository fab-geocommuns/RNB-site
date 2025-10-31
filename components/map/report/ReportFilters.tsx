// Store
import { useSelector, useDispatch } from 'react-redux';
import { Actions, RootState } from '@/stores/store';

import styles from '@/styles/genericPanel.module.scss';

export default function ReportFilters() {
  // Store
  const filtersDrawerOpen = useSelector(
    (state: RootState) => state.report.filtersDrawerOpen,
  );

  const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <div>
          <h2 className={styles.subtitle}>Signalements</h2>
        </div>
        <a
          href="#"
          onClick={() => dispatch(Actions.report.toggleFiltersDrawer())}
          className={styles.closeLink}
        >
          <i
            className={[
              'fr-icon-arrow-down-s-line',
              styles.closeLinkIcon,
              filtersDrawerOpen ? styles.closeLinkIconOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </a>
      </div>
      <div className={styles.body}>
        ({filtersDrawerOpen && <>Filtres ouverts</>}) (
        {!filtersDrawerOpen && (
          <>
            15 897 signalements ouverts
            <br />2 catégories sélectionnées
          </>
        )}
        )
      </div>
    </div>
  );
}
