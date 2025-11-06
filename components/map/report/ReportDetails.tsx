import { useDispatch } from 'react-redux';
import { Actions, AppDispatch } from '@/stores/store';
import genericStyles from '@/styles/genericPanel.module.scss';
import styles from '@/styles/report/detailsPanel.module.scss';

export default function ReportDetails({ report }: { report?: any }) {
  const dispatch: AppDispatch = useDispatch();

  const onClose = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    dispatch(Actions.report.selectReport(null));
  };

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
      <div className={genericStyles.body}></div>
    </div>
  );
}
