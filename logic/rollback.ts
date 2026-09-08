// URL de l'endpoint de rollback d'une édition (event_id), réservé aux membres du
// groupe "Rollback" côté back (voir RollbackPermission dans RNB-coeur). Le bouton de
// rollback est visible pour tout reviewer, mais l'appel peut échouer avec un 403 si le
// reviewer courant n'est pas membre de ce groupe.
export function rollbackApiUrl(eventId: string): string {
  return `${process.env.NEXT_PUBLIC_API_BASE}/editions/${eventId}/rollback/`;
}
