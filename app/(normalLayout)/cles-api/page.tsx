// Session

import { auth } from '@/app/api/auth/[...nextauth]/auth';

// Redirect
import { redirect } from 'next/navigation';

export default async function Page() {
  // We don't want to allow users that are already logged in to access this page
  const session = await auth();
  if (!session) {
    redirect('/login?redirect=/cles-api');
  }

  console.log('-- session in page');
  console.log(session);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/auth/users/me/tokens`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Token ' + (session as any).accessToken,
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();

  return (
    <div>
      <h1>Mes clés d'API</h1>
      <p>session token {session?.accessToken}</p>
      <p>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </p>
      <p>API Production : {data.production_token}</p>
      <p>API Sandbox : {data.sandbox_token}</p>
    </div>
  );
}
