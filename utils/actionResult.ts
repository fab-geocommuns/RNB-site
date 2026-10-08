export type ActionResult<TErrors> =
  | { status: 'success' }
  | { status: 'rejected'; errors: TErrors };

export const UNEXPECTED_ERROR_MESSAGE =
  'Une erreur est survenue. Merci de réessayer plus tard.';
