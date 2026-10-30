'use server';

import { rnbApi, RnbApiError } from '@/utils/rnbApi';

export type UnsubscribeResult =
  | { status: 'success'; email: string }
  | { status: 'invalid_token' };

// Returns the expected outcomes of an unsubscribe link. Unexpected failures throw.
export async function unsubscribeFromNotifications(
  token: string,
): Promise<UnsubscribeResult> {
  // Server action arguments are untrusted at runtime, whatever the types say.
  if (typeof token !== 'string' || token === '') {
    throw new Error('Invalid unsubscribe token argument');
  }

  let data: { email?: unknown } | null;
  try {
    data = await rnbApi.post<{ email?: unknown } | null>(
      '/notifications/unsubscribe/',
      { token },
    );
  } catch (err) {
    if (err instanceof RnbApiError) {
      if (err.status === 400) return { status: 'invalid_token' };
      // Le message de l'API n'est pas repris : il pourrait contenir le jeton.
      throw new Error(`POST notifications/unsubscribe failed: ${err.status}`);
    }
    throw err;
  }

  const email = data?.email;
  if (typeof email !== 'string') {
    throw new Error('POST notifications/unsubscribe returned no email');
  }
  return { status: 'success', email };
}
