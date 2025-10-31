import { useSelector } from 'react-redux';

import styles from '@/styles/genericPanel.module.scss';

import ReportFilters from './ReportFilters';
import ReportDetails from './ReportDetails';

export default function ReportPanels() {
  const filtersDrawerOpen = useSelector(
    (state: any) => state.report.filtersDrawerOpen,
  );
  const selectedReport = useSelector(
    (state: any) => state.report.selectedReport,
  );

  return (
    <div className={styles.reportShell}>
      <ReportFilters isOpen={filtersDrawerOpen} />
      {selectedReport && <ReportDetails report={selectedReport} />}
    </div>
  );
}
