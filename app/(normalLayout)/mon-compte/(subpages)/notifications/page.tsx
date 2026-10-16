import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { redirect } from 'next/navigation';
import NotificationPreferences from './NotificationPreferences';
import pageTitle from '@/utils/pageTitle';
import { createRnbApi } from '@/utils/rnbApi';

export const metadata = pageTitle('Mon compte');

export default async function Page() {
  const session = await auth();
  if (!session) {
    redirect('/connexion?redirect=/mon-compte/notifications');
  }

  const { subscribed } = await createRnbApi({
    token: session.accessToken,
  }).get<{ subscribed: unknown }>('/notifications/preferences/');
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
