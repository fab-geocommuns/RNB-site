'use server';

import { checkCaptcha, CaptchaCheck } from '@/components/newsletter/captcha';
import {
  sendTransactionalEmail,
  TransactionalEmail,
  GENERIC_ERROR,
} from '@/components/newsletter/brevo';
import {
  validateAdsAccessRequest,
  AdsAccessRequestFieldErrors,
} from './accessRequest';

type RequestAdsAccessResult =
  | { ok: true }
  | { ok: false; error?: string; fieldErrors?: AdsAccessRequestFieldErrors };

const NOT_CONFIGURED_ERROR = "Le formulaire n'est pas configuré.";

export async function requestAdsAccess({
  email,
  inseeCodes,
  organisation,
  captchaSolution,
}: {
  email: string;
  inseeCodes: string[];
  organisation: string;
  captchaSolution: string | null;
}): Promise<RequestAdsAccessResult> {
  // Server action arguments are untrusted at runtime, whatever the types say.
  if (
    typeof email !== 'string' ||
    !Array.isArray(inseeCodes) ||
    !inseeCodes.every((code) => typeof code === 'string') ||
    typeof organisation !== 'string'
  ) {
    return { ok: false, error: GENERIC_ERROR };
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    return { ok: false, error: NOT_CONFIGURED_ERROR };
  }

  // Validated before the captcha so an invalid request does not consume the solution.
  const validation = validateAdsAccessRequest({
    email,
    inseeCodes,
    organisation,
  });
  if (!validation.ok) {
    return { ok: false, fieldErrors: validation.fieldErrors };
  }

  switch (await checkCaptcha({ captchaSolution })) {
    case CaptchaCheck.MISCONFIGURED:
      return { ok: false, error: NOT_CONFIGURED_ERROR };
    case CaptchaCheck.FAILED:
      return { ok: false, error: 'Vérification anti-robot invalide.' };
    case CaptchaCheck.ERROR:
      return { ok: false, error: GENERIC_ERROR };
  }

  const request = validation.value;

  let response: Response;
  try {
    response = await sendTransactionalEmail({
      email: TransactionalEmail.AdsAccessRequest,
      params: {
        REQUESTER_EMAIL: request.email,
        INSEE_CODES: request.inseeCodes.join(', '),
        ORGANISATION: request.organisation,
      },
      replyTo: request.email,
      apiKey: brevoApiKey,
    });
  } catch {
    return { ok: false, error: GENERIC_ERROR };
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    console.error(
      `Brevo ADS access request failed: HTTP ${response.status}, code ${data.code}`,
    );
    return { ok: false, error: GENERIC_ERROR };
  }

  return { ok: true };
}
