import styles from '@/styles/history.module.scss';
import changedImage from '@/public/images/history/changed.svg';
import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import { formatDate } from '@/components/history/Timeline';
import VisuMapReact from '@/components/map/VisuMapReact';
import {
  BuildingStatusMap,
  BuildingStatusType,
} from '@/stores/contribution/contribution-types';

import { getHumanFriendlyOperation } from '@/logic/history';

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
            {getHumanFriendlyOperation(detailsInfo)}
          </h2>
        )}
        {detailsInfo.event?.author?.username && (
          <span className={`${styles.detailInfo} ${styles.user}`}>
            Le {formatDate(detailsInfo.updated_at)} - par{' '}
            {detailsInfo.event.author.username}
          </span>
        )}
        <div className={styles.detailBlock}>
          {detailsInfo.status && (
            <div className={styles.detailBlockInfo}>
              <div className={styles.detailInfo}>
                <div className={styles.detailLabel}>
                  <span className={styles.label}>
                    Statut physique :
                    {detailsInfo.event?.details?.updated_fields?.includes(
                      'status',
                    ) && (
                      <div className={styles.changedWrapper}>
                        <img
                          src={changedImage.src}
                          alt="Modifié"
                          width="12"
                          height="12"
                        />
                      </div>
                    )}
                  </span>
                </div>
                <span>
                  {BuildingStatusMap[
                    detailsInfo.status as BuildingStatusType
                  ] || detailsInfo.status}
                </span>
              </div>
              <div className={styles.banLink}>
                <a href={formatLinkGoBackIgn(detailsInfo)} target="_blank">
                  Consulter le site Remonter le Temps de l&apos;IGN
                </a>
              </div>
            </div>
          )}
          <div className={styles.detailBlockInfo}>
            <div className={styles.detailInfo}>
              <div className={styles.detailLabel}>
                <span className={styles.label}>
                  État :
                  {detailsInfo.event?.details?.updated_fields?.includes(
                    'is_active',
                  ) && (
                    <div className={styles.changedWrapper}>
                      <img
                        src={changedImage.src}
                        alt="Modifié"
                        width="12"
                        height="12"
                      />
                    </div>
                  )}
                </span>
              </div>
              <span>{detailsInfo.is_active ? 'Activé' : 'Désactivé'}</span>
            </div>
          </div>
        </div>
        <div className={styles.detailBlockInfo}>
          <div className={styles.detailInfo}>
            <span className={styles.detailLabel}>
              <span className={styles.label}>
                Géométrie :
                {detailsInfo.event?.details?.updated_fields?.includes(
                  'shape',
                ) && (
                  <div className={styles.changedWrapper}>
                    <img
                      src={changedImage.src}
                      alt="Modifié"
                      width="12"
                      height="12"
                    />
                  </div>
                )}
              </span>
            </span>
            {detailsInfo.point && detailsInfo.shape && (
              <div className={styles.detailMap}>
                <VisuMapReact
                  point={detailsInfo.point}
                  shape={detailsInfo.shape}
                />
              </div>
            )}
          </div>
        </div>
        <div className={styles.detailBlockInfo}>
          <div className={styles.detailInfo}>
            <div>
              <div className={styles.detailAddresses}>
                <span className={styles.detailLabel}>
                  <span className={styles.label}>
                    Adresses :
                    {detailsInfo.event?.details?.updated_fields?.includes(
                      'addresses',
                    ) && (
                      <div className={styles.changedWrapper}>
                        <img
                          src={changedImage.src}
                          alt="Modifié"
                          width="12"
                          height="12"
                        />
                      </div>
                    )}
                  </span>
                </span>
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
                        <span>(Clé BAN : {addresse.id})</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>
                    <i>Aucune adresse disponible</i>
                  </span>
                )}
              </div>
              <div className={styles.banLink}>
                <a href={formatLinkBan(detailsInfo)} target="_blank">
                  Consulter la Base Adresse Nationale à cet endroit
                </a>
              </div>
            </div>
          </div>
        </div>
        {detailsInfo.ext_ids?.length > 0 && (
          <div className={styles.detailAddresses}>
            <span className={styles.detailLabel}>
              <span className={styles.label}>
                Identifiants externes :
                {detailsInfo.event?.details?.updated_fields?.includes(
                  'ext_ids',
                ) && (
                  <div className={styles.changedWrapper}>
                    <img
                      src={changedImage.src}
                      alt="Modifié"
                      width="12"
                      height="12"
                    />
                  </div>
                )}
              </span>
            </span>
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
      </div>
      <div>
        <h2 className={styles.detailsSubtitle}>
          Informations sur l&apos;évènement
        </h2>
        <div className={styles.detailsWrapper}>
          {detailsInfo.event?.origin?.details?.imported_database && (
            <div className={styles.detailBlockInfo}>
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
            </div>
          )}
          {detailsInfo.event?.type && (
            <div className={styles.detailBlockInfo}>
              <div className={styles.detailInfo}>
                <div className={styles.detailLabel}>
                  <span>Type d&apos;évènement :</span>
                </div>
                <span>{formatType(detailsInfo.event.type)} </span>
                {roleEvent(detailsInfo) && (
                  <span className={styles.roleEvent}>
                    {' '}
                    ({roleEvent(detailsInfo)})
                  </span>
                )}
              </div>
            </div>
          )}
          {detailsInfo.event?.id && (
            <div className={styles.detailBlockInfo}>
              <div className={styles.detailInfo}>
                <div className={styles.detailLabel}>
                  <span>Identifiant de l&apos;évènement :</span>
                </div>
                <span>{detailsInfo.event.id}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function roleEvent(infos: ApiHistoryItem): string | null {
  if (infos.event.type === 'merge') return infos.event.details.merge_role;
  if (infos.event.type === 'split') return infos.event.details.split_role;
  return null;
}

function formatType(type: string): string {
  if (type === 'reactivation') return 'réactivation';
  if (type === 'deactivation') return 'désactivation';
  if (type === 'update') return 'mise à jour';
  if (type === 'creation') return 'création';
  if (type === 'merge') return 'fusion';
  return 'scission';
}
function formatLinkBan(infos: ApiHistoryItem) {
  if (infos?.point?.coordinates)
    return `https://adresse.data.gouv.fr/carte-base-adresse-nationale#${infos.point.coordinates[1]}_${infos.point.coordinates[0]}_18.50`;
  return 'https://adresse.data.gouv.fr/carte-base-adresse-nationale';
}
function formatLinkGoBackIgn(infos: ApiHistoryItem) {
  if (infos?.point?.coordinates)
    return `https://remonterletemps.ign.fr/comparer/?lon=${infos.point.coordinates[0]}&lat=${infos.point.coordinates[1]}&z=18.50&layer1=10&layer2=16`;
  return 'https://remonterletemps.ign.fr/comparer';
}
