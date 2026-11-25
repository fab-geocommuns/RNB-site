'use client';

import { useEffect, useState } from 'react';
import { fr } from '@codegouvfr/react-dsfr';
import { Accordion } from '@codegouvfr/react-dsfr/Accordion';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import { Button } from '@codegouvfr/react-dsfr/Button';
import BuildingValidations from '@/components/BuildingValidations';
import ReportStatus from '@/components/map/report/ReportStatus';
import { ApiBuilding } from '@/components/verification/useCaseGeometries';
import { distanceMeters } from '@/components/verification/useBuildingAddresses';
import { useBuildingHistory } from '@/components/verification/useBuildingHistory';
import { MapReport } from '@/components/verification/VerificationMap';
import { Report } from '@/types/report';
import { rnbApi } from '@/utils/rnbApi';
import { describeHistory, HistoryTone } from '@/utils/verification/history';

const { decisions } = fr.colors.getHex({ isDark: false });

const TONE_COLORS: Record<HistoryTone, string> = {
  creation: decisions.artwork.major.blueFrance.default,
  validation: decisions.text.default.success.default,
  change: decisions.text.mention.grey.default,
  removal: decisions.text.default.error.default,
};

// Rayon autour du bâtiment dans lequel on liste les signalements.
export const REPORTS_RADIUS_M = 60;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR');
}

export function shareUrl(rnbId: string) {
  return `${window.location.origin}/verification?q=${encodeURIComponent(rnbId)}`;
}

function ShareButton({ rnbId }: { rnbId: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => setCopied(false), [rnbId]);
  return (
    <Button
      size="small"
      priority="secondary"
      iconId={copied ? 'fr-icon-check-line' : 'fr-icon-links-line'}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(shareUrl(rnbId));
          setCopied(true);
        } catch {
          window.prompt('Lien du bâtiment :', shareUrl(rnbId));
        }
      }}
    >
      {copied ? 'Lien copié' : 'Copier le lien'}
    </Button>
  );
}

// « lat, lon » : se colle tel quel dans Google Maps, le Géoportail ou la
// recherche de la carte RNB.
export function formatLatLon([lon, lat]: [number, number]) {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

function CopyCoordinatesButton({ center }: { center: [number, number] }) {
  const [copied, setCopied] = useState(false);
  const text = formatLatLon(center);
  useEffect(() => setCopied(false), [text]);
  return (
    <Button
      size="small"
      priority="tertiary"
      iconId={copied ? 'fr-icon-check-line' : 'fr-icon-map-pin-2-line'}
      title="Copier « lat, lon » dans le presse-papiers"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        } catch {
          window.prompt('Coordonnées (lat, lon) :', text);
        }
      }}
    >
      {copied ? 'Copié' : text}
    </Button>
  );
}

