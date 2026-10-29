// Binds a ProConnect login to the browser tab that started it, so that a
// callback link forged by someone else (login CSRF) is refused.

export const LOGIN_CHECK_PARAM = 'login_check';
const STORAGE_KEY = 'proconnect_login_check';

export const createLoginCheck = (): string => {
  const value = crypto.randomUUID();
  sessionStorage.setItem(STORAGE_KEY, value);
  return value;
};

// One-shot: the stored value is removed whatever the outcome.
export const consumeLoginCheck = (received: string | null): boolean => {
  try {
    const expected = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    return expected !== null && received === expected;
  } catch {
    // Storage unavailable: the login cannot be bound, refuse it
    return false;
  }
};
