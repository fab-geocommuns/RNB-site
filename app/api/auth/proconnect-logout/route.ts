import { auth } from '@/app/api/auth/[...nextauth]/auth';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.accessToken) {
    return Response.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postLogoutRedirectUri =
    searchParams.get('post_logout_redirect_uri') ||
    new URL('/', request.url).origin;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/auth/pro_connect/logout/?post_logout_redirect_uri=${encodeURIComponent(postLogoutRedirectUri)}`,
    {
      headers: { Authorization: `Token ${session.accessToken}` },
      redirect: 'manual',
    },
  );

  const logoutUrl = res.headers.get('Location');
  if (!logoutUrl) {
    return Response.json({ error: 'Logout failed' }, { status: 502 });
  }

  return Response.json({ logout_url: logoutUrl });
}