function ExternalLinks({
  rnbId,
  center,
}: {
  rnbId: string;
  center: [number, number] | null;
}) {
  const links: [string, string][] = [
    ['Carte RNB', `/carte?q=${encodeURIComponent(rnbId)}`],
  ];
  if (center) {
    const [lon, lat] = center;
    links.push(
      [
        'Carte BAN',
        `https://adresse.data.gouv.fr/carte-base-adresse-nationale?lng=${lon}&lat=${lat}&zoom=19`,
      ],
      [
        'Remonter le temps',
        `https://remonterletemps.ign.fr/comparer/?lon=${lon}&lat=${lat}&z=18&layer1=ORTHOIMAGERY.ORTHOPHOTOS.1950-1965&layer2=ORTHOIMAGERY.ORTHOPHOTOS&mode=vSlider`,
      ],
      [
        'Panoramax',
        `https://api.panoramax.xyz/#focus=map&map=19/${lat}/${lon}`,
      ],
      [
        'Google Maps',
        `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lon}&zoom=19&basemap=satellite`,
      ],
    );
  }
  return (
    <ul className="fr-links-group fr-mb-0">
      {links.map(([label, href]) => (
        <li key={label}>
          <a
            className="fr-link fr-link--sm"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function History({ rnbId }: { rnbId: string }) {
  const { items, error } = useBuildingHistory(rnbId);

  if (error) return <p className="fr-text--sm">Historique indisponible.</p>;
  if (!items) return <p className="fr-text--sm">Chargement…</p>;

  const entries = describeHistory(items);
  const line = decisions.border.default.grey.default;

  return (
    <>
      <div role="list" className="fr-mb-2v">
        {entries.map((entry, i) => (
          <div
            role="listitem"
            key={entry.key}
            style={{
              position: 'relative',
              paddingLeft: fr.spacing('5v'),
              paddingBottom: i < entries.length - 1 ? fr.spacing('3v') : 0,
              borderLeft: `2px solid ${
                i < entries.length - 1 ? line : 'transparent'
              }`,
              marginLeft: fr.spacing('1v'),
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: '-7px',
                top: '0.3rem',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: TONE_COLORS[entry.tone],
                border: `2px solid ${decisions.background.default.grey.default}`,
              }}
            />
            <div
              className="fr-text--sm fr-mb-0"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: fr.spacing('2v'),
              }}
            >
              <strong>{entry.title}</strong>
              <span style={{ color: decisions.text.mention.grey.default }}>
                {entry.date}
              </span>
            </div>
            {entry.lines.map((text) => (
              <p
                key={text}
                className="fr-text--xs fr-mb-0"
                style={{ color: decisions.text.mention.grey.default }}
              >
                {text}
              </p>
            ))}
          </div>
        ))}
      </div>
      <a
        className="fr-link fr-link--sm"
        href={`/batiments/${encodeURIComponent(rnbId)}/historique`}
        target="_blank"
        rel="noopener noreferrer"
      >
        Historique complet
      </a>
    </>
  );
}

function Reports({ rnbId, reports }: { rnbId: string; reports: MapReport[] }) {
  const [details, setDetails] = useState<Record<number, Report>>({});
  const ids = reports.map((r) => r.id).join(',');

  useEffect(() => {
    const controller = new AbortController();
    reports
      .filter((r) => !details[r.id])
      .forEach((r) =>
        rnbApi
          .get<Report>(`reports/${r.id}/`, { signal: controller.signal })
          .then((report) =>
            setDetails((previous) => ({ ...previous, [report.id]: report })),
          )
          .catch(() => {}),
      );
    return () => controller.abort();
    // Relancé quand la liste d'identifiants change, pas à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  if (reports.length === 0) {
    return (
      <p className="fr-text--sm fr-mb-0">
        Aucun signalement à moins de {REPORTS_RADIUS_M} m.
      </p>
    );
  }

  const sorted = [...reports].sort(
    (a, b) =>
      Number(details[b.id]?.rnb_id === rnbId) -
      Number(details[a.id]?.rnb_id === rnbId),
  );

  return (
    <ul
      className="fr-text--sm fr-mb-0"
      style={{
        listStyle: 'none',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: fr.spacing('2v'),
      }}
    >
      {sorted.map((r) => {
        const report = details[r.id];
        const message = report?.messages[0]?.text;
        return (
          <li key={r.id}>
            <div
              style={{
                display: 'flex',
                gap: fr.spacing('2v'),
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <ReportStatus status={r.status as Report['status']} />
              {report?.rnb_id === rnbId && (
                <Badge small noIcon severity="info">
                  Ce bâtiment
                </Badge>
              )}
              <a
                className="fr-link fr-link--sm"
                href={`/carte?report=${r.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                n° {r.id}
              </a>
            </div>
            {report ? (
              <p className="fr-text--sm fr-mb-0">
                {formatDate(report.created_at)}
                {report.author?.username ? ` · ${report.author.username}` : ''}
                {report.rnb_id && report.rnb_id !== rnbId
                  ? ` · bâtiment ${report.rnb_id}`
                  : ''}
                {report.tags.length ? ` · ${report.tags.join(', ')}` : ''}
                {message ? ` — ${message}` : ''}
              </p>
            ) : (
              <p className="fr-text--sm fr-mb-0">Chargement…</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

// Informations sur le bâtiment affiché : statut, adresses, validation,
// signalements proches, historique, liens et lien de partage.
export default function BuildingInfo({
  building,
  center,
  reports,
}: {
  building: ApiBuilding;
  center: [number, number] | null;
  reports: MapReport[];
}) {
  const rnbId = building.rnb_id;
  const nearby = center
    ? reports.filter(
        (r) => distanceMeters(center, [r.lon, r.lat]) <= REPORTS_RADIUS_M,
      )
    : [];

  return (
    <div className="fr-mb-2v">
      <p className="fr-text--sm fr-mb-1v">
        Statut RNB : {building.status}
        {building.is_active ? '' : ' (inactif)'}
        {building.addresses.length > 0 &&
          ` · ${building.addresses
            .map((a) =>
              [a.street_number, a.street, a.city_name]
                .filter(Boolean)
                .join(' '),
            )
            .join(' ; ')}`}
      </p>
      {building.validated_by.length > 0 ? (
        <BuildingValidations building={building} allowEdit={false} />
      ) : (
        <p className="fr-text--sm fr-mb-1v">Bâtiment non validé.</p>
      )}
      <div
        style={{
          display: 'flex',
          gap: fr.spacing('2v'),
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <ExternalLinks rnbId={rnbId} center={center} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: fr.spacing('1v'),
          }}
        >
          <ShareButton rnbId={rnbId} />
          {center && <CopyCoordinatesButton center={center} />}
        </div>
      </div>
      <div className="fr-accordions-group fr-mt-2v">
        <Accordion label={`Signalements proches (${nearby.length})`}>
          <Reports rnbId={rnbId} reports={nearby} />
        </Accordion>
        <Accordion label="Historique">
          <History rnbId={rnbId} />
        </Accordion>
      </div>
    </div>
  );
}
