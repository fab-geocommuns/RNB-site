import styles from '@/styles/genericPanel.module.scss';

import ReportFilters from './ReportFilters';

// css classes

export default function ReportPanels() {
  return (
    <div className={styles.reportShell}>
      <ReportFilters />
    </div>
  );
}
