'use server';

export async function changePassword(
  b64UserId: string,
  token: string,
  data: FormData,
) {
  console.log(b64UserId, token, data);

  const password = data.get('password') as string;
  const passwordConfirmation = data.get('password_confirmation') as string;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/auth/change_password/${b64UserId}/${token}/`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        password,
        password_confirmation: passwordConfirmation,
      }),
    },
  );
  return res;
}
