'use client';

import { useState } from 'react';
import { RadioButtons } from '@codegouvfr/react-dsfr/RadioButtons';
import Button from '@codegouvfr/react-dsfr/Button';
import { Alert } from '@codegouvfr/react-dsfr/Alert';

import styles from '@/styles/history.module.scss';
import { formatDate, formatTime } from '@/utils/date';
import { useRNBFetch } from '@/utils/useRNBFetch';
import { throwErrorMessageForHumans } from '@/components/contribution/toaster';
import {
  AnnotationStatus,
  EditionAnnotation,
} from '@/app/(fullscreenMap)/batiments/[id]/historique/page';
import {
  ANNOTATION_STATUSES,
  ANNOTATION_STATUS_LABELS,
  ANNOTATION_STATUS_SEVERITY,
  STATUSES_WITH_COMMENT,
  annotationsApiUrl,
  findMyAnnotation,
} from '@/logic/annotations';

type Feedback = { severity: 'success' | 'error'; message: string } | null;

/**
 * Panneau de relecture d'une édition (event_id), réservé aux reviewers.
 * Liste les annotations de tous les reviewers et propose au reviewer courant de
 * créer / modifier / supprimer la sienne. Encapsule l'appel API (PUT/DELETE),
 * le feedback et remonte la liste à jour via onAnnotationsChange.
 */
export default function AnnotationPanel({
  eventId,
  annotations,
  currentUsername,
  onAnnotationsChange,
}: {
  eventId: string;
  annotations: EditionAnnotation[];
  currentUsername?: string | null;
  onAnnotationsChange: (eventId: string, next: EditionAnnotation[]) => void;
}) {
  const { fetch } = useRNBFetch();
  const myAnnotation = findMyAnnotation(annotations, currentUsername);

  const [status, setStatus] = useState<AnnotationStatus>(
    myAnnotation?.status ?? 'correct',
  );
  const [comment, setComment] = useState<string>(myAnnotation?.comment ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  const sortedAnnotations = [...annotations].sort((a, b) =>
    a.created_at.localeCompare(b.created_at),
  );

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setFeedback(null);

    const body: { status: AnnotationStatus; comment?: string } = { status };
    const trimmed = comment.trim();
    if (trimmed.length > 0) {
      body.comment = trimmed;
    }

    try {
      const response = await fetch(annotationsApiUrl(eventId), {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        await throwErrorMessageForHumans(response);
      }
      const saved: EditionAnnotation = await response.json();
      const others = annotations.filter(
        (a) => a.reviewer.username !== currentUsername,
      );
      onAnnotationsChange(eventId, [...others, saved]);
      setFeedback({
        severity: 'success',
        message: 'Votre annotation a bien été enregistrée.',
      });
    } catch (err: any) {
      setFeedback({
        severity: 'error',
        message:
          err.message || "Erreur lors de l'enregistrement de l'annotation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(annotationsApiUrl(eventId), {
        method: 'DELETE',
      });
      if (!response.ok) {
        await throwErrorMessageForHumans(response);
      }
      const next = annotations.filter(
        (a) => a.reviewer.username !== currentUsername,
      );
      onAnnotationsChange(eventId, next);
      setStatus('correct');
      setComment('');
      setFeedback({
        severity: 'success',
        message: 'Votre annotation a été supprimée.',
      });
    } catch (err: any) {
      setFeedback({
        severity: 'error',
        message: err.message || "Erreur lors de la suppression de l'annotation",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.annotationPanel}>
      <h2 className={styles.detailsSubtitle}>Relecture de l&apos;édition</h2>

      {sortedAnnotations.length > 0 ? (
        <ul className={styles.annotationList}>
          {sortedAnnotations.map((annotation) => {
            const isMine = annotation.reviewer.username === currentUsername;
            return (
              <li key={annotation.id} className={styles.annotationItem}>
                <div className={styles.annotationMeta}>
                  <span
                    className={`fr-badge fr-badge--sm fr-badge--no-icon fr-badge--${ANNOTATION_STATUS_SEVERITY[annotation.status]}`}
                  >
                    {ANNOTATION_STATUS_LABELS[annotation.status]}
                  </span>
                  <span className={styles.annotationReviewer}>
                    {annotation.reviewer.display_name ||
                      annotation.reviewer.username}
                    {annotation.reviewer.organization_name
                      ? ` (${annotation.reviewer.organization_name})`
                      : ''}
                    {isMine ? ' — vous' : ''}
                  </span>
                  <span className={styles.annotationDate}>
                    Le {formatDate(annotation.updated_at)} à{' '}
                    {formatTime(annotation.updated_at)}
                  </span>
                </div>
                {annotation.comment && (
                  <p className={styles.annotationComment}>
                    {annotation.comment}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className={styles.annotationEmpty}>
          <i>Cette édition n&apos;a pas encore été annotée.</i>
        </p>
      )}

      <form className={styles.annotationForm} onSubmit={handleSave}>
        <RadioButtons
          legend={
            myAnnotation ? 'Modifier votre annotation' : 'Annoter cette édition'
          }
          name="annotation-status"
          small
          options={ANNOTATION_STATUSES.map((s) => ({
            label: ANNOTATION_STATUS_LABELS[s],
            nativeInputProps: {
              checked: status === s,
              onChange: () => setStatus(s),
            },
          }))}
        />

        {STATUSES_WITH_COMMENT.includes(status) && (
          <div className="fr-input-group fr-mb-2v">
            <label className="fr-label" htmlFor="annotation-comment">
              Commentaire (optionnel)
            </label>
            <textarea
              id="annotation-comment"
              className="fr-input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <div className={styles.annotationActions}>
          <Button size="small" type="submit" disabled={isLoading}>
            {myAnnotation ? 'Mettre à jour' : 'Enregistrer'}
          </Button>
          {myAnnotation && (
            <Button
              size="small"
              priority="secondary"
              type="button"
              disabled={isLoading}
              onClick={handleDelete}
            >
              Supprimer mon annotation
            </Button>
          )}
        </div>

        {feedback && (
          <div className="fr-mt-2v">
            <Alert
              small
              severity={feedback.severity}
              description={feedback.message}
            />
          </div>
        )}
      </form>
    </div>
  );
}
