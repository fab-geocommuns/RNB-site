'use server';

import * as Sentry from '@sentry/nextjs';
import { checkCaptcha, CaptchaCheck } from './captcha';
import {
  BREVO_INVALID_PARAMETER_CODE,
  BrevoError,
  callBrevo,
  mapBrevoErrorCode,
  GENERIC_ERROR,
} from './brevo';

const NOT_CONFIGURED_ERROR = "La newsletter n'est pas configurée.";

export async function subscribeToNewsletter({
  email,
  captchaSolution,
}: {
  email: string;
  captchaSolution: string | null;
}): Promise<string | null> {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    Sentry.captureException(new Error('BREVO_API_KEY is not configured'));
    return NOT_CONFIGURED_ERROR;
  }

  switch (await checkCaptcha({ captchaSolution })) {
    case CaptchaCheck.MISCONFIGURED:
      Sentry.captureException(new Error('Captcha is misconfigured'));
      return NOT_CONFIGURED_ERROR;
    case CaptchaCheck.FAILED:
      return 'Vérification anti-robot invalide.';
    case CaptchaCheck.ERROR:
      return GENERIC_ERROR;
  }

  const redirectionUrl = new URL('/', process.env.NEXTAUTH_URL).toString();

  let response: Response;
  try {
    response = await callBrevo({ email, redirectionUrl, apiKey: brevoApiKey });
  } catch (error) {
    Sentry.captureException(error);
    return GENERIC_ERROR;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    if (data.code !== BREVO_INVALID_PARAMETER_CODE) {
      Sentry.captureException(
        new BrevoError(
          response.status,
          typeof data.code === 'string' ? data.code : undefined,
        ),
      );
    }
    return mapBrevoErrorCode(data.code);
  }

  return null;
}
