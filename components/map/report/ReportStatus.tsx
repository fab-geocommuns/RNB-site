import styles from '@/styles/report/reportStatus.module.scss';
import { fr } from '@codegouvfr/react-dsfr';

import type { ReportStatus } from '@/types/report';

function statusLabel(status: ReportStatus): string {
  switch (status) {
    case 'pending':
      return 'Ouvert';
    case 'fixed':
      return 'Corrigé';
    case 'rejected':
      return 'Refusé';
  }
}

export default function ReportStatus({ status }: { status: ReportStatus }) {
  return (
    <div className={`${styles.reportStatus} ${styles[status]}`}>
      {status == 'fixed' && <i className={fr.cx('fr-icon-check-line')}></i>}
      {status == 'rejected' && <i className={fr.cx('fr-icon-error-line')}></i>}
      {status == 'pending' && (
        <i className={fr.cx('fr-icon-question-line')}></i>
      )}
      <span>{statusLabel(status)}</span>
    </div>
  );
}
