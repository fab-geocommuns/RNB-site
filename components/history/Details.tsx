import styles from '@/styles/history.module.scss';
import { formatDate, formatTime } from '@/utils/date';
import changedImage from '@/public/images/history/changed.svg';
import { ApiHistoryItem } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import CopyInlineBtn from '@/components/util/CopyInlineBtn';
import VisuMapReact from '@/components/map/VisuMapReact';

import {
  BuildingStatusMap,
  BuildingStatusType,
} from '@/stores/contribution/contribution-types';
import { useState } from 'react';

import { getHistoryLongTitle, displayAuthor } from '@/logic/history';
import Link from 'next/link';

export default function Details({
  detailsInfo,
  responsivePanelIsOpen,
}: {
  detailsInfo: ApiHistoryItem;
  responsivePanelIsOpen: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };
  return (
    <section
      className={`${styles.detailSection} ${responsivePanelIsOpen ? styles.detailSectionOpen : styles.detailSectionClosed}`}
    >
      <div className={styles.detailsWrapper}>
        {detailsInfo.updated_at && (
          <h2 className={styles.detailsSubtitle}>
            {getHistoryLongTitle(detailsInfo)}
          </h2>
        )}
        <div>
          <span className={`${styles.detailInfo} ${styles.user}`}>
            Le {formatDate(detailsInfo.updated_at)} à{' '}
            {formatTime(detailsInfo.updated_at)} -{' '}
            <span className={`${styles.detailInfoUser}`}>
              par {displayAuthor(detailsInfo)}
            </span>
          </span>
        </div>

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
                <br />
                <a href={formatPanoramaxLink(detailsInfo)} target="_blank">
                  Consulter le site Panoramax
                </a>
              </div>
              <div className={styles.latLonWrapper}>
                <div className={styles.latLon}>
                  <span>
                    Coordonnées: {detailsInfo.point.coordinates[1]},{' '}
                    {detailsInfo.point.coordinates[0]}
                  </span>
                </div>
                <CopyInlineBtn
                  tooltipText="Copier les coordonnées"
                  strToCopy={`${detailsInfo.point.coordinates[1]},${detailsInfo.point.coordinates[0]}`}
                />
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
                      <div className="fr-mb-3v" key={i}>
                        <div>
                          <span className={styles.mergePanelAddressText}>
                            {addresse.street_number}
                            {addresse.street_rep} {addresse.street}{' '}
                            {addresse.city_zipcode} {addresse.city_name}
                          </span>
                        </div>
                        <small>(Clé BAN : {addresse.id})</small>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span>
                    <i>Aucune adresse liée à ce bâtiment</i>
                  </span>
                )}
              </div>
              <div className={styles.banLink}>
                <a href={formatLinkBan(detailsInfo)} target="_blank">
                  Consulter le site de la Base Adresse Nationale
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
                <div className="fr-mb-3v" key={i}>
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

          {detailsInfo.event?.type === 'merge' && (
            <>
              <div className={styles.detailBlockInfo}>
                <div className={styles.detailInfo}>
                  <div className={styles.detailLabel}>
                    <span>Parents de la fusion :</span>
                  </div>
                  <span>
                    {detailsInfo.event?.details?.merge_parents?.map(
                      (parentId: string, i: number) => (
                        <span key={i}>
                          <Link
                            target="_blank"
                            href={`/batiments/${parentId}/historique/#${detailsInfo.event?.id}`}
                          >
                            {parentId}
                          </Link>
                          {parentId === detailsInfo.rnb_id && ' (ce bâtiment)'}
                          {i <
                            (detailsInfo.event?.details?.merge_parents
                              ?.length ?? 0) -
                              1 && ', '}
                        </span>
                      ),
                    )}
                  </span>
                </div>
              </div>
              <div className={styles.detailBlockInfo}>
                <div className={styles.detailInfo}>
                  <div className={styles.detailLabel}>
                    <span>Enfant de la fusion :</span>
                  </div>
                  <span>
                    <Link
                      target="_blank"
                      href={`/batiments/${detailsInfo.event?.details?.merge_child}/historique/#${detailsInfo.event?.id}`}
                    >
                      {detailsInfo.event?.details?.merge_child}
                    </Link>
                    {detailsInfo.event?.details?.merge_child ==
                      detailsInfo.rnb_id && <span> (ce bâtiment)</span>}
                  </span>
                </div>
              </div>
            </>
          )}

          {detailsInfo.event?.type === 'split' && (
            <>
              <div className={styles.detailBlockInfo}>
                <div className={styles.detailInfo}>
                  <div className={styles.detailLabel}>
                    <span>Parent de la scission :</span>
                  </div>
                  <span>
                    <Link
                      target="_blank"
                      href={`/batiments/${detailsInfo.event?.details?.split_parent}/historique/#${detailsInfo.event?.id}`}
                    >
                      {detailsInfo.event?.details?.split_parent}
                    </Link>
                    {detailsInfo.event?.details?.split_parent ==
                      detailsInfo.rnb_id && <span> (ce bâtiment)</span>}
                  </span>
                </div>
              </div>

              <div className={styles.detailBlockInfo}>
                <div className={styles.detailInfo}>
                  <div className={styles.detailLabel}>
                    <span>Enfants de la scission :</span>
                  </div>
                  <span>
                    {detailsInfo.event?.details?.split_children?.map(
                      (childId: string, i: number) => (
                        <span key={i}>
                          <Link
                            target="_blank"
                            href={`/batiments/${childId}/historique/#${detailsInfo.event?.id}`}
                          >
                            {childId}
                          </Link>
                          {childId === detailsInfo.rnb_id && ' (ce bâtiment)'}
                          {i <
                            (detailsInfo.event?.details?.split_children
                              ?.length ?? 0) -
                              1 && ', '}
                        </span>
                      ),
                    )}
                  </span>
                </div>
              </div>
            </>
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
  if (infos?.event?.details?.merge_role && infos.event.type === 'merge')
    return infos.event.details.merge_role;
  if (infos?.event?.details?.split_role && infos.event.type === 'split')
    return infos.event.details.split_role;
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
function formatPanoramaxLink(infos: ApiHistoryItem) {
  if (infos?.point?.coordinates)
    return `https://api.panoramax.xyz/?focus=map&map=18.5/${infos.point.coordinates[1]}/${infos.point.coordinates[0]}`;
  return 'https://panoramax.fr/';
}
