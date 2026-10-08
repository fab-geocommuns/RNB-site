'use server';

import { ActionResult } from '@/utils/actionResult';
import {
  checkCaptcha,
  CaptchaCheck,
  CAPTCHA_REFUSED_MESSAGE,
} from '@/components/newsletter/captcha';
import {
  sendTransactionalEmail,
  TransactionalEmail,
} from '@/components/newsletter/brevo';
import {
  validateAdsAccessRequest,
  AdsAccessRequestErrors,
} from './accessRequest';

// Returns the errors the user can fix. Unexpected failures throw.
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
}): Promise<ActionResult<AdsAccessRequestErrors>> {
  // Server action arguments are untrusted at runtime, whatever the types say.
  if (
    typeof email !== 'string' ||
    !Array.isArray(inseeCodes) ||
    !inseeCodes.every((code) => typeof code === 'string') ||
    typeof organisation !== 'string'
  ) {
    throw new Error('Invalid ADS access request arguments');
  }

  const brevoApiKey = process.env.BREVO_API_KEY;
  if (!brevoApiKey) {
    throw new Error('BREVO_API_KEY is not configured');
  }

  // Validated before the captcha so an invalid request does not consume the solution.
  const validation = validateAdsAccessRequest({
    email,
    inseeCodes,
    organisation,
  });
  if (!validation.ok) {
    return { status: 'rejected', errors: validation.fieldErrors };
  }

  if ((await checkCaptcha({ captchaSolution })) === CaptchaCheck.REFUSED) {
    return {
      status: 'rejected',
      errors: { captcha: CAPTCHA_REFUSED_MESSAGE },
    };
  }

  const request = validation.value;
  await sendTransactionalEmail({
    email: TransactionalEmail.AdsAccessRequest,
    params: {
      REQUESTER_EMAIL: request.email,
      INSEE_CODES: request.inseeCodes.join(', '),
      ORGANISATION: request.organisation,
    },
    replyTo: request.email,
    apiKey: brevoApiKey,
  });

  return { status: 'success' };
}
