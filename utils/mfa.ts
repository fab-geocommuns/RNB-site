import { RnbApiError } from '@/utils/rnbApi';

// Error codes returned by the RNB-coeur `/login/` and `/auth/mfa/*` endpoints,
// plus `Throttled` for their shared rate limit (HTTP 429, no error code).
export enum MfaError {
  Required = 'mfa_required',
  Invalid = 'mfa_invalid',
  SetupRequired = 'mfa_setup_required',
  SetupNotStarted = 'mfa_setup_not_started',
  AlreadyConfigured = 'mfa_already_configured',
  Throttled = 'login_throttled',
}

export const MFA_INVALID_MESSAGE =
  'Code incorrect ou expiré. Patientez quelques secondes avant de réessayer.';

export const THROTTLED_MESSAGE =
  'Trop de tentatives. Réessayez dans une minute.';

export function mfaErrorOf(error: unknown): MfaError | null {
  if (!(error instanceof RnbApiError)) return null;
  if (error.status === 429) return MfaError.Throttled;

  const { data } = error;
  const code =
    data && typeof data === 'object' && 'error' in data ? data.error : null;
  return Object.values(MfaError).find((value) => value === code) ?? null;
}
