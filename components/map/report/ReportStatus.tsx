import styles from '@/styles/report/reportStatus.module.scss';

import type { ReportStatus, ReportLabel } from 'report';

function statusLabel(status: ReportStatus): ReportLabel {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'fixed':
      return 'Corrigé';
    case 'rejected':
      return 'Refusé';
  }
}

export default function ReportStatus({ status }: { status: ReportStatus }) {
  return (
    <div className={`${styles.reportStatus} ${styles[status]}`}>
      {statusLabel(status)}
    </div>
  );
}
