import { BrowserContext } from '@playwright/test';
import { encode } from 'next-auth/jwt';

const SECRET = process.env.NEXTAUTH_SECRET || 'test-secret-do-not-use-in-prod';

export type FakeUser = {
  username: string;
  accessToken: string;
  groups?: string[];
};

const DEFAULT_USER: FakeUser = {
  username: 'e2e-tester',
  accessToken: 'fake-access-token',
  groups: ['contributors'],
};

/**
 * Set a next-auth session cookie on the browser context so the test starts
 * already authenticated. Skips the entire login form / credentials-provider
 * flow.
 *
 * The Next.js process started by Playwright's webServer must use the same
 * NEXTAUTH_SECRET (set in playwright.config.ts).
 */
export async function signInAs(
  context: BrowserContext,
  user: Partial<FakeUser> = {},
) {
  const merged = { ...DEFAULT_USER, ...user };
  const token = await encode({
    token: {
      name: merged.username,
      username: merged.username,
      accessToken: merged.accessToken,
      groups: merged.groups,
    },
    secret: SECRET,
    // next-auth default max-age is 30 days; we just need it valid for the
    // test run.
    maxAge: 60 * 60,
  });

  await context.addCookies([
    {
      name: 'next-auth.session-token',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax',
      expires: Math.floor(Date.now() / 1000) + 60 * 60,
    },
  ]);
}
