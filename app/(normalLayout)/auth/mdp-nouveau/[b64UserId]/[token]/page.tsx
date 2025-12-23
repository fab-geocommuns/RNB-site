// Session
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';

// Components
import ChangePasswordForm from '@/components/ChangePasswordForm';
import pageTitle from '@/utils/pageTitle';

export const metadata = pageTitle('Réinitialiser mon mot de passe');

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ b64UserId: string; token: string }>;
}) {
  const { b64UserId, token } = await params;

  // We don't want to allow users that are already logged in to access this page
  const session = await getServerSession();
  if (session) {
    redirect('/');
  }

  return (
    <>
      <main className="fr-pt-md-14v" role="main">
        <div className="fr-container fr-container--fluid fr-mb-md-14v">
          <div className="fr-grid-row fr-grid-row--gutters">
            <div className="fr-col-12 fr-col-md-6 fr-col-lg-6 fr-col-offset-md-3">
              <div className="fr-px-md-12v ">
                <h2>Réinitialiser mon mot de passe</h2>
                <ChangePasswordForm b64UserId={b64UserId} token={token} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
