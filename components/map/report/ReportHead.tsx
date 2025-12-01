import styles from '@/styles/report/reportHead.module.scss';

import { useDispatch } from 'react-redux';
import { useEffect } from 'react';

import ReportMessage from '@/components/map/report/ReportMessage';
import { createModal } from '@codegouvfr/react-dsfr/Modal';
import { selectBuildingAndSetOperationUpdate } from '@/stores/edition/edition-slice';
import { Report } from '@/types/report';

export default function ReportHead({ report }: { report: Report }) {
  const dispatch = useDispatch();

  const detailsModal = createModal({
    id: `report-details-${report.id}`,
    isOpenedByDefault: false,
  });

  const createdAtDate = new Date(report.created_at);
  const formattedCreatedAt =
    createdAtDate.toLocaleDateString('fr-FR') +
    ' à ' +
    createdAtDate.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleOpenBuidlingClick = (e: React.MouseEvent, rnbId: string) => {
    e.preventDefault();
    dispatch(
      // @ts-ignore
      selectBuildingAndSetOperationUpdate(rnbId),
    );
  };

  const handleShowDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    detailsModal.open();
  };

  useEffect(() => {
    if (report?.rnb_id) {
      dispatch(
        // @ts-ignore
        selectBuildingAndSetOperationUpdate(report.rnb_id),
      );
    }
  }, [report]);

  return (
    <>
      <detailsModal.Component title="Détails du signalement">
        <ul>
          <li>Numéro : {report.id}</li>
          <li>Etiquettes : {report.tags.join(', ')}</li>
          <li>Créé le {formattedCreatedAt}</li>
        </ul>
      </detailsModal.Component>
      <div className={styles.head}>
        <ReportMessage message={report.messages[0]} status={report.status} />
        <ul className={styles.tools}>
          <li>
            <a href="#" onClick={(e) => handleShowDetailsClick(e)}>
              Plus d&apos;informations
            </a>
          </li>
          {report.rnb_id && (
            <li>
              <a
                href="#"
                onClick={(e) => handleOpenBuidlingClick(e, report.rnb_id)}
              >
                Voir le bâtiment {report.rnb_id}
              </a>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
