'use server';

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

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/notifications/unsubscribe/`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    },
  );

  if (response.status === 400) {
    return { status: 'invalid_token' };
  }
  if (!response.ok) {
    throw new Error(
      `POST notifications/unsubscribe failed: ${response.status}`,
    );
  }

  const { email } = await response.json();
  if (typeof email !== 'string') {
    throw new Error('POST notifications/unsubscribe returned no email');
  }
  return { status: 'success', email };
}
