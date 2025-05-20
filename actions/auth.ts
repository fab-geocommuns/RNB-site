'use server';

export async function changePassword(
  b64UserId: string,
  token: string,
  new_pwd: string,
  new_pwd_confirmation: string,
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/auth/change_password/${b64UserId}/${token}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password: new_pwd,
        confirm_password: new_pwd_confirmation,
      }),
    },
  );

  const resData = await res.json();

  console.log('Change password response', resData);

  return {
    response_code: res.status,
    error: resData?.error,
  };
}
