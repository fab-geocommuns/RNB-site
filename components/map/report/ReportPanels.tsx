import { useSelector } from 'react-redux';

import styles from '@/styles/genericPanel.module.scss';

import ReportFilters from './ReportFilters';
import ReportDetails from './ReportDetails';
import { RootState } from '@/stores/store';

export default function ReportPanels() {
  const filtersDrawerOpen = useSelector(
    (state: RootState) => state.report.filtersDrawerOpen,
  );
  const selectedReport = useSelector(
    (state: RootState) => state.report.selectedReport,
  );
  const layersSwitcherOpen = useSelector(
    (state: RootState) => state.map.layersSwitcherOpen,
  );

  if (layersSwitcherOpen) return null;

  return (
    <div className={styles.reportShell}>
      <ReportFilters isOpen={filtersDrawerOpen} />
      {selectedReport && (
        <ReportDetails key={selectedReport.id} report={selectedReport} />
      )}
    </div>
  );
}
