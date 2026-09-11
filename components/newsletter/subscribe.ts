const GENERIC_ERROR = 'Une erreur est survenue. Merci de réessayer plus tard.';

export async function subscribeToNewsletter(
  email: string,
  captchaSolution: string | null,
): Promise<string | null> {
  try {
    const response = await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, captchaSolution }),
    });

    if (response.ok) {
      return null;
    }

    const data = await response.json().catch(() => null);
    return data?.error || GENERIC_ERROR;
  } catch {
    return GENERIC_ERROR;
  }
}
