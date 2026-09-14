'use server';

import { captchaMode, verifyCaptcha, CaptchaMode } from './captcha';
import { callBrevo, mapBrevoErrorCode, GENERIC_ERROR } from './brevo';

export async function subscribeToNewsletter({
  email,
  captchaSolution,
}: {
  email: string;
  captchaSolution: string | null;
}): Promise<string | null> {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const captchaApiKey = process.env.PRIVATE_CAPTCHA_API_KEY;
  const sitekey = process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY;

  const mode = captchaMode({
    enabled: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === 'true',
    hasApiKey: !!captchaApiKey,
    hasSitekey: !!sitekey,
  });

  if (!brevoApiKey || mode === CaptchaMode.MISCONFIGURED) {
    return "La newsletter n'est pas configurée.";
  }

  if (mode === CaptchaMode.VERIFY) {
    let solved = false;
    try {
      solved =
        !!captchaSolution &&
        (await verifyCaptcha({
          solution: captchaSolution,
          apiKey: captchaApiKey!,
          sitekey: sitekey!,
        }));
    } catch {
      return GENERIC_ERROR;
    }
    if (!solved) {
      return 'Vérification anti-robot invalide.';
    }
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
