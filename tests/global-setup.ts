import { APP_URL } from './config';

// Next.js dev compiles a route on its first request. Left alone, that cost
// lands on whichever test happens to run first, which can exceed its
// per-test timeout. Pay it once, here, for every route a spec navigates to.
const ROUTES_TO_WARM = ['/carte', '/edition'];

export default async function globalSetup() {
  await Promise.all(
    ROUTES_TO_WARM.map((route) =>
      fetch(`${APP_URL}${route}`).catch(() => {
        // A warm-up failure isn't fatal: the route just compiles on its
        // first real use inside a test, as it would without this file.
      }),
    ),
  );
}
