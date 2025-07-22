import styles from '@/styles/history.module.scss';
import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import { formatDate } from '@/components/history/Timeline';
import {
  BuildingStatusMap,
  BuildingStatusType,
} from '@/stores/contribution/contribution-types';
import VisuMap from '@/components/map/VisuMap';

export default function Details({
  detailsInfo,
  responsivePanelIsOpen,
}: {
  detailsInfo: ApiHistoryItem;
  responsivePanelIsOpen: boolean;
}) {
  return (
    <section
      className={`${styles.detailSection} ${responsivePanelIsOpen ? styles.detailSectionOpen : styles.detailSectionClosed}`}
    >
      <div className={styles.detailsWrapper}>
        {detailsInfo.updated_at && (
          <h2 className={styles.detailsSubtitle}>
            Version publiée le {formatDate(detailsInfo.updated_at)}
          </h2>
        )}
        {detailsInfo.event?.author?.username && (
          <span className={styles.detailInfo}>
            Par {detailsInfo.event.author.username}
          </span>
        )}
        <div className={styles.detailBlock}>
          {detailsInfo.status && (
            <div className={styles.detailInfo}>
              <div className={styles.detailLabel}>
                <span>Statut physique :</span>
              </div>
              <span>
                {BuildingStatusMap[detailsInfo.status as BuildingStatusType] ||
                  detailsInfo.status}
              </span>
            </div>
          )}
          <div className={styles.detailInfo}>
            <div className={styles.detailLabel}>
              <span>État :</span>
            </div>
            <span>{detailsInfo.is_active ? 'Activé' : 'Désactivé'}</span>
          </div>
        </div>
        <div className={styles.detailInfo}>
          <div className={styles.detailAddresses}>
            <span className={styles.detailLabel}>Adresses : </span>
            {detailsInfo?.addresses?.length ? (
              <div className={styles.detailAddressItems}>
                {detailsInfo.addresses.map((addresse, i) => (
                  <div key={i}>
                    <div>
                      <span className={styles.mergePanel__addressText}>
                        {addresse.street_number}
                        {addresse.street_rep} {addresse.street}{' '}
                        {addresse.city_zipcode} {addresse.city_name}
                      </span>
                    </div>
                    <span>
                      ({addresse.source} : {addresse.id})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <span>
                <i>Aucune adresse disponible</i>
              </span>
            )}
          </div>
        </div>
        {detailsInfo.ext_ids?.length && (
          <div className={styles.detailAddresses}>
            <span className={styles.detailLabel}>Identifiants externes : </span>
            <div className={styles.detailAddressItems}>
              {detailsInfo.ext_ids.map((extId, i) => (
                <div key={i}>
                  <span>
                    {extId.source} - {extId.id} (version {extId.source_version})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <VisuMap />
        </div>
      </div>
      <div>
        <h2 className={styles.detailsSubtitle}>
          Informations sur l&apos;évènement
        </h2>
        <div className={styles.detailsWrapper}>
          {detailsInfo.event?.origin?.details?.imported_database && (
            <div className={styles.detailInfo}>
              <div className={styles.detailLabel}>
                <span>Origine :</span>
              </div>
              <span>
                {detailsInfo.event?.origin?.type}{' '}
                {detailsInfo.event?.origin?.details?.imported_database} (ID:{' '}
                {detailsInfo.event?.origin?.id})
              </span>
            </div>
          )}
          {detailsInfo.event?.type && (
            <div className={styles.detailInfo}>
              <div className={styles.detailLabel}>
                <span>Type d&apos;évènement :</span>
              </div>
              <span>{detailsInfo.event.type}</span>
            </div>
          )}
          {detailsInfo.event?.id && (
            <div className={styles.detailInfo}>
              <div className={styles.detailLabel}>
                <span>Identifiant de l&apos;évènement :</span>
              </div>
              <span>{detailsInfo.event.id}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
