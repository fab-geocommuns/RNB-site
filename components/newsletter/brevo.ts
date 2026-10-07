export const GENERIC_ERROR =
  'Une erreur est survenue. Merci de réessayer plus tard.';

const BREVO_DOI_URL =
  'https://api.brevo.com/v3/contacts/doubleOptinConfirmation';

// Double opt-in template and contact list of the RNB newsletter in Brevo.
const TEMPLATE_ID = 1;
const INCLUDE_LIST_IDS = [3];

const REQUEST_TIMEOUT_MS = 10_000;

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
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
}

const BREVO_SMTP_URL = 'https://api.brevo.com/v3/smtp/email';

export enum TransactionalEmail {
  AdsAccessRequest = 'ads-access-request',
}

// Recipients are fixed per email type so the endpoint cannot be used as an open relay.
const TRANSACTIONAL_EMAILS: Record<
  TransactionalEmail,
  { templateId: number; to: string[] }
> = {
  [TransactionalEmail.AdsAccessRequest]: {
    templateId: 74,
    to: ['tech@rnb.beta.gouv.fr', 'rnb@beta.gouv.fr'],
  },
};

export async function sendTransactionalEmail({
  email,
  params,
  replyTo,
  apiKey,
}: {
  email: TransactionalEmail;
  params: Record<string, string>;
  replyTo: string;
  apiKey: string;
}): Promise<Response> {
  const { templateId, to } = TRANSACTIONAL_EMAILS[email];
  return fetch(BREVO_SMTP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': apiKey,
    },
    body: JSON.stringify({
      templateId,
      params,
      to: to.map((address) => ({ email: address })),
      replyTo: { email: replyTo },
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
