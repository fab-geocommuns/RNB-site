import { NextRequest, NextResponse } from 'next/server';

function cspMiddleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}' 'unsafe-hashes' 'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk='
      'sha256-zlqnbDt84zf1iSefLU/ImC54isoprH/MRiVZGskwexk=' 'sha256-WAZ6rwnC2Z9Xrf60XbMtlnD1h5BaaOqZ+PW5v9jfymI='
      'sha256-FoUNlEHrNDTVkTimMpKi8wIm6igoDL2oP/AbwYOTeAw=' 'sha256-KseMfbs3WybcZK31WKv3c63lsuQ4MEatQ83ZsDEL3co='
      'sha256-WAZ6rwnC2Z9Xrf60XbMtlnD1h5BaaOqZ+PW5v9jfymI=' 'sha256-FoUNlEHrNDTVkTimMpKi8wIm6igoDL2oP/AbwYOTeAw='
      'sha256-KseMfbs3WybcZK31WKv3c63lsuQ4MEatQ83ZsDEL3co=' 'sha256-GTxJAW4D7o+eJBdpOtI9JCcZ1dFj2N8StTYaFAsCuFs='
      'sha256-TjpYb/VnxOvLi32SI5hNoflWyYygI1iw1C4H67dkY48=' 'sha256-bMrzeHgL0qQ2X1jFVbb4P7ls6cMRmduYyYQa8Sv1Ls0='
      'sha256-lCjMHqE3IiaDPTTvB8CpEJ4ZxskjAMgw2MktviNdmAY=' 'sha256-DnWtI7kdatSgQ2hv+DVXw5bchLlYKPlDZyc2eiXJGQs='
      'sha256-DnWtI7kdatSgQ2hv+DVXw5bchLlYKPlDZyc2eiXJGQs=' 'sha256-vdK7no91CeKU8HsvKk4EtbHQg/gvc85CUyCNElQWznw='
      'sha256-Q8DjrU83+xlZbNvxXXLRrrJ2lOWjc3ky9B68DQR11+U='
      ;
    media-src 'self' blob: data: https://rnb-open.s3.fr-par.scw.cloud/ https://referentiel-national-du-batiment.ghost.io/;
    img-src 'self' blob: data: https://rnb-open.s3.fr-par.scw.cloud/ https://referentiel-national-du-batiment.ghost.io/;
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

function noopMiddleware(request: NextRequest) {
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
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
