import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import genericStyles from '@/styles/genericPanel.module.scss';
import styles from '@/styles/report/detailsPanel.module.scss';

import ReportMessage from '@/components/map/report/ReportMessage';
import ReportHead from '@/components/map/report/ReportHead';
import ReportForm from '@/components/map/report/ReportForm';

export default function ReportDetails({ report }: { report?: any }) {
  const dispatch: AppDispatch = useDispatch();

  const onClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(Actions.report.selectReport(null));
  };

  const answers = report?.properties.messages.slice(1);

  return (
    <div className={`${genericStyles.container} ${styles.detailsContainer}`}>
      <div className={genericStyles.head}>
        <div>
          <h2 className={genericStyles.subtitle}>Signalement</h2>
        </div>
        <a href="#" onClick={onClose} className={genericStyles.closeLink}>
          <i className="fr-icon-close-line" />
        </a>
      </div>
      <div className={genericStyles.body}>
        <ReportHead report={report} />

        {answers?.map((message: any, index: number) => (
          <div key={index} className={styles.messageShell}>
            <ReportMessage message={message} />
          </div>
        ))}

        <ReportForm report={report} />
      </div>
    </div>
  );
}
