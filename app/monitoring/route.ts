import { NextResponse } from 'next/server';

// Sentry tunnel for self-hosted instance.
// The built-in tunnelRoute only supports Sentry SaaS (sentry.io).
// See: https://github.com/getsentry/sentry-javascript/issues/7061
const SENTRY_HOST = 'sentry.incubateur.net';
const SENTRY_PROJECT_IDS = ['149'];

export async function POST(request: Request) {
  try {
    const envelope = await request.text();
    const header = JSON.parse(envelope.split('\n')[0]);

    const dsn = new URL(header.dsn);
    if (dsn.hostname !== SENTRY_HOST) {
      return NextResponse.json({ error: 'Invalid host' }, { status: 400 });
    }

    const projectId = dsn.pathname.replace('/', '');
    if (!SENTRY_PROJECT_IDS.includes(projectId)) {
      return NextResponse.json({ error: 'Invalid project' }, { status: 400 });
    }

    const sentryUrl = `https://${SENTRY_HOST}/api/${projectId}/envelope/`;
    const response = await fetch(sentryUrl, {
      method: 'POST',
      body: envelope,
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
    });

    return new NextResponse(response.body, { status: response.status });
  } catch {
    return NextResponse.json({ error: 'Invalid envelope' }, { status: 400 });
  }
}
