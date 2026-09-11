import { createClient } from '@private-captcha/private-captcha-js';

export type CaptchaMode = 'verify' | 'skip' | 'misconfigured';

// Private Captcha rejects requests from localhost, so local dev without the
// server API key (or the client sitekey) bypasses verification instead of
// always failing. In production, either missing is a fail-closed misconfiguration
// rather than a silent bypass.
export function captchaMode(
  hasApiKey: boolean,
  hasSitekey: boolean,
  isProduction: boolean,
): CaptchaMode {
  if (hasApiKey && hasSitekey) {
    return 'verify';
  }
  return isProduction ? 'misconfigured' : 'skip';
}

export async function verifyCaptcha(
  solution: string,
  apiKey: string,
  sitekey: string,
): Promise<boolean> {
  const client = createClient({ apiKey, timeoutMs: 10_000 });
  const result = await client.verify({ solution, sitekey });
  return result.ok();
}
