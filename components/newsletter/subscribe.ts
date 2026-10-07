'use server';

import { checkCaptcha, CaptchaCheck } from './captcha';
import { callBrevo, mapBrevoErrorCode, GENERIC_ERROR } from './brevo';

export async function subscribeToNewsletter({
  email,
  captchaSolution,
}: {
  email: string;
  captchaSolution: string | null;
}): Promise<string | null> {
  const brevoApiKey = process.env.BREVO_API_KEY;

  if (!brevoApiKey) {
    return "La newsletter n'est pas configurée.";
  }

  switch (await checkCaptcha({ captchaSolution })) {
    case CaptchaCheck.MISCONFIGURED:
      return "La newsletter n'est pas configurée.";
    case CaptchaCheck.FAILED:
      return 'Vérification anti-robot invalide.';
    case CaptchaCheck.ERROR:
      return GENERIC_ERROR;
  }

  const redirectionUrl = new URL('/', process.env.NEXTAUTH_URL).toString();

  let response: Response;
  try {
    response = await callBrevo({ email, redirectionUrl, apiKey: brevoApiKey });
  } catch {
    return GENERIC_ERROR;
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return mapBrevoErrorCode(data.code);
  }

  return null;
}
