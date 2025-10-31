import styles from '@/styles/genericPanel.module.scss';

import ReportFilters from './ReportFilters';
import ReportDetails from './ReportDetails';

// css classes

export default function ReportPanels() {
  return (
    <div className={styles.reportShell}>
      <ReportFilters />
      <ReportDetails />
    </div>
  );
}
