'use server';

import { rnbApi, RnbApiError } from '@/utils/rnbApi';

export async function changePassword(
  b64UserId: string,
  token: string,
  newPwd: string,
  newPwdConfirmation: string,
) {
  try {
    await rnbApi.patch(`/auth/change_password/${b64UserId}/${token}`, {
      password: newPwd,
      confirm_password: newPwdConfirmation,
    });
    return { response_code: 204, error: undefined };
  } catch (err) {
    if (!(err instanceof RnbApiError)) throw err;
    const data = err.data as { error?: string[] } | null;
    return {
      response_code: err.status,
      error: data && typeof data === 'object' ? data.error : undefined,
    };
  }
}
