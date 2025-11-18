// Store
import { useDispatch } from 'react-redux';
import { Actions } from '@/stores/store';

import panelStyles from '@/styles/genericPanel.module.scss';
import filterStyles from '@/styles/reportFilters.module.scss';

export default function ReportFilters({ isOpen }: { isOpen?: boolean }) {
  // Store

  const dispatch = useDispatch();

  return (
    <div className={`${panelStyles.container} ${filterStyles.shell}`}>
      <div
        className={panelStyles.head}
        onClick={() => dispatch(Actions.report.toggleFiltersDrawer())}
      >
        <div>
          <h2 className={panelStyles.subtitle}>Filtrer les signalements</h2>
        </div>
        <a href="#" className={panelStyles.closeLink}>
          <i
            className={[
              'fr-icon-arrow-down-s-line',
              panelStyles.closeLinkIcon,
              isOpen ? panelStyles.closeLinkIconOpen : '',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        </a>
      </div>
      {isOpen && (
        <div className={panelStyles.body}>
          15 897 signalements ouverts
          <br />2 catégories sélectionnées
        </div>
      )}
    </div>
  );
}
