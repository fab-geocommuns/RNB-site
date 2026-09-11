const BREVO_DOI_URL =
  'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';

// Hardcoded per the newsletter's own Brevo template/list, not per-environment config.
const TEMPLATE_ID = 1;
const INCLUDE_LIST_IDS = [3];

export async function callBrevo(
  email: string,
  redirectionUrl: string,
  apiKey: string,
): Promise<Response> {
  return fetch(BREVO_DOI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      email,
      redirectionUrl,
      templateId: TEMPLATE_ID,
      includeListIds: INCLUDE_LIST_IDS,
    }),
    signal: AbortSignal.timeout(10_000),
  });
}

export function mapBrevoErrorCode(code: string | undefined): string {
  switch (code) {
    case 'invalid_parameter':
      return 'Adresse email invalide';
    default:
      return 'Une erreur est survenue. Merci de réessayer plus tard.';
  }
}
