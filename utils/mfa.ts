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

// Response of `/auth/mfa/setup/` and `/auth/mfa/replace/setup/`
export type MfaSetup = {
  otpauth_uri: string;
  secret: string;
  qr_code_svg: string;
};

// Credentials refused by the API, e.g. a mistyped or changed password
export const isCredentialsError = (error: unknown) =>
  error instanceof RnbApiError &&
  error.status === 400 &&
  !!error.data &&
  typeof error.data === 'object' &&
  'non_field_errors' in error.data;

// Each screen heading has its own `key`, so it is a new element that takes the focus
export const focusOnMount = (heading: HTMLHeadingElement | null) =>
  heading?.focus();

// A declined suggestion is remembered in this browser, per account. It comes back
// after 30 days; the Sécurité page of Mon compte also lets the user set one up.
const SETUP_DECLINED_KEY_PREFIX = 'mfaSetupDeclined:';
const SETUP_DECLINED_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

export function declineMfaSetup(username: string) {
  try {
    localStorage.setItem(
      `${SETUP_DECLINED_KEY_PREFIX}${username}`,
      String(Date.now()),
    );
  } catch {
    // Storage unavailable (private browsing, quota): suggested again next time
  }
}

export function hasDeclinedMfaSetup(username: string): boolean {
  try {
    const declinedAt = Number(
      localStorage.getItem(`${SETUP_DECLINED_KEY_PREFIX}${username}`),
    );
    return (
      declinedAt > 0 && Date.now() - declinedAt < SETUP_DECLINED_DURATION_MS
    );
  } catch {
    return false;
  }
}

export function mfaErrorOf(error: unknown): MfaError | null {
  if (!(error instanceof RnbApiError)) return null;
  if (error.status === 429) return MfaError.Throttled;

  const { data } = error;
  const code =
    data && typeof data === 'object' && 'error' in data ? data.error : null;
  return Object.values(MfaError).find((value) => value === code) ?? null;
}
