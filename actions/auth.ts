'use server';

export async function changePassword(
  b64UserId: string,
  token: string,
  newPwd: string,
  newPwdConfirmation: string,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/auth/change_password/${b64UserId}/${token}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: newPwd,
        confirm_password: newPwdConfirmation,
      }),
    },
  );

  // Check if the response is successful
  // If the response is not 204, we need to parse the response body
  let resData;
  if (res.status !== 204) {
    resData = await res.json();
  }

  return {
    response_code: res.status,
    error: resData?.error,
  };
}
