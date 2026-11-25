'use client';

import { fr } from '@codegouvfr/react-dsfr';
import { Badge } from '@codegouvfr/react-dsfr/Badge';
import BuildingValidations from '@/components/BuildingValidations';
import type { AnnotationStatus } from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import { ApiBuilding } from '@/components/verification/useCaseGeometries';
import { useBuildingHistory } from '@/components/verification/useBuildingHistory';
import { BuildingStatusMap } from '@/stores/contribution/contribution-types';
import {
  describeHistory,
  findValidationEvent,
  formatHistoryDate,
} from '@/utils/verification/history';

const ANNOTATION_LABELS: Record<
  AnnotationStatus,
  { label: string; severity: 'success' | 'warning' | 'error' }
> = {
  correct: { label: 'Correcte', severity: 'success' },
  uncertain: { label: 'Incertaine', severity: 'warning' },
  incorrect: { label: 'Incorrecte', severity: 'error' },
};

const { decisions } = fr.colors.getHex({ isDark: false });

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fr-mb-2v">
      <p
        className="fr-text--xs fr-mb-0"
        style={{ color: decisions.text.mention.grey.default }}
      >
        {label}
      </p>
      <div className="fr-text--sm fr-mb-0">{children}</div>
    </div>
  );
}

// Tout ce qu'il faut pour juger la validation actuelle du bâtiment : qui,
// quand, avec quel commentaire, sur quel état, et ses relectures.
export default function ValidationPane({
  building,
}: {
  building: ApiBuilding;
}) {
  const { items, error } = useBuildingHistory(building.rnb_id);

  if (building.validated_by.length === 0) {
    return <p className="fr-text--sm">Ce bâtiment n&apos;est pas validé.</p>;
  }
  if (error) return <p className="fr-text--sm">Historique indisponible.</p>;
  if (!items) return <p className="fr-text--sm">Chargement…</p>;

  const validation = findValidationEvent(items);
  const validationIndex = validation ? items.indexOf(validation) : -1;
  const since = describeHistory(items).slice(0, Math.max(validationIndex, 0));
  const origin = validation?.event.origin?.details as
    | { report_text?: string | null }
    | undefined;
  const comment = origin?.report_text?.trim();
  const annotations = validation?.event.annotations ?? [];
  const author = validation?.event.author;

  return (
    <div>
      <BuildingValidations building={building} allowEdit={false} />
      {validation ? (
        <>
          <Row label="Validé le">
            {formatHistoryDate(validation.updated_at)}
            {author
              ? ` par ${author.username}${
                  (author.organization_short_name ?? author.organization_name)
                    ? ` (${author.organization_short_name ?? author.organization_name})`
                    : ''
                }`
              : ''}
          </Row>
          <Row label="Commentaire du validateur">
            {comment ? `« ${comment} »` : <em>Aucun commentaire</em>}
          </Row>
          <Row label="État validé">
            Statut{' '}
            {BuildingStatusMap[
              validation.status as keyof typeof BuildingStatusMap
            ] ?? validation.status}
            {' · '}
            {validation.addresses.length} adresse
            {validation.addresses.length > 1 ? 's' : ''} liée
            {validation.addresses.length > 1 ? 's' : ''}
            {' · '}
            {validation.shape ? 'avec forme' : 'point seul'}
          </Row>
          <Row label="Depuis la validation">
            {since.length === 0
              ? 'Aucune modification.'
              : since.map((e) => `${e.title} (${e.date})`).join(' ; ')}
          </Row>
          <Row label={`Relectures (${annotations.length})`}>
            {annotations.length === 0 ? (
              <em>Pas encore relue.</em>
            ) : (
              <ul
                style={{ listStyle: 'none', padding: 0, margin: 0 }}
                className="fr-mb-0"
              >
                {annotations.map((a) => (
                  <li key={a.id} className="fr-mb-1v">
                    <Badge
                      small
                      noIcon
                      severity={ANNOTATION_LABELS[a.status].severity}
                    >
                      {ANNOTATION_LABELS[a.status].label}
                    </Badge>{' '}
                    {a.reviewer.display_name || a.reviewer.username},{' '}
                    {formatHistoryDate(a.created_at)}
                    {a.comment ? ` — « ${a.comment} »` : ''}
                  </li>
                ))}
              </ul>
            )}
          </Row>
          <a
            className="fr-link fr-link--sm"
            href={`/batiments/${encodeURIComponent(building.rnb_id)}/historique#${validation.event.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Annoter sur la page historique (relecteurs)
          </a>
        </>
      ) : (
        <p className="fr-text--sm">
          Validation introuvable dans l&apos;historique.
        </p>
      )}
    </div>
  );
}
