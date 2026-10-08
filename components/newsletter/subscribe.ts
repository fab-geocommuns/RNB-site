'use server';

import { ActionResult } from '@/utils/actionResult';
import { checkCaptcha, CaptchaCheck, CAPTCHA_REFUSED_MESSAGE } from './captcha';
import { BREVO_INVALID_PARAMETER_CODE, BrevoError, callBrevo } from './brevo';

type NewsletterErrors = { email?: string; captcha?: string };

// Returns the errors the user can fix. Unexpected failures throw.
export async function subscribeToNewsletter({
  email,
  captchaSolution,
}: {
  email: string;
  captchaSolution: string | null;
}): Promise<ActionResult<NewsletterErrors>> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  if ((await checkCaptcha({ captchaSolution })) === CaptchaCheck.REFUSED) {
    return {
      status: 'rejected',
      errors: { captcha: CAPTCHA_REFUSED_MESSAGE },
    };
  }

  const redirectionUrl = new URL('/', process.env.NEXTAUTH_URL).toString();

  try {
    await callBrevo({ email, redirectionUrl, apiKey: brevoApiKey });
  } catch (error) {
    if (
      error instanceof BrevoError &&
      error.code === BREVO_INVALID_PARAMETER_CODE
    ) {
      return {
        status: 'rejected',
        errors: { email: 'Adresse email invalide' },
      };
    }
    throw error;
  }

  return { status: 'success' };
}
