import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import genericStyles from '@/styles/genericPanel.module.scss';
import styles from '@/styles/report/detailsPanel.module.scss';
import panelStyles from '@/styles/panel.module.scss';

import ReportMessage from '@/components/map/report/ReportMessage';
import ReportHead from '@/components/map/report/ReportHead';
import ReportForm from '@/components/map/report/ReportForm';

import { Report } from '@/types/report';

export default function ReportDetails({ report }: { report: Report }) {
  const dispatch: AppDispatch = useDispatch();

  const onClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(Actions.report.selectReport(null));
  };

  const answers = report?.messages.slice(1);

  return (
    <>
      <div className={`${genericStyles.container} ${styles.detailsContainer}`}>
        <div className={`${genericStyles.head} ${styles.head}`}>
          <div>
            <h2 className={`${genericStyles.subtitle} ${styles.headSubtitle}`}>
              Signalement
            </h2>
          </div>
          <a href="#" onClick={onClose} className={genericStyles.closeLink}>
            <i className="fr-icon-close-line" />
          </a>
        </div>

        <div className={genericStyles.body}>
          <div className={panelStyles.section}>
            <ReportHead report={report} />
          </div>

          <div className={panelStyles.section}>
            {answers?.map((message: any, index: number) => (
              <div key={index} className={styles.messageShell}>
                <ReportMessage message={message} />
              </div>
            ))}
          </div>

          <div className={panelStyles.section}>
            <ReportForm report={report} />
          </div>
        </div>
      </div>
    </>
  );
}
