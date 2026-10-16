import type { Instrumentation } from 'next';

// Sentry est désactivé en dev : on ne le charge pas du tout pour ne pas
// compiler ses ~1200 modules au démarrage du serveur.
const sentryEnabled = process.env.NODE_ENV !== 'development';

export async function register() {
  if (!sentryEnabled) return;

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  ...args
) => {
  if (!sentryEnabled) return;

  const Sentry = await import('@sentry/nextjs');
  Sentry.captureRequestError(...args);
};
