import * as Sentry from '@sentry/nextjs';
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

export enum CaptchaCheck {
  PASSED = 'passed',
  MISCONFIGURED = 'misconfigured',
  FAILED = 'failed',
  ERROR = 'error',
}

export async function checkCaptcha({
  captchaSolution,
}: {
  captchaSolution: string | null;
}): Promise<CaptchaCheck> {
  const apiKey = process.env.PRIVATE_CAPTCHA_API_KEY;
  const sitekey = process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY;

  const mode = captchaMode({
    enabled: process.env.NEXT_PUBLIC_ENABLE_CAPTCHA === 'true',
    hasApiKey: !!apiKey,
    hasSitekey: !!sitekey,
  });

  if (mode === CaptchaMode.SKIP) {
    return CaptchaCheck.PASSED;
  }
  if (mode === CaptchaMode.MISCONFIGURED) {
    return CaptchaCheck.MISCONFIGURED;
  }
  if (!captchaSolution) {
    return CaptchaCheck.FAILED;
  }

  try {
    const solved = await verifyCaptcha({
      solution: captchaSolution,
      apiKey: apiKey!,
      sitekey: sitekey!,
    });
    return solved ? CaptchaCheck.PASSED : CaptchaCheck.FAILED;
  } catch (error) {
    Sentry.captureException(error);
    return CaptchaCheck.ERROR;
  }
}

async function verifyCaptcha({
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
