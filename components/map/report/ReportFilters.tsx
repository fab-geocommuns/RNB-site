// Store
import { useDispatch } from 'react-redux';
import { Actions } from '@/stores/store';

import styles from '@/styles/genericPanel.module.scss';

export default function ReportFilters({ isOpen }: { isOpen?: boolean }) {
  // Store

  const dispatch = useDispatch();

  return (
    <div className={styles.container}>
      <div
        className={styles.head}
        onClick={() => dispatch(Actions.report.toggleFiltersDrawer())}
      >
        <div>
          <h2 className={styles.subtitle}>Filtrer les signalements</h2>
        </div>
        <a href="#" className={styles.closeLink}>
          <i
            className={[
              'fr-icon-arrow-down-s-line',
              styles.closeLinkIcon,
              isOpen ? styles.closeLinkIconOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </a>
      </div>
      {isOpen && (
        <div className={styles.body}>
          15 897 signalements ouverts
          <br />2 catégories sélectionnées
        </div>
      )}
    </div>
  );
}
