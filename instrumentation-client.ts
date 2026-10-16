// Sentry est désactivé en dev : on ne le charge pas du tout pour ne pas
// l'ajouter au bundle client de chaque route.
// La condition est remplacée à la compilation, l'import disparaît en dev.
const sentry =
  process.env.NODE_ENV !== 'development'
    ? import('./sentry.client.config')
    : null;

// Instrumente les navigations du routeur App Router (requis depuis Sentry v9).
export function onRouterTransitionStart(
  ...args: Parameters<
    typeof import('./sentry.client.config').onRouterTransitionStart
  >
) {
  sentry?.then((s) => s.onRouterTransitionStart(...args));
}
