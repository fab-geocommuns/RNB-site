export const GENERIC_ERROR =
  'Une erreur est survenue. Merci de réessayer plus tard.';

const BREVO_DOI_URL =
  'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';

// Double opt-in template and contact list of the RNB newsletter in Brevo.
const TEMPLATE_ID = 1;
const INCLUDE_LIST_IDS = [3];

export async function callBrevo({
  email,
  redirectionUrl,
  apiKey,
}: {
  email: string;
  redirectionUrl: string;
  apiKey: string;
}): Promise<Response> {
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
      return GENERIC_ERROR;
  }
}
