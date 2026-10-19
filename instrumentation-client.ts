// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://c2aa9d4f229e4165b410251d58c88e00@sentry.incubateur.net/149',

  // Route browser requests through a Next.js rewrite to circumvent ad-blockers.
  // Must match tunnelRoute in next.config.js
  tunnel: '/monitoring',

  // Replay is lazy loaded below, to keep it out of the initial bundle

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 0.1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  enabled: process.env.NODE_ENV !== 'development',
});

// Replay (~40 kB gzipped) is fetched from the Sentry CDN once the page is idle.
// Errors thrown before it is loaded have no replay attached.
function loadReplay() {
  Sentry.lazyLoadIntegration('replayIntegration')
    .then((replayIntegration) => Sentry.addIntegration(replayIntegration()))
    .catch((error) => console.error('Failed to load Sentry Replay:', error));
}

if (process.env.NODE_ENV !== 'development' && typeof window !== 'undefined') {
  const scheduleReplay = () =>
    'requestIdleCallback' in window
      ? window.requestIdleCallback(loadReplay, { timeout: 5000 })
      : setTimeout(loadReplay, 1000);
  if (document.readyState === 'complete') scheduleReplay();
  else window.addEventListener('load', scheduleReplay, { once: true });
}

// Instrumente les navigations du routeur App Router (requis depuis Sentry v9).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
