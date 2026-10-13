import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import NotificationPreferences from '@/components/notifications/NotificationPreferences';
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Mon compte');

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/connexion?redirect=/mon-compte/notifications');
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/notifications/preferences/`,
    {
      headers: {
        Authorization: 'Token ' + session.accessToken,
        'Content-Type': 'application/json',
      },
    },
  );
  if (!response.ok) {
    throw new Error(`GET notifications/preferences failed: ${response.status}`);
  }
  const { subscribed } = await response.json();
  if (typeof subscribed !== 'boolean') {
    throw new Error(
      'GET notifications/preferences returned no subscribed flag',
    );
  }

  return (
    <>
      <h1>Notifications</h1>
      <NotificationPreferences initialSubscribed={subscribed} />
    </>
  );
}
