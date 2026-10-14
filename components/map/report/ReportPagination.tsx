import { useDispatch, useSelector } from 'react-redux';
import { fr } from '@codegouvfr/react-dsfr';
import Button from '@codegouvfr/react-dsfr/Button';

import { Actions, AppDispatch, RootState } from '@/stores/store';
import styles from '@/styles/report/detailsPanel.module.scss';

export default function ReportPagination({ reportId }: { reportId: number }) {
  const dispatch: AppDispatch = useDispatch();
  const reportIds = useSelector(
    (state: RootState) => state.report.reportIdsAtPoint,
  );

  const index = reportIds.indexOf(reportId);
  if (reportIds.length < 2 || index === -1) return null;

  const goTo = (targetIndex: number) =>
    dispatch(Actions.report.selectReport(reportIds[targetIndex]));

  return (
    <div className={styles.pagination}>
      <p className={fr.cx('fr-text--sm', 'fr-mb-0')}>
        {index + 1} sur {reportIds.length}
      </p>
      <Button
        priority="tertiary no outline"
        size="small"
        iconId="fr-icon-arrow-left-s-line"
        title="Signalement précédent"
        disabled={index === 0}
        onClick={() => goTo(index - 1)}
      />
      <Button
        priority="tertiary no outline"
        size="small"
        iconId="fr-icon-arrow-right-s-line"
        title="Signalement suivant"
        disabled={index === reportIds.length - 1}
        onClick={() => goTo(index + 1)}
      />
    </div>
  );
}
