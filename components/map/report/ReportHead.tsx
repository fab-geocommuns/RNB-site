import styles from '@/styles/report/reportHead.module.scss';

import { useDispatch } from 'react-redux';
import { Actions } from '@/stores/store';

import ReportMessage from '@/components/map/report/ReportMessage';
import { createModal } from '@codegouvfr/react-dsfr/Modal';

export default function ReportHead({ report }: { report: any }) {
  const dispatch = useDispatch();

  const hasAnswers = report.properties.messages.length > 1;

  const detailsModal = createModal({
    id: `report-details-${report.id}`,
    isOpenedByDefault: false,
  });

  const createdAtDate = new Date(report.properties.created_at);
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
      Actions.map.selectBuilding(rnbId),
    );
  };

  const handleShowDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    detailsModal.open();
  };

  return (
    <>
      <detailsModal.Component title="Détails du signalement">
        <ul>
          <li>Numéro : {report.id}</li>
          <li>Etiquettes : {report.properties.tags.join(', ')}</li>
          <li>Créé le {formattedCreatedAt}</li>
        </ul>
      </detailsModal.Component>
      <div className={`${styles.head} ${hasAnswers ? styles.withAnswers : ''}`}>
        <ReportMessage
          message={report.properties.messages[0]}
          status={report.properties.status}
        />
        <ul className={styles.tools}>
          <li>
            <a href="#" onClick={(e) => handleShowDetailsClick(e)}>
              Plus d'informations
            </a>
          </li>
          {report.properties.building && (
            <li>
              <a
                href="#"
                onClick={(e) =>
                  handleOpenBuidlingClick(e, report.properties.building)
                }
              >
                Voir le bâtiment {report.properties.building}
              </a>
            </li>
          )}
        </ul>
      </div>
    </>
  );
}
