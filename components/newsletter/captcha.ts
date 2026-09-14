import { createClient } from '@private-captcha/private-captcha-js';

export enum CaptchaMode {
  VERIFY = 'verify',
  SKIP = 'skip',
  MISCONFIGURED = 'misconfigured',
}

export function captchaMode({
  enabled,
  hasApiKey,
  hasSitekey,
}: {
  enabled: boolean;
  hasApiKey: boolean;
  hasSitekey: boolean;
}): CaptchaMode {
  if (!enabled) {
    return CaptchaMode.SKIP;
  }
  return hasApiKey && hasSitekey
    ? CaptchaMode.VERIFY
    : CaptchaMode.MISCONFIGURED;
}

export async function verifyCaptcha({
  solution,
  apiKey,
  sitekey,
}: {
  solution: string;
  apiKey: string;
  sitekey: string;
}): Promise<boolean> {
  const client = createClient({ apiKey, timeoutMs: 10_000 });
  // Default is 5 attempts with backoff: up to ~1 min while the user waits.
  const result = await client.verify({ solution, sitekey, attempts: 2 });
  return result.ok();
}
