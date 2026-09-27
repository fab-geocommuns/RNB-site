import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import genericStyles from '@/styles/genericPanel.module.scss';
import styles from '@/styles/report/detailsPanel.module.scss';
import panelStyles from '@/styles/panel.module.scss';

import ReportMessage from '@/components/map/report/ReportMessage';
import ReportHead from '@/components/map/report/ReportHead';
import ReportForm from '@/components/map/report/ReportForm';
import ReportPagination from '@/components/map/report/ReportPagination';

import { Report } from '@/types/report';

export default function ReportDetails({ report }: { report: Report }) {
  const dispatch: AppDispatch = useDispatch();

  const onClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(Actions.report.selectReport(null));
  };

  const answers = report.messages.slice(1);

  return (
    <>
      <div className={`${genericStyles.container} ${styles.detailsContainer}`}>
        <div className={`${genericStyles.head} ${styles.head}`}>
          <div>
            <h2 className={`${genericStyles.subtitle} ${styles.headSubtitle}`}>
              Signalement
            </h2>
          </div>
          <ReportPagination reportId={report.id} />
          <a href="#" onClick={onClose} className={genericStyles.closeLink}>
            <i className="fr-icon-close-line" />
          </a>
        </div>

        <div className={genericStyles.body}>
          <div className={panelStyles.section}>
            <ReportHead report={report} />
          </div>

          {answers.length > 0 && (
            <div className={panelStyles.section}>
              {answers.map((message: any, index: number) => (
                <ReportMessage key={index} message={message} />
              ))}
            </div>
          )}

          <div className={panelStyles.section}>
            <ReportForm report={report} />
          </div>
        </div>
      </div>
    </>
  );
}
