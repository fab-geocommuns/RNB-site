import { NextRequest, NextResponse } from 'next/server';

// Taken from https://nextjs.org/docs/app/guides/content-security-policy
function cspMiddleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const isDev = process.env.NODE_ENV === 'development';
  const rnbApiOrigin = new URL(process.env.NEXT_PUBLIC_API_BASE!).origin;
  const banApiOrigins = [
    'https://api-adresse.data.gouv.fr/',
    'https://plateforme.adresse.data.gouv.fr',
  ];
  const tileOrigins = [
    'https://data.geopf.fr/',
    'https://openmaptiles.geo.data.gouv.fr/',
    'https://openmaptiles.github.io/',
  ];
  const sentryOrigin = 'https://sentry.incubateur.net/';
  const connectOrigins = [
    rnbApiOrigin,
    ...banApiOrigins,
    ...tileOrigins,
    sentryOrigin,
  ];
  const frameOrigins = ['https://rnb-api.beta.gouv.fr/'];
  const mediaOrigins = [
    'https://rnb-open.s3.fr-par.scw.cloud/',
    'https://referentiel-national-du-batiment.ghost.io/',
  ];
  // We allow `unsafe-inline` for the style-src directive because of https://github.com/vercel/next.js/issues/57415
  // When it's fixed, we can remove it.
  const cspHeader = `
    default-src 'self';
    frame-src 'self' ${frameOrigins.join(' ')};
    connect-src 'self' ${connectOrigins.join(' ')};
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' ${isDev ? "'unsafe-eval'" : ''};
    style-src 'self' 'unsafe-inline';
    media-src 'self' blob: data: ${mediaOrigins.join(' ')};
    img-src 'self' blob: data: ${mediaOrigins.join(' ')};
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
`;
  // Replace newline characters and spaces
  const contentSecurityPolicyHeaderValue = cspHeader
    .replace(/\s{2,}/g, ' ')
    .trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  requestHeaders.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
  response.headers.set(
    'Content-Security-Policy',
    contentSecurityPolicyHeaderValue,
  );

  return response;
}

export function middleware(request: NextRequest) {
  return cspMiddleware(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
