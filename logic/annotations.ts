import {
  AnnotationStatus,
  EditionAnnotation,
} from '@/app/(fullscreenMap)/batiments/[id]/historique/page';

export const ANNOTATION_STATUSES: AnnotationStatus[] = [
  'correct',
  'uncertain',
  'incorrect',
];

export const ANNOTATION_STATUS_LABELS: Record<AnnotationStatus, string> = {
  correct: 'Correcte',
  uncertain: 'Incertaine',
  incorrect: 'Fausse',
};

// Les statuts pour lesquels l'UI propose un commentaire (le back l'accepte pour
// tous, mais on ne le demande que pour les cas justifiant une explication).
export const STATUSES_WITH_COMMENT: AnnotationStatus[] = [
  'uncertain',
  'incorrect',
];

// Variante de badge DSFR (fr-badge--<severity>) par statut.
export const ANNOTATION_STATUS_SEVERITY: Record<AnnotationStatus, string> = {
  correct: 'success',
  uncertain: 'new',
  incorrect: 'error',
};

export function annotationsApiUrl(eventId: string): string {
  return `${process.env.NEXT_PUBLIC_API_BASE}/editions/${eventId}/annotations/`;
}

export function findMyAnnotation(
  annotations: EditionAnnotation[],
  username?: string | null,
): EditionAnnotation | undefined {
  if (!username) return undefined;
  return annotations.find((a) => a.reviewer.username === username);
}

// Statut « le plus grave » présent parmi les annotations, pour piloter la
// pastille de la timeline (incorrect > uncertain > correct).
export function worstAnnotationStatus(
  annotations: EditionAnnotation[],
): AnnotationStatus | null {
  if (annotations.some((a) => a.status === 'incorrect')) return 'incorrect';
  if (annotations.some((a) => a.status === 'uncertain')) return 'uncertain';
  if (annotations.some((a) => a.status === 'correct')) return 'correct';
  return null;
}
