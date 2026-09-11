import { captchaMode, verifyCaptcha } from './captcha';
import { callBrevo, mapBrevoErrorCode } from './brevo';

const GENERIC_ERROR = 'Une erreur est survenue. Merci de réessayer plus tard.';

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "La newsletter n'est pas configurée." },
      { status: 500 },
    );
  }

  const sitekey = process.env.NEXT_PUBLIC_PRIVATE_CAPTCHA_SITEKEY;

  let email: string, captchaSolution: string;
  try {
    ({ email, captchaSolution } = await request.json());
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 500 });
  }

  const mode = captchaMode(
    !!process.env.PRIVATE_CAPTCHA_API_KEY,
    !!sitekey,
    process.env.NODE_ENV === 'production',
  );

  if (mode === 'misconfigured') {
    return Response.json(
      { error: "La newsletter n'est pas configurée." },
      { status: 500 },
    );
  }

  if (mode === 'verify') {
    let solved: boolean;
    try {
      solved = await verifyCaptcha(
        captchaSolution,
        process.env.PRIVATE_CAPTCHA_API_KEY!,
        sitekey!,
      );
    } catch {
      return Response.json({ error: GENERIC_ERROR }, { status: 500 });
    }
    if (!solved) {
      return Response.json(
        { error: 'Vérification anti-robot invalide.' },
        { status: 400 },
      );
    }
  }

  const redirectionUrl = new URL('/', process.env.NEXTAUTH_URL).toString();

  let response: Response;
  try {
    response = await callBrevo(email, redirectionUrl, apiKey);
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 502 });
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    return Response.json(
      { error: mapBrevoErrorCode(data.code) },
      { status: response.status },
    );
  }

  return Response.json({ success: true });
}
